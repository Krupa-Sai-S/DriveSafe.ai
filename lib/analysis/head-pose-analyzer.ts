
export class HeadPoseAnalyzer {
  private distractionStart: number = 0
  private headAngleHistory: number[] = []
  private readonly HISTORY_SIZE = 5
  private readonly HEAD_ANGLE_THRESHOLD = 25 

  constructor() {}

  public process(landmarks: any[], currentTime: number) {
    const headAngle = this.calculateHeadPose(landmarks)
    const smoothedHeadAngle = this.getSmoothedValue(headAngle)
    const headYawRatio = this.calculateHeadYaw(landmarks)

    let distractionDir: "none" | "left" | "right" = "none"
    if (headYawRatio > 2.0) distractionDir = "left"
    else if (headYawRatio < 0.5) distractionDir = "right"

    let isDistracted = distractionDir !== "none"
    
    // Track distraction duration
    if (isDistracted) {
        if (this.distractionStart === 0) {
            this.distractionStart = currentTime
        }
    } else {
        this.distractionStart = 0
    }

    const distractionDuration = this.distractionStart > 0 ? (currentTime - this.distractionStart) / 1000 : 0

    return {
        headAngle: smoothedHeadAngle,
        distractionDirection: distractionDir,
        isDistracted,
        distractionDuration
    }
  }

  public reset() {
    this.distractionStart = 0
    this.headAngleHistory = []
  }

  private getSmoothedValue(val: number): number {
    this.headAngleHistory.push(val)
    if (this.headAngleHistory.length > this.HISTORY_SIZE) {
      this.headAngleHistory.shift()
    }
    const sum = this.headAngleHistory.reduce((a, b) => a + b, 0)
    return sum / this.headAngleHistory.length
  }

  private calculateHeadPose(landmarks: any[]) {
    const nose = landmarks[1]
    const leftEye = landmarks[33]
    const rightEye = landmarks[263]

    const eyeCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2,
      z: ((leftEye.z || 0) + (rightEye.z || 0)) / 2,
    }

    const angle = Math.atan2(nose.y - eyeCenter.y, nose.x - eyeCenter.x) * (180 / Math.PI)
    // Normalize: 90 degrees (upright) should be 0 deviation
    return angle - 90
  }

  private calculateHeadYaw(landmarks: any[]) {
    // 1 is nose tip, 454 is left face edge, 234 is right face edge
    const nose = landmarks[1]
    const leftEdge = landmarks[454]
    const rightEdge = landmarks[234]

    const getDistance = (p1: any, p2: any) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }

    const leftDist = getDistance(nose, leftEdge)
    const rightDist = getDistance(nose, rightEdge)

    // Ratio > 1 means nose is closer to left edge (looking left)
    // Ratio < 1 means nose is closer to right edge (looking right)
    
    // Avoid division by zero
    if (leftDist < 0.001) return 100 // extreme left
    
    return rightDist / leftDist
  }
}
