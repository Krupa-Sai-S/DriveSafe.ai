
export class EyeAnalyzer {
  private eyeClosureStart: number = 0
  private blinkCount: number = 0
  private lastBlinkTime: number = 0
  private readonly EAR_THRESHOLD = 0.21
  private readonly FAST_BLINK_LIMIT = 50 // ms
  private readonly SLOW_BLINK_LIMIT = 500 // ms

  // Smoothing
  private earHistory: number[] = []
  private readonly HISTORY_SIZE = 5

  constructor() {}

  public process(landmarks: any[], currentTime: number, width: number, height: number) {
    const ear = this.calculateEAR(landmarks, width, height)
    const smoothedEar = this.getSmoothedValue(ear)

    let eyeClosureDuration = 0
    let isBlinking = false

    if (smoothedEar < this.EAR_THRESHOLD) {
      if (this.eyeClosureStart === 0) {
        this.eyeClosureStart = currentTime
      }
      eyeClosureDuration = (currentTime - this.eyeClosureStart) / 1000
    } else {
      // Check for blink on rising edge (eyes opening)
      if (this.eyeClosureStart > 0) {
        const closureDurationMs = currentTime - this.eyeClosureStart
        if (closureDurationMs > this.FAST_BLINK_LIMIT && closureDurationMs < this.SLOW_BLINK_LIMIT) {
          this.blinkCount++
          this.lastBlinkTime = currentTime
          isBlinking = true
        }
      }
      this.eyeClosureStart = 0
      eyeClosureDuration = 0
    }

    return {
      ear: smoothedEar,
      eyeClosureTime: eyeClosureDuration,
      blinkCount: this.blinkCount,
      isBlinking
    }
  }

  public reset() {
    this.eyeClosureStart = 0
    this.blinkCount = 0
    this.earHistory = []
  }

  private getSmoothedValue(val: number): number {
    this.earHistory.push(val)
    if (this.earHistory.length > this.HISTORY_SIZE) {
      this.earHistory.shift()
    }
    const sum = this.earHistory.reduce((a, b) => a + b, 0)
    return sum / this.earHistory.length
  }

  private calculateEAR(landmarks: any[], width: number, height: number) {
    const getDistance = (p1: any, p2: any) => {
      const x1 = p1.x * width
      const y1 = p1.y * height
      const x2 = p2.x * width
      const y2 = p2.y * height
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    }

    // Left eye landmarks indices
    const leftEyeIndices = [33, 160, 158, 133, 153, 144]
    // Right eye landmarks indices
    const rightEyeIndices = [362, 385, 387, 263, 373, 380]

    const calculateEyeEAR = (eyeIndices: number[]) => {
      const p1 = landmarks[eyeIndices[1]]
      const p2 = landmarks[eyeIndices[5]]
      const p3 = landmarks[eyeIndices[2]]
      const p4 = landmarks[eyeIndices[4]]
      const p5 = landmarks[eyeIndices[0]]
      const p6 = landmarks[eyeIndices[3]]

      const vertical1 = getDistance(p1, p2)
      const vertical2 = getDistance(p3, p4)
      const horizontal = getDistance(p5, p6)

      return (vertical1 + vertical2) / (2.0 * horizontal)
    }

    const leftEAR = calculateEyeEAR(leftEyeIndices)
    const rightEAR = calculateEyeEAR(rightEyeIndices)

    return (leftEAR + rightEAR) / 2.0
  }
}
