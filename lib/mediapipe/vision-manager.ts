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
      const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // On mobile (especially iOS WebKit), GPU WebGL delegate causes severe thermal throttling and WebGL crashes.
      // CPU delegate uses WebAssembly SIMD, which runs cool, stays within RAM limits, and avoids Safari crashes.
      const primaryDelegate = isMobile ? "CPU" : "GPU";
      const secondaryDelegate = isMobile ? "GPU" : "CPU";

      try {
        this.faceLandmarkerInstance = await FaceLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: `/models/face_landmarker.task`,
            delegate: primaryDelegate,
          },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
          numFaces: 1,
        });
      } catch (err) {
        console.warn(`[VisionManager] ${primaryDelegate} delegate failed for FaceLandmarker, falling back to ${secondaryDelegate}:`, err);
        this.faceLandmarkerInstance = await FaceLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: `/models/face_landmarker.task`,
            delegate: secondaryDelegate,
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
