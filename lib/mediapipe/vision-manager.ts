import { FilesetResolver, ObjectDetector, FaceLandmarker, HandLandmarker } from "@mediapipe/tasks-vision";

/**
 * Global Manager for MediaPipe Vision Tasks
 * Models are served locally from /public/models/
 */
class VisionManager {
  private static instance: VisionManager;
  private wasmResolver: any = null;

  private constructor() {}

  public static getInstance(): VisionManager {
    if (!VisionManager.instance) {
      VisionManager.instance = new VisionManager();
    }
    return VisionManager.instance;
  }

  public async getResolver() {
    if (!this.wasmResolver) {
      this.wasmResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
    }
    return this.wasmResolver;
  }

  public async createFaceLandmarker(): Promise<FaceLandmarker> {
    const resolver = await this.getResolver();
    return await FaceLandmarker.createFromOptions(resolver, {
      baseOptions: {
        modelAssetPath: `/models/face_landmarker.task`,
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "IMAGE",
      numFaces: 1,
    });
  }

  /**
   * NEW: Creates a Hand Landmarker to detect hands during selfie capture
   */
  public async createHandLandmarker(): Promise<HandLandmarker> {
    const resolver = await this.getResolver();
    return await HandLandmarker.createFromOptions(resolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numHands: 2,
    });
  }

  public async createObjectDetector(): Promise<ObjectDetector> {
    const resolver = await this.getResolver();
    return await ObjectDetector.createFromOptions(resolver, {
      baseOptions: {
        modelAssetPath: `/models/id_detector.tflite`,
        delegate: "GPU",
      },
      scoreThreshold: 0.5,
      runningMode: "IMAGE",
    });
  }
}

export const visionManager = VisionManager.getInstance();
