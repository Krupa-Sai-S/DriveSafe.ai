"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Square, AlertTriangle, Activity, Clock, TrendingUp, Volume2, VolumeX, Video, VideoOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDrowsinessDetection } from "@/hooks/use-drowsiness-detection"
import { SessionSummaryModal } from "@/components/session-summary-modal"

export function DetectionDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [lastSessionData, setLastSessionData] = useState<any>(null)

  const timelineRef = useRef<Array<{ time: string; score: number; events: any[] }>>([])
  const riskScoreRef = useRef(0)
  const prevYawnCountRef = useRef(0)
  const prevAlertCountRef = useRef(0)
  const prevEyeClosureRef = useRef(0)

  const { isDetecting, error, detectionData, startDetection, stopDetection, riskLevel, riskScore, shouldAlert, maxRiskScore, sessionDuration, isModelLoading: isLoading } =
    useDrowsinessDetection(videoRef, canvasRef, isAudioEnabled)

  useEffect(() => { riskScoreRef.current = riskScore }, [riskScore])
  const detectionDataRef = useRef(detectionData)
  useEffect(() => { detectionDataRef.current = detectionData }, [detectionData])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isDetecting) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now())
        timelineRef.current = []
        prevYawnCountRef.current = 0; prevAlertCountRef.current = 0; prevEyeClosureRef.current = 0
      }
      interval = setInterval(() => {
        const cd = detectionDataRef.current
        const elapsed = Math.floor((Date.now() - (sessionStartTime || Date.now())) / 1000)
        setElapsedTime(elapsed)
        const events = []
        if (cd.yawnCount > prevYawnCountRef.current) { events.push({ type: "yawn", count: cd.yawnCount - prevYawnCountRef.current }); prevYawnCountRef.current = cd.yawnCount }
        if (cd.alertCount > prevAlertCountRef.current) { events.push({ type: "alert", count: cd.alertCount - prevAlertCountRef.current, reason: cd.alertReason }); prevAlertCountRef.current = cd.alertCount }
        const diff = cd.eyeClosureTime - prevEyeClosureRef.current
        if (diff > 0.1) { events.push({ type: "eye", duration: diff }); prevEyeClosureRef.current = cd.eyeClosureTime }
        timelineRef.current.push({ time: formatTime(elapsed), score: riskScoreRef.current, events })
      }, 1000)
    } else { setSessionStartTime(null); setElapsedTime(0) }
    return () => { if (interval) clearInterval(interval) }
  }, [isDetecting, sessionStartTime])

  const formatTime = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const getRiskColor = (l: string) => l === "safe" ? "text-emerald-400" : l === "warning" ? "text-amber-400" : l === "critical" ? "text-red-400" : "text-muted-foreground"
  const getRiskBgColor = (l: string) => l === "safe" ? "bg-emerald-400/15 border-emerald-400/30" : l === "warning" ? "bg-amber-400/15 border-amber-400/30" : l === "critical" ? "bg-red-400/15 border-red-400/30" : "bg-muted border-border"
  const getCameraGlow = (l: string) => isDetecting ? (l === "safe" ? "glow-green" : l === "warning" ? "glow-yellow" : l === "critical" ? "glow-red" : "") : ""
  const getBarClass = (v: number) => v >= 70 ? "metric-bar-danger" : v >= 40 ? "metric-bar-warning" : "metric-bar-safe"

  const handleStop = () => {
    const data = { id: Date.now().toString(), date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), duration: sessionDuration || 0, maxRiskScore, eyeClosureEvents: Math.floor(detectionData.eyeClosureTime * 2), yawnCount: detectionData.yawnCount, alertsTriggered: detectionData.alertCount, maxRiskLevel: riskLevel, blinkFrequency: detectionData.blinkFrequency, timeline: timelineRef.current }
    try { const existing = localStorage.getItem("drowsiness-sessions"); const sessions = existing ? JSON.parse(existing) : []; sessions.unshift(data); localStorage.setItem("drowsiness-sessions", JSON.stringify(sessions)) } catch (e) { console.error(e) }
    setLastSessionData(data); stopDetection()
    if (sessionDuration > 5) setShowSummary(true)
  }

  // SVG gauge
  const radius = 52, circumference = 2 * Math.PI * radius
  const gaugeColor = riskLevel === "critical" ? "#f87171" : riskLevel === "warning" ? "#fbbf24" : "#34d399"

  const MetricTile = ({ label, value, pct, barClass }: { label: string; value: string; pct: number; barClass: string }) => (
    <div className="space-y-1.5 rounded-lg bg-muted/20 border border-border/20 p-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
        <div className={cn("h-full rounded-full transition-all duration-300", barClass)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 border border-blue-400/20">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Live Detection Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time driver drowsiness monitoring with AI</p>
          </div>
          {isDetecting && (
            <div className="ml-auto flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"/></span>
              Live
            </div>
          )}
        </div>

        {error && <Alert variant="destructive" className="mb-6"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
        {isLoading && <Alert className="mb-6 border-blue-400/20 bg-blue-400/5 text-blue-400"><Loader2 className="h-4 w-4 animate-spin" /><AlertDescription>Downloading AI models... Please wait.</AlertDescription></Alert>}

        <div className="grid gap-6 lg:grid-cols-3 xl:gap-8">
          {/* Camera */}
          <div className="lg:col-span-2">
            <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500", getCameraGlow(riskLevel))}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><Video className="h-4 w-4 text-blue-400" />Camera Feed</CardTitle>
                  <CardDescription className="text-xs">Live video with facial landmark overlay</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn("relative w-full overflow-hidden rounded-xl bg-muted/50 border border-border/30", !isDetecting && "aspect-video")}>
                  <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-auto scale-x-[-1]", !isDetecting && "hidden")} />
                  <canvas ref={canvasRef} className="absolute inset-0 h-full w-full scale-x-[-1]" style={{ mixBlendMode: isDetecting ? "normal" : "multiply" }} />
                  {isDetecting && <div className="animate-scan-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent pointer-events-none z-10" />}
                  {!isDetecting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/5">
                          <VideoOff className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Camera inactive</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Press Start Detection to begin</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={isDetecting ? handleStop : startDetection} size="lg" disabled={isLoading && !isDetecting}
                    className={cn("gap-2 cursor-pointer text-white border-none shadow-lg transition-all duration-300 hover:scale-105",
                      isDetecting ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-red-500/30"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/30")}>
                    {isDetecting ? <><Square className="h-4 w-4" />Stop Detection</> : isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Loading Models...</> : <><Play className="h-4 w-4" />Start Detection</>}
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={cn("gap-2 cursor-pointer border-border/50 transition-all duration-300", isAudioEnabled ? "hover:border-blue-400/40 hover:text-blue-400" : "text-muted-foreground")}>
                    {isAudioEnabled ? <><Volume2 className="h-4 w-4" />Audio On</> : <><VolumeX className="h-4 w-4" />Audio Off</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Panel */}
          <div className="h-full">
            <Card className="h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-blue-400" />Live Analysis</CardTitle>
                  <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border", getRiskBgColor(riskLevel), getRiskColor(riskLevel))}>{riskLevel} Risk</div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-5">

                {/* SVG Gauge */}
                <div className="flex justify-center py-2">
                  <div className="relative flex items-center justify-center">
                    <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
                      <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
                      <circle cx="64" cy="64" r={radius} fill="none" stroke={gaugeColor} strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={circumference - (riskScore / 100) * circumference}
                        style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease", filter: `drop-shadow(0 0 6px ${gaugeColor}80)` }} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={cn("text-2xl font-bold font-mono", getRiskColor(riskLevel))}>{riskScore}%</span>
                      <span className="text-xs text-muted-foreground">Risk</span>
                    </div>
                  </div>
                </div>

                {/* Timer */}
                <div className="rounded-xl bg-muted/40 border border-border/30 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><span>Session Time</span></div>
                  <span className="font-mono text-lg font-bold">{formatTime(elapsedTime)}</span>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Activity className="h-3 w-3" />Real-time Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <MetricTile label="EAR" value={detectionData.eyeAspectRatio?.toFixed(2) ?? "0.00"} pct={(detectionData.eyeAspectRatio / 0.4) * 100} barClass={getBarClass((detectionData.eyeAspectRatio / 0.4) * 100)} />
                    <MetricTile label="MAR" value={detectionData.mouthAspectRatio?.toFixed(2) ?? "0.00"} pct={(detectionData.mouthAspectRatio / 1.0) * 100} barClass={getBarClass((detectionData.mouthAspectRatio / 1.0) * 100)} />
                    <MetricTile label="Blink Freq" value={`${detectionData.blinkFrequency.toFixed(1)}/m`} pct={(detectionData.blinkFrequency / 30) * 100} barClass="metric-bar-blue" />
                    <MetricTile label="Eye Closure" value={`${detectionData.eyeClosureTime.toFixed(1)}s`} pct={(detectionData.eyeClosureTime / 3) * 100} barClass={getBarClass((detectionData.eyeClosureTime / 3) * 100)} />
                    <MetricTile label="Yawn Time" value={`${detectionData.yawnDuration.toFixed(1)}s`} pct={(detectionData.yawnDuration / 5) * 100} barClass={getBarClass((detectionData.yawnDuration / 5) * 100)} />
                    <MetricTile label="Yawn Count" value={String(detectionData.yawnCount)} pct={(detectionData.yawnCount / 10) * 100} barClass={getBarClass((detectionData.yawnCount / 10) * 100)} />

                    {/* Head Pose / Distraction */}
                    <div className="space-y-1.5 rounded-lg bg-muted/20 border border-border/20 p-2.5">
                      {detectionData.isPhoneDetected ? (
                        <div className="flex justify-between text-xs text-red-400 font-bold animate-pulse"><span>DISTRACTION</span><span>PHONE</span></div>
                      ) : detectionData.isDistracted ? (
                        <div className="flex justify-between text-xs text-amber-400 font-bold animate-pulse"><span>DISTRACTION</span><span>{detectionData.distractionDirection.toUpperCase()}</span></div>
                      ) : (
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Head Pose</span><span className="font-mono font-semibold">{detectionData.headMovement.toFixed(0)}°</span></div>
                      )}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                        <div className={cn("h-full rounded-full transition-all duration-300", (detectionData.isDistracted || detectionData.isPhoneDetected) ? "metric-bar-danger" : "metric-bar-safe")}
                          style={{ width: `${(detectionData.isDistracted || detectionData.isPhoneDetected) ? 100 : Math.min((Math.abs(detectionData.headMovement) / 30) * 100, 100)}%` }} />
                      </div>
                    </div>

                    <MetricTile label="Alerts" value={String(detectionData.alertCount)} pct={Math.min(detectionData.alertCount * 20, 100)} barClass="metric-bar-danger" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alert Banner */}
        {shouldAlert && (
          <div className={cn("fixed inset-x-0 bottom-0 z-50 border-t-2 p-4 backdrop-blur-md",
            detectionData.alertReason === "No Face Detected" ? "border-amber-500 bg-amber-500/95" : "border-red-600 bg-red-600/95")}>
            <div className="container mx-auto flex max-w-7xl items-center justify-center gap-4">
              <AlertTriangle className="h-6 w-6 text-white animate-bounce" />
              <p className="text-base font-bold text-white tracking-wide">
                {detectionData.alertReason === "Distracted Driving" ? "⚠ DISTRACTION DETECTED — FOCUS ON ROAD"
                  : detectionData.alertReason === "Using Mobile" ? "📱 DISTRACTION — USING MOBILE"
                  : detectionData.alertReason === "Camera Blocked" ? "🚫 CAMERA BLOCKED"
                  : detectionData.alertReason === "No Face Detected" ? "👤 NO FACE DETECTED"
                  : detectionData.alertReason === "CARDIAC DISTRESS" ? "🚨 EMERGENCY: CARDIAC DISTRESS"
                  : `😴 DROWSINESS DETECTED — PLEASE TAKE A BREAK`}
              </p>
              <AlertTriangle className="h-6 w-6 text-white animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {lastSessionData && <SessionSummaryModal open={showSummary} onOpenChange={setShowSummary} sessionData={lastSessionData} />}
    </>
  )
}
