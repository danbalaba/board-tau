import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * Global Manager for MediaPipe Vision Tasks
 * Models are served locally from /public/models/
 */
class VisionManager {
  private static instance: VisionManager;
  private wasmResolver: any = null;
  private faceLandmarkerInstance: FaceLandmarker | null = null;

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
  
  public disposeAll() {
    this.faceLandmarkerInstance?.close();
    this.faceLandmarkerInstance = null;
  }
}

export const visionManager = VisionManager.getInstance();
