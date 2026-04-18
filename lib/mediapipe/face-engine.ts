import { FaceLandmarker, HandLandmarker, ObjectDetector } from "@mediapipe/tasks-vision";
import { visionManager } from "./vision-manager";

export interface FaceValidationResult {
  isValid: boolean;
  score: number;
  reason?: string;
}

/**
 * Advanced Face Verification Engine with Multi-Model Security
 * v4.0: Alignment, Hand Avoidance & Anti-Spoofing
 */
export class FaceEngine {
  private faceLandmarker: FaceLandmarker | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private objectDetector: ObjectDetector | null = null;

  private async getModels() {
    if (!this.faceLandmarker) this.faceLandmarker = await visionManager.createFaceLandmarker();
    if (!this.handLandmarker) this.handLandmarker = await visionManager.createHandLandmarker();
    if (!this.objectDetector) this.objectDetector = await visionManager.createObjectDetector();
    return { 
      face: this.faceLandmarker, 
      hand: this.handLandmarker,
      object: this.objectDetector
    };
  }

  public async validateFace(
    imageElement: HTMLImageElement | HTMLCanvasElement
  ): Promise<FaceValidationResult> {
    const { face, hand, object } = await this.getModels();

    // 1. ANTI-SPOOFING (Phone/Screen Detection)
    const objectResult = object.detect(imageElement);
    const phoneDetection = objectResult.detections?.find(d => 
      d.categories[0].categoryName.toLowerCase().includes("phone")
    );
    if (phoneDetection && phoneDetection.categories[0].score > 0.4) {
      return {
        isValid: false,
        score: 0,
        reason: "Digital screens or phones are not allowed. Please take a live selfie."
      };
    }

    // 2. HAND DETECTION
    const handResult = hand.detect(imageElement);
    if (handResult.landmarks && handResult.landmarks.length > 0) {
      return { 
        isValid: false, 
        score: 0, 
        reason: "Hand detected in frame. Please remove your hand from the camera view." 
      };
    }

    // 3. FACE DETECTION
    const faceResult = face.detect(imageElement);
    if (!faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) {
      return { isValid: false, score: 0, reason: "No face detected. Please look directly at the camera." };
    }

    const landmarks = faceResult.faceLandmarks[0];

    // Landmark Indices
    const noseTip = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const upperLip = landmarks[13];
    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];

    // 4. POSITIONING & CENTERING
    const faceCenterX = (leftEye.x + rightEye.x + noseTip.x) / 3;
    const faceCenterY = (leftEye.y + rightEye.y + noseTip.y) / 3;

    if (faceCenterX < 0.35 || faceCenterX > 0.65 || faceCenterY < 0.25 || faceCenterY > 0.75) {
      return { 
        isValid: false, 
        score: 0.1, 
        reason: "Face not centered. Please align your face perfectly inside the white dotted oval." 
      };
    }

    // 5. LIVENESS CHECK (Eyes Open)
    if (faceResult.faceBlendshapes && faceResult.faceBlendshapes.length > 0) {
      const categories = faceResult.faceBlendshapes[0].categories;
      const leftBlink = categories.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0;
      const rightBlink = categories.find(c => c.categoryName === 'eyeBlinkRight')?.score || 0;
      
      if (leftBlink > 0.45 || rightBlink > 0.45) {
        return { isValid: false, score: 0.5, reason: "Please keep your eyes open for the capture." };
      }
    }

    // 6. ANATOMICAL INTEGRITY 
    const eyeWidth = Math.abs(rightEye.x - leftEye.x);
    const noseMouthDist = Math.abs(upperLip.y - noseTip.y);
    const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
    const leftDist = Math.abs(noseTip.x - leftEye.x);
    const rightDist = Math.abs(noseTip.x - rightEye.x);
    const symmetryRatio = Math.max(leftDist, rightDist) / Math.min(leftDist, rightDist);

    if (noseMouthDist < 0.045 || mouthWidth < eyeWidth * 0.45 || symmetryRatio > 1.4) {
      return { 
        isValid: false, 
        score: 0.3, 
        reason: "Face obscured. Ensure your eyes, nose, and mouth are clearly visible." 
      };
    }

    return { isValid: true, score: 1.0 };
  }
}

export const faceEngine = new FaceEngine();
