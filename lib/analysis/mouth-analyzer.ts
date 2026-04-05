export class MouthAnalyzer {
  private yawnStart: number = 0
  private yawnCount: number = 0
  private lastYawnTime: number = 0
  private lastYawnDuration: number = 0
  
  // Hysteresis thresholds to prevent flickering
  private readonly MAR_THRESHOLD_START = 0.6
  private readonly MAR_THRESHOLD_END = 0.5
  
  // Debounce for yawn counting
  private readonly YAWN_COOLDOWN = 3000 // 3 seconds

  // Smoothing
  private marHistory: number[] = []
  private readonly HISTORY_SIZE = 5

  constructor() {}

  public process(landmarks: any[], currentTime: number, width: number, height: number, shouldIgnore: boolean = false) {
    if (shouldIgnore) {
        return {
             mar: 0,
             yawnCount: this.yawnCount,
             yawnDuration: 0,
             isYawning: false
        }
    }

    const mar = this.calculateMAR(landmarks, width, height)
    const smoothedMar = this.getSmoothedValue(mar)
    
    let isYawning = false

    if (smoothedMar > this.MAR_THRESHOLD_START) {
       if (this.yawnStart === 0) {
           this.yawnStart = currentTime
       }
       isYawning = true
       
       // Count yawn only if enough time passed since last count
       if (currentTime - this.lastYawnTime > this.YAWN_COOLDOWN) {
           this.yawnCount++
           this.lastYawnTime = currentTime
       }
    } else if (smoothedMar < this.MAR_THRESHOLD_END) {
       if (this.yawnStart > 0) {
           // Yawn ended
           this.lastYawnDuration = (currentTime - this.yawnStart) / 1000
           this.yawnStart = 0
       }
       isYawning = false
    } else {
       // In between thresholds (Hysteresis zone) - keep previous state
       if (this.yawnStart > 0) {
           isYawning = true
       }
    }

    const currentYawnDuration = this.yawnStart > 0 ? (currentTime - this.yawnStart) / 1000 : this.lastYawnDuration

    return {
       mar: smoothedMar,
       yawnCount: this.yawnCount,
       yawnDuration: currentYawnDuration,
       isYawning
    }
  }

  public reset() {
    this.yawnStart = 0
    this.yawnCount = 0
    this.lastYawnTime = 0
    this.lastYawnDuration = 0
    this.marHistory = []
  }

  private getSmoothedValue(val: number): number {
    this.marHistory.push(val)
    if (this.marHistory.length > this.HISTORY_SIZE) {
      this.marHistory.shift()
    }
    const sum = this.marHistory.reduce((a, b) => a + b, 0)
    return sum / this.marHistory.length
  }

  private calculateMAR(landmarks: any[], width: number, height: number) {
    const getDistance = (p1: any, p2: any) => {
       const x1 = p1.x * width
       const y1 = p1.y * height
       const x2 = p2.x * width
       const y2 = p2.y * height
       return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    }

    // Mouth landmarks
    const topLip = landmarks[13]
    const bottomLip = landmarks[14]
    const leftMouth = landmarks[61]
    const rightMouth = landmarks[291]

    const vertical = getDistance(topLip, bottomLip)
    const horizontal = getDistance(leftMouth, rightMouth)

    return vertical / horizontal
  }
}
