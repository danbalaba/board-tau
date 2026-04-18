import { ObjectDetector } from "@mediapipe/tasks-vision";
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

  private async getDetector() {
    if (!this.detector) {
      this.detector = await visionManager.createObjectDetector();
    }
    return this.detector;
  }

  public async validateIDCard(
    imageElement: HTMLImageElement | HTMLCanvasElement
  ): Promise<IDValidationResult> {
    const detector = await this.getDetector();
    const result = detector.detect(imageElement);

    if (!result.detections || result.detections.length === 0) {
      return { 
        isValid: false, 
        score: 0, 
        reason: "ID card not detected. Please ensure the card is inside the frame and well-lit." 
      };
    }

    // --- ANTI-SPOOFING: PHONE DETECTION ---
    // EfficientDet Lite models can detect "cell phone" (label index 67 in COCO)
    // We check if a phone is present in the frame
    const phoneDetection = result.detections.find(d => 
      d.categories[0].categoryName.toLowerCase().includes("phone") ||
      d.categories[0].categoryName.toLowerCase().includes("screen")
    );

    if (phoneDetection && phoneDetection.categories[0].score > 0.4) {
      console.log("[KYC Security] Digital Spoofing Detected (Phone in frame).");
      return {
        isValid: false,
        score: 0,
        reason: "Digital screens or phones are not allowed. Please use your physical ID card."
      };
    }

    // --- ID CARD DETECTION ---
    // We look for objects that resemble a card/document
    const cardDetection = result.detections.find(d => 
      d.categories[0].categoryName.toLowerCase().includes("card") ||
      d.categories[0].categoryName.toLowerCase().includes("document") ||
      d.categories[0].categoryName.toLowerCase().includes("book") // Passport often detected as book
    );

    if (!cardDetection) {
      return {
        isValid: false,
        score: 0,
        reason: "ID card not detected. Please ensure the card is clearly visible."
      };
    }

    // Check confidence
    if (cardDetection.categories[0].score < 0.5) {
      return {
        isValid: false,
        score: cardDetection.categories[0].score,
        reason: "Image too blurry. Please ensure the ID card is in focus."
      };
    }

    return { isValid: true, score: cardDetection.categories[0].score };
  }
}

export const idEngine = new IDEngine();
