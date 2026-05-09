import { ObjectDetector, HandLandmarker } from "@mediapipe/tasks-vision";
import { visionManager } from "./vision-manager";

export interface IDValidationResult {
  isValid: boolean;
  score: number;
  reason?: string;
}

/**
 * Engine for ID Card detection and Anti-Spoofing
 */
export class IDEngine {
  private detector: ObjectDetector | null = null;
  private handLandmarker: HandLandmarker | null = null;

  public async warmup() {
    await Promise.all([this.getDetector(), this.getHandLandmarker()]);
  }

  private async getDetector() {
    if (!this.detector) {
      this.detector = await visionManager.createObjectDetector();
    }
    return this.detector;
  }

  private async getHandLandmarker() {
    if (!this.handLandmarker) {
      this.handLandmarker = await visionManager.createHandLandmarker();
    }
    return this.handLandmarker;
  }

  public async validateIDCard(
    imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ): Promise<IDValidationResult> {
    const detector = await this.getDetector();
    const hand = await this.getHandLandmarker();

    // Protection: Ensure the element actually has loaded frame data
    const width = 'videoWidth' in imageElement ? imageElement.videoWidth : imageElement.width;
    const height = 'videoHeight' in imageElement ? imageElement.videoHeight : imageElement.height;
    if (!width || width === 0 || !height || height === 0) {
        return {
            isValid: false,
            score: 0,
            reason: "Camera stream initializing..."
        };
    }

    // 1. HAND DETECTION
    // We intentionally do NOT block capture if a hand is detected, 
    // because users naturally hold their ID cards up to the webcam.
    const handResult = hand.detect(imageElement);

    const result = detector.detect(imageElement);

    // --- ANTI-SPOOFING: PHONE/SCREEN DETECTION ---
    const spoofCategories = ["phone", "cell", "laptop", "tv", "monitor", "tablet", "screen", "display"];
    const spoofDetection = result.detections?.find(d => {
      const categoryName = d.categories[0].categoryName.toLowerCase();
      return spoofCategories.some(spoof => categoryName.includes(spoof));
    });

    // 25% threshold: catches digital screens without falsely flagging a glossy ID card as a phone
    if (spoofDetection && spoofDetection.categories[0].score > 0.25) {
      console.log("[KYC Security] Digital Spoofing Detected (Device in frame).");
      return {
        isValid: false,
        score: 0,
        reason: `Digital screens are not allowed. Please use your physical ID card.`
      };
    }

    // --- SELFIE BLOCKER ---
    // Since we relaxed the ID detection to improve UX, we must ensure users don't 
    // accidentally capture a selfie in the ID step.
    const personDetection = result.detections?.find(d => 
      d.categories[0].categoryName.toLowerCase() === "person"
    );

    if (personDetection && personDetection.boundingBox) {
      const box = personDetection.boundingBox;
      const boxArea = box.width * box.height;
      const imageArea = width * height;
      const ratio = boxArea / imageArea;

      // If a person takes up more than 20% of the camera frame, they are likely taking a selfie 
      // instead of scanning an ID. Lowered from 0.60 to 0.20 to catch zoomed-out faces.
      if (ratio > 0.20) {
        return {
          isValid: false,
          score: 0,
          reason: "Selfie detected. Please capture your physical ID card, not your face."
        };
      }
    }

    // --- NEGATIVE FILTERING STRATEGY ---
    // The default AI model (COCO dataset) does NOT have classes for "ID card", "license", or "passport".
    // It only knows "book" (which is why thick passports work, but plastic cards fail).
    // Therefore, we cannot strictly require a positive "ID" detection.
    // Instead, we trust the frame as long as it passes our security checks (no screens, no large faces).
    
    return { isValid: true, score: 1.0 };
  }
}

export const idEngine = new IDEngine();
