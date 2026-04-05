
export class CardiacAnalyzer {
  private gestureStartTime: number = 0;
  private gestureCount: number = 0;
  private gestureTimestamps: number[] = [];
  
  private readonly HOLD_DURATION = 5000; // 5 seconds
  private readonly REPEAT_COUNT = 3;
  private readonly REPEAT_WINDOW = 60000; // 60 seconds
  private readonly CHEST_PROXIMITY_THRESHOLD = 0.15; // normalized distance

  constructor() {}

  public process(
    poseLandmarks: any[], // Pose landmarks
    handLandmarks: any[][], // Array of hand landmarks (0, 1 or 2 hands)
    currentTime: number
  ) {
    let isHandNearChest = false;
    let distressDetected = false;
    let confidence = 0;

    if (!poseLandmarks || poseLandmarks.length === 0) {
      this.resetGesture();
      return { cardiacDistressDetected: false, confidence: 0 };
    }

    // 1. Identify "Left Chest" region
    // Pose indices: 11 = Left Shoulder, 12 = Right Shoulder. 
    // Heart is near Left Shoulder (11). Let's define it as slightly below and medial to Left Shoulder.
    const leftShoulder = poseLandmarks[11];
    const rightShoulder = poseLandmarks[12];
    
    if (!leftShoulder || !rightShoulder) {
        return { cardiacDistressDetected: false, confidence: 0 };
    }

    // Heuristic: Chest point is 20% down from L-Shoulder towards Left Hip (23), 
    // but we can just use Left Shoulder radius for simplicity or interpolated point.
    // Let's use a point slightly shifted towards the center from the left shoulder.
    const chestX = leftShoulder.x + (rightShoulder.x - leftShoulder.x) * 0.15;
    const chestY = leftShoulder.y + 0.1; // Slightly down (Y increases downwards)
    
    // 2. Check Hands Proximity
    // handLandmarks is Array<Array<Landmark>>. We check each hand.
    if (handLandmarks && handLandmarks.length > 0) {
        for (const hand of handLandmarks) {
            // Check Palm (0) or Index Finger Tip (8)
            const wrist = hand[0];
            const indexTip = hand[8];
            
            if (wrist && indexTip) {
                // Calculate distances
                const distWrist = Math.hypot(wrist.x - chestX, wrist.y - chestY);
                const distIndex = Math.hypot(indexTip.x - chestX, indexTip.y - chestY);
                
                if (distWrist < this.CHEST_PROXIMITY_THRESHOLD || distIndex < this.CHEST_PROXIMITY_THRESHOLD) {
                    isHandNearChest = true;
                    break;
                }
            }
        }
    }

    // 3. Logic
    if (isHandNearChest) {
        if (this.gestureStartTime === 0) {
            this.gestureStartTime = currentTime;
        }
        
        const duration = currentTime - this.gestureStartTime;
        
        // Trigger 1: Duration >= 5s
        if (duration >= this.HOLD_DURATION) {
            distressDetected = true;
            confidence = 1.0;
        } else {
             confidence = Math.min(duration / this.HOLD_DURATION, 0.8);
        }

    } else {
        // Hand moved away
        if (this.gestureStartTime > 0) {
            const duration = currentTime - this.gestureStartTime;
            if (duration > 1000) { // Valid gesture attempt if held for > 1s
                 this.recordGesture(currentTime);
            }
        }
        this.gestureStartTime = 0;
    }

    // Trigger 2: Repetition
    this.cleanUpOldGestures(currentTime);
    if (this.gestureTimestamps.length >= this.REPEAT_COUNT) {
        distressDetected = true;
        confidence = Math.max(confidence, 0.9);
    }

    return {
        cardiacDistressDetected: distressDetected,
        confidence,
        isHandNearChest
    };
  }

  private recordGesture(time: number) {
      // Avoid duplicate counting for same event
      if (this.gestureTimestamps.length > 0) {
          const last = this.gestureTimestamps[this.gestureTimestamps.length - 1];
          if (time - last < 2000) return; // Debounce
      }
      this.gestureTimestamps.push(time);
  }

  private cleanUpOldGestures(currentTime: number) {
      this.gestureTimestamps = this.gestureTimestamps.filter(t => currentTime - t < this.REPEAT_WINDOW);
  }

  private resetGesture() {
      this.gestureStartTime = 0;
  }

  public reset() {
      this.resetGesture();
      this.gestureTimestamps = [];
  }
}
