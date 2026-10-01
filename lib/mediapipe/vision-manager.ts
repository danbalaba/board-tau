import { FilesetResolver, ObjectDetector, FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * Global Manager for MediaPipe Vision Tasks
 * Models are served locally from /public/models/
 */
class VisionManager {
  private static instance: VisionManager;
  private wasmResolver: any = null;
  private faceLandmarkerInstance: FaceLandmarker | null = null;
  private objectDetectorInstance: ObjectDetector | null = null;

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
    if (!this.faceLandmarkerInstance) {
      const resolver = await this.getResolver();
      try {
        this.faceLandmarkerInstance = await FaceLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: `/models/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
          numFaces: 1,
        });
      } catch (gpuErr) {
        console.warn("[VisionManager] GPU delegate failed for FaceLandmarker, falling back to CPU:", gpuErr);
        this.faceLandmarkerInstance = await FaceLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: `/models/face_landmarker.task`,
            delegate: "CPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
          numFaces: 1,
        });
      }
    }
    return this.faceLandmarkerInstance;
  }

  public async createObjectDetector(): Promise<ObjectDetector> {
    if (!this.objectDetectorInstance) {
      const resolver = await this.getResolver();
      try {
        this.objectDetectorInstance = await ObjectDetector.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: `/models/id_detector.tflite`,
            delegate: "GPU",
          },
          scoreThreshold: 0.5,
          runningMode: "IMAGE",
        });
      } catch (gpuErr) {
        console.warn("[VisionManager] GPU delegate failed for ObjectDetector, falling back to CPU:", gpuErr);
        this.objectDetectorInstance = await ObjectDetector.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: `/models/id_detector.tflite`,
            delegate: "CPU",
          },
          scoreThreshold: 0.5,
          runningMode: "IMAGE",
        });
      }
    }
    return this.objectDetectorInstance;
  }
  
  public disposeAll() {
    this.faceLandmarkerInstance?.close();
    this.objectDetectorInstance?.close();
    this.faceLandmarkerInstance = null;
    this.objectDetectorInstance = null;
  }
}

export const visionManager = VisionManager.getInstance();
