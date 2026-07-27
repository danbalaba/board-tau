import { FaceLandmarker, ObjectDetector } from "@mediapipe/tasks-vision";
import { visionManager } from "./vision-manager";

export interface FaceValidationResult {
  isValid: boolean;
  score: number;
  reason?: string;
  blinkDetected?: boolean;
}

/**
 * Advanced Face Verification Engine with Multi-Model Security
 * v5.0: Blink-based Liveness Detection
 */
export class FaceEngine {
  private faceLandmarker: FaceLandmarker | null = null;
  private objectDetector: ObjectDetector | null = null;

  public async warmup() {
    await this.getModels();
  }

  public dispose() {
    visionManager.disposeAll();
    this.faceLandmarker = null;
    this.objectDetector = null;
  }

  private async getModels() {
    if (!this.faceLandmarker) this.faceLandmarker = await visionManager.createFaceLandmarker();
    if (!this.objectDetector) this.objectDetector = await visionManager.createObjectDetector();
    return { 
      face: this.faceLandmarker, 
      object: this.objectDetector
    };
  }

  public async validateFace(
    imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ): Promise<FaceValidationResult> {
    const { face, object } = await this.getModels();

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

    // 1. ANTI-SPOOFING (Phone/Screen Detection)
    const objectResult = object.detect(imageElement);
    const spoofCategories = [
      "phone", "cell", "laptop", "tv", "monitor", "tablet", 
      "screen", "display", "book", "remote", "paper", "picture", "photo"
    ];
    
    const spoofDetection = objectResult.detections?.find(d => {
      const categoryName = d.categories[0].categoryName.toLowerCase();
      return spoofCategories.some(spoof => categoryName.includes(spoof));
    });

    // Extreme Paranoia Threshold (10%) to catch completely obscured/close-up devices
    if (spoofDetection && spoofDetection.categories[0].score > 0.10) {
      return {
        isValid: false,
        score: 0,
        reason: `Spoofing detected (${spoofDetection.categories[0].categoryName}). Please use your real face.`
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

    // Thresholds tuned for typical webcam distances. 
    // Lowered noseMouthDist from 0.045 to 0.030 to support zoomed-out faces.
    if (noseMouthDist < 0.030 || mouthWidth < eyeWidth * 0.45 || symmetryRatio > 1.4) {
      return { 
        isValid: false, 
        score: 0.3, 
        reason: "Face obscured. Ensure your eyes, nose, and mouth are clearly visible." 
      };
    }

    return { isValid: true, score: 1.0 };
  }

  /**
   * LIGHTWEIGHT FAST VALIDATION (For Live Polling)
   * Only runs FaceLandmarker (No ObjectDetector, No HandLandmarker)
   * Also returns liveness state so we don't have to call FaceLandmarker twice.
   */
  public async quickValidateFace(
    imageElement: HTMLVideoElement | HTMLCanvasElement
  ): Promise<{ 
    isValid: boolean; 
    liveness: { blink: boolean; smile: boolean; turnLeft: boolean; turnRight: boolean } | null 
  }> {
    const { face } = await this.getModels();
    
    const width = 'videoWidth' in imageElement ? imageElement.videoWidth : imageElement.width;
    const height = 'videoHeight' in imageElement ? imageElement.videoHeight : imageElement.height;
    if (!width || width === 0 || !height || height === 0) {
      return { isValid: false, liveness: null };
    }

    const faceResult = face.detect(imageElement);
    if (!faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) {
      return { isValid: false, liveness: null };
    }

    const landmarks = faceResult.faceLandmarks[0];

    // 1. POSITIONING & CENTERING
    const noseTip = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    
    const faceCenterX = (leftEye.x + rightEye.x + noseTip.x) / 3;
    const faceCenterY = (leftEye.y + rightEye.y + noseTip.y) / 3;

    let isValid = true;
    if (faceCenterX < 0.35 || faceCenterX > 0.65 || faceCenterY < 0.25 || faceCenterY > 0.75) {
      isValid = false;
    }

    // 2. LIVENESS & TURN EXTRACTION
    const leftTragus = landmarks[234];
    const rightTragus = landmarks[454];

    const leftDist = Math.abs(noseTip.x - leftTragus.x);
    const rightDist = Math.abs(noseTip.x - rightTragus.x);

    let turnLeft = false;
    let turnRight = false;
    
    // FIXED MIRRORING BUG:
    if (leftDist > 0 && rightDist > 0) {
      if (rightDist / leftDist > 2.0) turnRight = true;
      if (leftDist / rightDist > 2.0) turnLeft = true;
    }

    let blink = false;
    let smile = false;

    if (faceResult.faceBlendshapes && faceResult.faceBlendshapes.length > 0) {
      const categories = faceResult.faceBlendshapes[0].categories;
      const leftBlink = categories.find(c => c.categoryName === 'eyeBlinkLeft')?.score ?? 0;
      const rightBlink = categories.find(c => c.categoryName === 'eyeBlinkRight')?.score ?? 0;
      const smileLeft = categories.find(c => c.categoryName === 'mouthSmileLeft')?.score ?? 0;
      const smileRight = categories.find(c => c.categoryName === 'mouthSmileRight')?.score ?? 0;

      if (leftBlink > 0.45 || rightBlink > 0.45) blink = true;
      if (smileLeft > 0.5 && smileRight > 0.5) smile = true;
    }

    return { 
      isValid, 
      liveness: { blink, smile, turnLeft, turnRight } 
    };
  }

  /**
   * LIVENESS CHECK: Returns states for randomized challenge-response liveness.
   * Returns { blink, smile, turnLeft, turnRight }
   * The caller tracks these to pass randomly assigned challenges.
   */
  public async getLivenessState(
    imageElement: HTMLVideoElement
  ): Promise<{ blink: boolean; smile: boolean; turnLeft: boolean; turnRight: boolean } | null> {
    const { face } = await this.getModels();

    const width = imageElement.videoWidth;
    const height = imageElement.videoHeight;
    if (!width || !height) return null;

    const faceResult = face.detect(imageElement);
    if (!faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) return null;

    // 1. Calculate Head Yaw (Turn Left/Right)
    const landmarks = faceResult.faceLandmarks[0];
    const noseTip = landmarks[1];
    const leftTragus = landmarks[234]; // Left side of face (viewer's right if mirrored)
    const rightTragus = landmarks[454]; // Right side of face

    const leftDist = Math.abs(noseTip.x - leftTragus.x);
    const rightDist = Math.abs(noseTip.x - rightTragus.x);

    // If one side is much smaller than the other, the head is turned
    // The user's left is mirrored, so if rightDist is small, they are looking right
    let turnLeft = false;
    let turnRight = false;
    
    // Threshold for head turn (ratio > 2.0 means significant turn)
    // FIXED MIRRORING BUG:
    if (leftDist > 0 && rightDist > 0) {
      if (rightDist / leftDist > 2.0) turnRight = true;
      if (leftDist / rightDist > 2.0) turnLeft = true;
    }

    // 2. Calculate Blendshapes (Blink, Smile)
    let blink = false;
    let smile = false;

    if (faceResult.faceBlendshapes && faceResult.faceBlendshapes.length > 0) {
      const categories = faceResult.faceBlendshapes[0].categories;
      const leftBlink = categories.find(c => c.categoryName === 'eyeBlinkLeft')?.score ?? 0;
      const rightBlink = categories.find(c => c.categoryName === 'eyeBlinkRight')?.score ?? 0;
      const smileLeft = categories.find(c => c.categoryName === 'mouthSmileLeft')?.score ?? 0;
      const smileRight = categories.find(c => c.categoryName === 'mouthSmileRight')?.score ?? 0;

      if (leftBlink > 0.45 || rightBlink > 0.45) blink = true;
      if (smileLeft > 0.5 && smileRight > 0.5) smile = true;
    }

    return { blink, smile, turnLeft, turnRight };
  }
}

export const faceEngine = new FaceEngine();

