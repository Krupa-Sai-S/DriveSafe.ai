
export class ObjectAnalyzer {
  private phoneDetectionStart: number = 0

  constructor() {}

  public process(detectedObjects: any[], currentTime: number) {
    const isPhoneDetected = detectedObjects.some(obj => 
        obj.categories.some((cat: any) => cat.categoryName === "cell phone" || cat.categoryName === "mobile phone")
    )

    if (isPhoneDetected) {
        if (this.phoneDetectionStart === 0) {
            this.phoneDetectionStart = currentTime
        }
    } else {
        this.phoneDetectionStart = 0
    }

    const phoneDuration = this.phoneDetectionStart > 0 ? (currentTime - this.phoneDetectionStart) / 1000 : 0

    return {
        isPhoneDetected,
        phoneDuration
    }
  }

  public reset() {
    this.phoneDetectionStart = 0
  }
}
