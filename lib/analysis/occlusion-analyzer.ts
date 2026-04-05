
export class OcclusionAnalyzer {
  private occlusionStartTime: number = 0
  private lastOcclusionState: boolean = false

  // Configurable thresholds
  private readonly BRIGHTNESS_THRESHOLD = 30 // 0-255, below this is considered dark/covered
  private readonly STD_DEV_THRESHOLD = 5 // Low variance means uniform image (e.g. piece of paper)

  constructor() {}

  public process(imageData: ImageData, currentTime: number) {
    const { data, width, height } = imageData
    let totalBrightness = 0
    let sumSqBrightness = 0
    const pixelCount = width * height

    // We only need to sample every Nth pixel for performance if image is large,
    // but we will pass a small 64x64 image so we can iterate all.
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Calculate luminance (perceived brightness)
      // Y = 0.299R + 0.587G + 0.114B
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b
      
      totalBrightness += brightness
      sumSqBrightness += brightness * brightness
    }

    const averageBrightness = totalBrightness / pixelCount
    
    // Variance = E[X^2] - (E[X])^2
    const variance = (sumSqBrightness / pixelCount) - (averageBrightness * averageBrightness)
    const stdDev = Math.sqrt(Math.max(0, variance)) // Ensure non-negative

    // Check for occlusion
    // 1. Too Dark (Camera covered tightly)
    // 2. Too Uniform (Camera covered by paper/finger but letting light in, or complete darkness)
    const isDark = averageBrightness < this.BRIGHTNESS_THRESHOLD
    const isUniform = stdDev < this.STD_DEV_THRESHOLD
    
    // Note: A completely black image is both dark and uniform.
    const isOccluded = isDark || isUniform

    if (isOccluded) {
      if (this.occlusionStartTime === 0) {
        this.occlusionStartTime = currentTime
      }
    } else {
      this.occlusionStartTime = 0
    }
    
    const occlusionDuration = this.occlusionStartTime > 0 ? (currentTime - this.occlusionStartTime) / 1000 : 0
    
    this.lastOcclusionState = isOccluded

    return {
      isOccluded,
      occlusionDuration,
      metrics: {
        brightness: averageBrightness,
        stdDev: stdDev
      }
    }
  }

  public reset() {
    this.occlusionStartTime = 0
    this.lastOcclusionState = false
  }
}
