"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { RefObject } from "react"
import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult, ObjectDetector, type ObjectDetectorResult, PoseLandmarker, type PoseLandmarkerResult, HandLandmarker, type HandLandmarkerResult } from "@mediapipe/tasks-vision"
import { EyeAnalyzer } from "@/lib/analysis/eye-analyzer"
import { MouthAnalyzer } from "@/lib/analysis/mouth-analyzer"
import { HeadPoseAnalyzer } from "@/lib/analysis/head-pose-analyzer"
import { ObjectAnalyzer } from "@/lib/analysis/object-analyzer"
import { OcclusionAnalyzer } from "@/lib/analysis/occlusion-analyzer"
import { CardiacAnalyzer } from "@/lib/analysis/cardiac-analyzer"

interface DetectionData {
  eyeClosureTime: number
  yawnCount: number
  headMovement: number
  alertCount: number
  eyeAspectRatio: number
  mouthAspectRatio: number
  blinkFrequency: number
  yawnDuration: number
  isDistracted: boolean
  distractionDirection: "none" | "left" | "right"
  alertReason: string | null
  isPhoneDetected: boolean
  isOccluded: boolean
  occlusionDuration: number
  cardiacDistressDetected: boolean
  emergencyConfirmed: boolean
  emergencyConfidence: number
}

type RiskLevel = "inactive" | "safe" | "warning" | "critical"

export function useDrowsinessDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  isAudioEnabled: boolean,
) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [detectionData, setDetectionData] = useState<DetectionData>({
    eyeClosureTime: 0,
    yawnCount: 0,
    headMovement: 0,
    alertCount: 0,
    eyeAspectRatio: 0,
    mouthAspectRatio: 0,
    blinkFrequency: 0,
    yawnDuration: 0,
    isDistracted: false,
    distractionDirection: "none",
    alertReason: null,
    isPhoneDetected: false,
    isOccluded: false,
    occlusionDuration: 0,
    cardiacDistressDetected: false,
    emergencyConfirmed: false,
    emergencyConfidence: 0,
  })
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("inactive")
  const [riskScore, setRiskScore] = useState(0)
  const [shouldAlert, setShouldAlert] = useState(false)
  const [maxRiskScore, setMaxRiskScore] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const objectDetectorRef = useRef<ObjectDetector | null>(null)
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  
  // Analyzers
  const eyeAnalyzer = useRef(new EyeAnalyzer())
  const mouthAnalyzer = useRef(new MouthAnalyzer())
  const headPoseAnalyzer = useRef(new HeadPoseAnalyzer())
  const objectAnalyzer = useRef(new ObjectAnalyzer())
  const occlusionAnalyzer = useRef(new OcclusionAnalyzer())
  const cardiacAnalyzer = useRef(new CardiacAnalyzer())
  const smallCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const alertCountRef = useRef(0)
  const maxRiskScoreRef = useRef(0)
  const alertEndTimeRef = useRef(0)
  const lastAlertTimeRef = useRef(0)
  const lastAlertReasonRef = useRef<string | null>(null)
  const lastNoFaceTimeRef = useRef(0)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const requestRef = useRef<number>(0)
  const lastVideoTimeRef = useRef<number>(-1)

  const sessionStartTimeRef = useRef<number | null>(null)
  
  // Results persistence
  const lastPoseLandmarksRef = useRef<any[]>([])
  const lastHandLandmarksRef = useRef<any[][]>([])
  const lastDetectedObjectsRef = useRef<any[]>([])
  const frameCounterRef = useRef(0)

  const playAlertSound = useCallback(() => {
    if (!isAudioEnabled) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const context = audioContextRef.current
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)

      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.5)
    } catch (err) {
      console.error("Audio playback error:", err)
    }
  }, [isAudioEnabled])

  const speakAlert = useCallback(
    (message: string) => {
      if (!isAudioEnabled || !window.speechSynthesis) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.2
      utterance.pitch = 1
      utterance.volume = 0.8
      window.speechSynthesis.speak(utterance)
    },
    [isAudioEnabled],
  )

    const processValues = useCallback(
    (landmarks: any[] | any, detectedObjects: any[] = [], poseLandmarks: any[] = [], handLandmarks: any[][] = []) => {
        const currentTime = Date.now()
        const video = videoRef.current
        const width = video ? video.videoWidth : 1280
        const height = video ? video.videoHeight : 720
        
        let currentState: Partial<DetectionData> = {}
        let newRiskLevel: RiskLevel = "safe"
        let newShouldAlert = false
        let currentAlertReason: string | null = null
        let totalScore = 0

        // Common Logic for Alert Triggering
        const triggerAlert = (reason: string, isCritical: boolean = false) => {
             alertEndTimeRef.current = currentTime + 3000
             currentAlertReason = reason
             newShouldAlert = true
             if (isCritical) newRiskLevel = "critical"
             // If not critical (e.g. Warning), check if we should escalate based on score or keep warning
             else if (newRiskLevel !== "critical") newRiskLevel = "warning"

             // Audio Alert Logic
             if (currentTime - lastAlertTimeRef.current > 5000) {
               const shouldPlayAudio = isCritical || (reason !== "No Face Detected" && newRiskLevel === "critical")
               // We play audio if Critical OR if it's a persistent warning that isn't just "No Face"
               // Actually user wants "msg" for "no face", implies visual. 
               // "Camera Blocked" is critical -> Audio.
               
               if (shouldPlayAudio) {
                  playAlertSound()
                  const spokenReason = reason === "Camera Blocked" ? "Camera Blocked" : reason
                  speakAlert(`Alert! ${spokenReason} detected.`)
               }
               
               // Only increment alert count for "real" alerts, not just status updates?
               // Let's count all for now.
               alertCountRef.current += 1
               lastAlertTimeRef.current = currentTime
             }
        }

        // --- BRANCH 0: Emergency Analysis (Always Run) ---
        // Run Cardiac analysis regardless of Face Detection
        const cardiacResult = cardiacAnalyzer.current.process(poseLandmarks, handLandmarks, currentTime)

        let emergencyPreempt = false
        let emergencyReason: string | null = null
        
        if (cardiacResult.cardiacDistressDetected) {
             const isEmergency = cardiacResult.confidence > 0.9
             
             if (isEmergency) {
                 emergencyPreempt = true
                 emergencyReason = "CARDIAC DISTRESS"
                 if (emergencyReason) triggerAlert(emergencyReason, true)
             }
        }

        // --- BRANCH 1: Face DETECTED ---
        // Note: landmarks can be an array (from direct result) or an object (if we passed single face). 
        // MediaPipe results.faceLandmarks is Array<Array<Landmark>>. We usually pass results.faceLandmarks[0].
        // So 'landmarks' here is Array<Landmark> (length 468 or 478).
        const hasFace = landmarks && landmarks.length > 0

        if (hasFace) {
            // FIX: Immediately clear sticky alerts related to absence/blocking if face is found
            if (lastAlertReasonRef.current === "Camera Blocked" || lastAlertReasonRef.current === "No Face Detected") {
                alertEndTimeRef.current = 0 // Kill the sticky duration
                lastAlertReasonRef.current = null
                currentAlertReason = null
                newShouldAlert = false // Reset alert state
            }

            // Reset Occlusion Analyzer when face is found
            occlusionAnalyzer.current.reset()
            lastNoFaceTimeRef.current = 0

            // 1. Run Analyzers
            const headResult = headPoseAnalyzer.current.process(landmarks, currentTime)
            const eyeResult = eyeAnalyzer.current.process(landmarks, currentTime, width, height)
            const mouthResult = mouthAnalyzer.current.process(landmarks, currentTime, width, height, headResult.isDistracted)
            const objectResult = objectAnalyzer.current.process(detectedObjects, currentTime)

            // 2. Calculate Risk Scores
            const eyeScore = Math.min((eyeResult.eyeClosureTime / 3) * 80, 80)
            const yawnScore = Math.min((mouthResult.yawnCount / 3) * 30, 30)
            
            let headScore = 0
            let distractionScore = 0
            let phoneScore = 0

            if (objectResult.isPhoneDetected) {
                phoneScore = 30 
                if (objectResult.phoneDuration > 5) phoneScore = 80
            }

            if (!headResult.isDistracted) {
                 headScore = Math.min((Math.abs(headResult.headAngle) / 25) * 30, 30)
            } else {
                 distractionScore = 30
                 if (headResult.distractionDuration > 5) distractionScore = 80
            }
            
            totalScore = Math.round(eyeScore + yawnScore + headScore + distractionScore + phoneScore)

            // 3. Determine Risk
            if (totalScore >= 70) {
                newRiskLevel = "critical"
                newShouldAlert = true
                if (phoneScore >= 80) currentAlertReason = "Using Mobile"
                else if (distractionScore >= 80) currentAlertReason = "Distracted Driving"
                else if (eyeScore >= 50) currentAlertReason = "Eyes Closed"
                else if (yawnScore >= 20) currentAlertReason = "Frequent Yawning"
                else if (headScore >= 20) currentAlertReason = "Head Nodding"
                else currentAlertReason = "High Drowsiness"
                
                triggerAlert(currentAlertReason, true)
            } else if (totalScore >= 40) {
                newRiskLevel = "warning"
                if (currentTime - lastAlertTimeRef.current > 10000) {
                   if (eyeScore >= 40) currentAlertReason = "Drowsy Eyes"
                   else if (yawnScore >= 15) currentAlertReason = "Yawning"
                   else currentAlertReason = "Signs of Drowsiness"
                   triggerAlert(currentAlertReason, false)
                }
            }

            currentState = {
                eyeClosureTime: eyeResult.eyeClosureTime,
                yawnCount: mouthResult.yawnCount,
                headMovement: headResult.headAngle,
                eyeAspectRatio: eyeResult.ear,
                mouthAspectRatio: mouthResult.mar,
                blinkFrequency: sessionStartTimeRef.current ? (eyeResult.blinkCount / (Math.max((currentTime - sessionStartTimeRef.current) / 60000, 0.1))) : 0, 
                yawnDuration: mouthResult.yawnDuration,
                isDistracted: headResult.isDistracted,
                distractionDirection: headResult.distractionDirection,
                isPhoneDetected: objectResult.isPhoneDetected,
                isOccluded: false,
                occlusionDuration: 0,
                cardiacDistressDetected: cardiacResult.cardiacDistressDetected,
                emergencyConfirmed: (cardiacResult.confidence > 0.9),
                emergencyConfidence: cardiacResult.confidence
            }
        
        // --- BRANCH 2: NO Face Detected ---
        } else {
            // Check for Occlusion / Tampering
            let occlusionDuration = 0
            let isOccluded = false

            if (video && smallCanvasRef.current) {
                // Draw small frame for analysis
                const smCtx = smallCanvasRef.current.getContext('2d')
                if (smCtx && video.videoWidth > 0) {
                    smCtx.drawImage(video, 0, 0, 64, 64)
                    const imageData = smCtx.getImageData(0, 0, 64, 64)
                    const occlusionResult = occlusionAnalyzer.current.process(imageData, currentTime)
                    isOccluded = occlusionResult.isOccluded
                    occlusionDuration = occlusionResult.occlusionDuration
                }
            }

            if (isOccluded) {
                // Case A: Camera Blocked / Tampering
                if (occlusionDuration > 3) { // 3 seconds threshold
                    totalScore = 100 // Max risk
                    currentAlertReason = "Camera Blocked"
                    triggerAlert("Camera Blocked", true)
                }
            } else {
                // Case B: No Face Detected (Simulating absence/warning)
                if (lastNoFaceTimeRef.current === 0) {
                    lastNoFaceTimeRef.current = currentTime
                }
                
                // Show warning after 2 seconds of no face
                if (currentTime - lastNoFaceTimeRef.current > 2000) {
                     if (currentTime - lastAlertTimeRef.current > 3000) { // Throttled updates
                        currentAlertReason = "No Face Detected"
                        newRiskLevel = "warning"
                        newShouldAlert = true
                        // Visual only, no audio in triggerAlert logic due to !Critical
                     }
                }
            }

            currentState = {
                eyeAspectRatio: 0,
                mouthAspectRatio: 0,
                headMovement: 0,
                isDistracted: false,
                isPhoneDetected: false,
                isOccluded: isOccluded,
                occlusionDuration: occlusionDuration,
                cardiacDistressDetected: cardiacResult.cardiacDistressDetected,
                emergencyConfirmed: (cardiacResult.confidence > 0.9),
                emergencyConfidence: cardiacResult.confidence
            }
        }

        // 3. Update Max Risk Score
        maxRiskScoreRef.current = Math.max(maxRiskScoreRef.current, totalScore)
        setMaxRiskScore(maxRiskScoreRef.current)

        // Maintain alert state if within sticky duration
        if (currentTime < alertEndTimeRef.current && !currentAlertReason) {
            newShouldAlert = true
            currentAlertReason = lastAlertReasonRef.current
        }

        // Save reason
        if (currentAlertReason) lastAlertReasonRef.current = currentAlertReason

        // 5. Update State
          // If emergency, override logic (Before State Update)
          if (emergencyPreempt) {
              newRiskLevel = "critical"
              newShouldAlert = true
              if (emergencyReason) currentAlertReason = emergencyReason
          }

          // 5. Update State
          setDetectionData(prev => ({
            ...prev,
            ...currentState,
            alertCount: alertCountRef.current,
            alertReason: currentAlertReason,
          }))
          
          setRiskLevel(emergencyPreempt ? "critical" : newRiskLevel)
          setShouldAlert(emergencyPreempt ? true : newShouldAlert)

    }, [detectionData, playAlertSound, speakAlert]) // Dependencies

  const drawConnectors = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    connections: [number, number][],
    options: { color: string; lineWidth: number }
  ) => {
    ctx.save()
    ctx.strokeStyle = options.color
    ctx.lineWidth = options.lineWidth
    
    for (const [start, end] of connections) {
      const p1 = landmarks[start]
      const p2 = landmarks[end]
      
      if (p1 && p2) {
        ctx.beginPath()
        ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height)
        ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height)
        ctx.stroke()
      }
    }
    
    ctx.restore()
  }

  const drawResults = useCallback((landmarks: any[], detectedObjects: any[] = []) => {
      if (!canvasRef.current || !videoRef.current) return
      
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connectors using custom implementation
      if (landmarks) {
        drawConnectors(ctx, landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION.map(c => [c.start, c.end]), {
            color: "rgba(96, 165, 250, 0.3)",
            lineWidth: 1,
        })
        
        drawConnectors(ctx, landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE.map(c => [c.start, c.end]), {
            color: "rgba(34, 211, 238, 0.8)", 
            lineWidth: 2,
        })
        
        drawConnectors(ctx, landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE.map(c => [c.start, c.end]), {
             color: "rgba(34, 211, 238, 0.8)",
             lineWidth: 2,
        })
        
        drawConnectors(ctx, landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS.map(c => [c.start, c.end]), {
             color: "rgba(147, 51, 234, 0.8)",
             lineWidth: 2,           
        })
      }
      
      // Draw Object Bounding Boxes
      if (detectedObjects) {
          detectedObjects.forEach(obj => {
              const isPhone = obj.categories.some((cat: any) => cat.categoryName === "cell phone" || cat.categoryName === "mobile phone")
              if (isPhone && obj.boundingBox) {
                  const { originX, originY, width, height } = obj.boundingBox
                  
                  // Draw Box
                  ctx.strokeStyle = "#EF4444" // Red-500
                  ctx.lineWidth = 4
                  ctx.strokeRect(originX, originY, width, height)
                  
                  // Draw Label Background
                  ctx.fillStyle = "#EF4444"
                  ctx.fillRect(originX, originY - 30, width, 30)
                  
                  // Draw Text
                  ctx.fillStyle = "#FFFFFF"
                  ctx.font = "bold 16px monospace"
                  ctx.save()
                  ctx.translate(originX + width - 5, originY - 10)
                  ctx.scale(-1, 1)
                  ctx.fillText("MOBILE DETECTED", 0, 0)
                  ctx.restore()
              }
          })
      }
  }, [canvasRef, videoRef])



  // Init small canvas
  useEffect(() => {
    if (!smallCanvasRef.current) {
        smallCanvasRef.current = document.createElement('canvas')
        smallCanvasRef.current.width = 64
        smallCanvasRef.current.height = 64
    }
  }, [])

  // Update CDN URL in useEffect
  useEffect(() => {
    const getCachedModelPath = async (path: string) => {
        try {
            const cacheName = "drowsiness-models-v1"
            const cache = await caches.open(cacheName)
            const cachedResponse = await cache.match(path)
            
            if (cachedResponse) {
                const blob = await cachedResponse.blob()
                return URL.createObjectURL(blob)
            }
            
            const response = await fetch(path)
            if (response.ok) {
                cache.put(path, response.clone())
                const blob = await response.blob()
                return URL.createObjectURL(blob)
            }
            
            return path // Fallback to network path
        } catch (e) {
            console.warn("Cache API not available or failed, falling back to network", e)
            return path
        }
    }

    const loadModel = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "/models/wasm"
        );
        
        // Cache heavy models parallelly
        const [faceModelPath, objectModelPath, poseModelPath, handModelPath] = await Promise.all([
             getCachedModelPath("/models/face_landmarker.task"),
             getCachedModelPath("/models/efficientdet_lite0.tflite"),
             getCachedModelPath("/models/pose_landmarker.task"),
             getCachedModelPath("/models/hand_landmarker.task")
        ])

        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: faceModelPath,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.6,
          minTrackingConfidence: 0.7, // Smoother tracking during movement
        });
        
        const objectDetector = await ObjectDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: objectModelPath,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          scoreThreshold: 0.3,
          categoryAllowlist: ["cell phone", "mobile phone"]
        });

        const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: poseModelPath,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numPoses: 1
        });

        const handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: handModelPath,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });

        faceLandmarkerRef.current = faceLandmarker
        objectDetectorRef.current = objectDetector
        poseLandmarkerRef.current = poseLandmarker
        handLandmarkerRef.current = handLandmarker
        setIsModelLoading(false)
        console.log("MediaPipe Models loaded")
      } catch (err) {
        console.error("Failed to load MediaPipe model:", err)
        setError("Failed to load face detection model. Please refresh.")
        setIsModelLoading(false)
      }
    }
    
    loadModel()
    
    return () => {
        // Cleanup if needed
    }
  }, [])
  
  const detectForVideo = () => {
      const video = videoRef.current
      const faceLandmarker = faceLandmarkerRef.current
      const objectDetector = objectDetectorRef.current
      const poseLandmarker = poseLandmarkerRef.current
      const handLandmarker = handLandmarkerRef.current
      
      if (!video || !faceLandmarker || !objectDetector || !poseLandmarker || !handLandmarker) return

      let startTimeMs = performance.now()
      
      if (lastVideoTimeRef.current !== video.currentTime) {
          lastVideoTimeRef.current = video.currentTime
          
          // Ensure video is ready
          if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
              return
          }

          try {
              // 1. Face Detection (Run every frame for smoothness)
              const results = faceLandmarker.detectForVideo(video, startTimeMs)
              
              // 2. Throttled Detections
              frameCounterRef.current++
              
              // Pose & Hand (Every 4 frames ~ 7.5fps if base is 30)
              if (frameCounterRef.current % 4 === 0) {
                   const poseResults = poseLandmarker.detectForVideo(video, startTimeMs)
                   const handResults = handLandmarker.detectForVideo(video, startTimeMs)
                   lastPoseLandmarksRef.current = (poseResults.landmarks && poseResults.landmarks.length > 0) ? poseResults.landmarks[0] : []
                   lastHandLandmarksRef.current = (handResults.landmarks) ? handResults.landmarks : []
              }

              // Object Detection (Every 10 frames ~ 3fps)
              if (frameCounterRef.current % 10 === 0) {
                  const objectResults = objectDetector.detectForVideo(video, startTimeMs)
                  lastDetectedObjectsRef.current = objectResults.detections
              }
              
              // Use current Face results + Persisted others
              const faceLandmarks = (results.faceLandmarks && results.faceLandmarks.length > 0) ? results.faceLandmarks[0] : []
              const poseLandmarks = lastPoseLandmarksRef.current
              const handLandmarks = lastHandLandmarksRef.current
              const detectedObjects = lastDetectedObjectsRef.current

              if (faceLandmarks.length > 0) {
                  drawResults(faceLandmarks, detectedObjects)
                  processValues(faceLandmarks, detectedObjects, poseLandmarks, handLandmarks)
              } else {
                 // Clear canvas if no face detected
                 const canvas = canvasRef.current
                 const ctx = canvas?.getContext("2d")
                 if (canvas && ctx) {
                     ctx.clearRect(0, 0, canvas.width, canvas.height)
                 }
                 // Run analysis for occlusion/no-face AND Emergency
                 processValues([], [], poseLandmarks, handLandmarks)
              }
          } catch (e) {
              // Ignore transient errors or log as warning
              console.warn("Frame detection skipped (transient):", e)
          }
      }
      
      if (isDetectingRef.current) {
        requestRef.current = requestAnimationFrame(detectForVideo)
      }
  }

  const startDetection = useCallback(async () => {
    try {
      setError(null)
      setError(null)
      setSessionStartTime(Date.now())
      sessionStartTimeRef.current = Date.now()
      setMaxRiskScore(0)
      frameCounterRef.current = 0
      lastPoseLandmarksRef.current = []
      lastHandLandmarksRef.current = []
      lastDetectedObjectsRef.current = []

      if (!faceLandmarkerRef.current) {
        throw new Error("Face detection model not loaded yet. Please wait.")
      }
    
      // Reset Analyzers
      eyeAnalyzer.current.reset()
      mouthAnalyzer.current.reset()
      headPoseAnalyzer.current.reset()
      objectAnalyzer.current.reset()
      cardiacAnalyzer.current.reset()

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
               videoRef.current?.play()
               resolve(true)
            }
          }
        })

        setIsDetecting(true)
        setRiskLevel("safe")
        // Start loop
        requestRef.current = requestAnimationFrame(detectForVideo)
      }

      console.log("Detection started")
    } catch (err: any) {
      console.error("Detection start error:", err)
      setError(err.message || "Failed to start detection. Check permissions.")
    }
  }, [videoRef, isDetecting]) 
  
  const isDetectingRef = useRef(false)
  useEffect(() => {
    isDetectingRef.current = isDetecting
    if (isDetecting) {
      detectForVideo()
    } else {
      cancelAnimationFrame(requestRef.current)
    }
  }, [isDetecting])


  const stopDetection = useCallback(() => {
    console.log("Stopping detection")
    setIsDetecting(false) // This triggers the useEffect above to stop loop
    setRiskLevel("inactive")
    setShouldAlert(false)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
    
    // Reset Refs
    alertCountRef.current = 0
    maxRiskScoreRef.current = 0
    alertEndTimeRef.current = 0
    lastAlertTimeRef.current = 0
    sessionStartTimeRef.current = null
    frameCounterRef.current = 0
    lastPoseLandmarksRef.current = []
    lastHandLandmarksRef.current = []
    lastDetectedObjectsRef.current = []

    // Reset state values
    setDetectionData({
      eyeClosureTime: 0,
      yawnCount: 0,
      headMovement: 0,
      alertCount: 0,
      eyeAspectRatio: 0,
      mouthAspectRatio: 0,
      blinkFrequency: 0,
      yawnDuration: 0,
      isDistracted: false,
      distractionDirection: "none",
      alertReason: null,
      isPhoneDetected: false,
      isOccluded: false,
      occlusionDuration: 0,
      cardiacDistressDetected: false,
      emergencyConfirmed: false,
      emergencyConfidence: 0
    })
    setRiskScore(0)
    setMaxRiskScore(0)
  }, [videoRef, canvasRef])

  useEffect(() => {
    return () => {
      stopDetection()
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
    }
  }, [stopDetection])

  const sessionDuration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0

  return {
    isDetecting,
    error,
    detectionData,
    startDetection,
    stopDetection,
    riskLevel,
    riskScore,
    shouldAlert,
    maxRiskScore,
    sessionDuration,
    isModelLoading,
  }
}
