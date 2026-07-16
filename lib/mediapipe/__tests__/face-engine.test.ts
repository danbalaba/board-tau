import { FaceEngine } from "../face-engine";
import { visionManager } from "../vision-manager";

// Mock the visionManager
jest.mock("../vision-manager", () => ({
  visionManager: {
    createFaceLandmarker: jest.fn(),
    createHandLandmarker: jest.fn(),
    createObjectDetector: jest.fn(),
  }
}));

describe("FaceEngine", () => {
  let engine: FaceEngine;
  let mockFaceLandmarker: any;
  let mockHandLandmarker: any;
  let mockObjectDetector: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFaceLandmarker = { detect: jest.fn() };
    mockHandLandmarker = { detect: jest.fn() };
    mockObjectDetector = { detect: jest.fn() };

    (visionManager.createFaceLandmarker as jest.Mock).mockResolvedValue(mockFaceLandmarker);
    (visionManager.createHandLandmarker as jest.Mock).mockResolvedValue(mockHandLandmarker);
    (visionManager.createObjectDetector as jest.Mock).mockResolvedValue(mockObjectDetector);

    engine = new FaceEngine();
  });

  const createMockVideo = (width = 640, height = 480) => ({
    videoWidth: width,
    videoHeight: height,
  } as HTMLVideoElement);

  describe("warmup", () => {
    it("initializes all models", async () => {
      await engine.warmup();
      expect(visionManager.createFaceLandmarker).toHaveBeenCalled();
      expect(visionManager.createHandLandmarker).toHaveBeenCalled();
      expect(visionManager.createObjectDetector).toHaveBeenCalled();
    });
  });

  describe("validateFace", () => {
    it("returns error if camera stream is initializing", async () => {
      const video = createMockVideo(0, 0);
      const result = await engine.validateFace(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Camera stream initializing...");
    });

    it("detects spoofing (phone/screen)", async () => {
      const video = createMockVideo();
      mockObjectDetector.detect.mockReturnValue({
        detections: [{ categories: [{ categoryName: "cell phone", score: 0.15 }] }]
      });
      const result = await engine.validateFace(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("Spoofing detected");
    });

    it("detects hands in frame", async () => {
      const video = createMockVideo();
      mockObjectDetector.detect.mockReturnValue({ detections: [] });
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [[{x: 0, y: 0}]] });
      
      const result = await engine.validateFace(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("Hand detected");
    });

    it("fails if no face detected", async () => {
      const video = createMockVideo();
      mockObjectDetector.detect.mockReturnValue({ detections: [] });
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      mockFaceLandmarker.detect.mockReturnValue({ faceLandmarks: [] });

      const result = await engine.validateFace(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("No face detected");
    });

    it("fails if face is not centered", async () => {
      const video = createMockVideo();
      mockObjectDetector.detect.mockReturnValue({ detections: [] });
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      
      // Face pushed to the extreme top left
      mockFaceLandmarker.detect.mockReturnValue({ 
        faceLandmarks: [
          Array(300).fill({ x: 0.1, y: 0.1 })
        ] 
      });

      const result = await engine.validateFace(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("Face not centered");
    });

    it("fails if eyes are closed", async () => {
      const video = createMockVideo();
      mockObjectDetector.detect.mockReturnValue({ detections: [] });
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      
      // Perfectly centered face
      const landmarks = Array(300).fill({ x: 0.5, y: 0.5 });
      
      mockFaceLandmarker.detect.mockReturnValue({ 
        faceLandmarks: [landmarks],
        faceBlendshapes: [{
          categories: [
            { categoryName: "eyeBlinkLeft", score: 0.5 },
            { categoryName: "eyeBlinkRight", score: 0.5 }
          ]
        }]
      });

      const result = await engine.validateFace(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("Please keep your eyes open");
    });

    it("fails if anatomical integrity fails (obscured/weird aspect ratio)", async () => {
      const video = createMockVideo();
      mockObjectDetector.detect.mockReturnValue({ detections: [] });
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      
      const landmarks = Array(300).fill({ x: 0.5, y: 0.5 });
      // Break symmetry ratio by making left eye super far
      landmarks[1] = { x: 0.5, y: 0.5 }; // nose
      landmarks[33] = { x: 0.1, y: 0.5 }; // left eye
      landmarks[263] = { x: 0.55, y: 0.5 }; // right eye
      landmarks[13] = { x: 0.5, y: 0.55 }; // upper lip
      landmarks[61] = { x: 0.45, y: 0.55 }; // mouth left
      landmarks[291] = { x: 0.55, y: 0.55 }; // mouth right

      mockFaceLandmarker.detect.mockReturnValue({ 
        faceLandmarks: [landmarks],
        faceBlendshapes: [{ categories: [] }]
      });

      const result = await engine.validateFace(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("Face obscured");
    });

    it("passes a valid centered face", async () => {
      const video = createMockVideo();
      mockObjectDetector.detect.mockReturnValue({ detections: [] });
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      
      const landmarks = Array(300).fill({ x: 0.5, y: 0.5 });
      // Normal proportions
      landmarks[1] = { x: 0.5, y: 0.5 }; // nose
      landmarks[33] = { x: 0.4, y: 0.4 }; // left eye
      landmarks[263] = { x: 0.6, y: 0.4 }; // right eye
      landmarks[13] = { x: 0.5, y: 0.55 }; // upper lip
      landmarks[61] = { x: 0.45, y: 0.55 }; // mouth left
      landmarks[291] = { x: 0.55, y: 0.55 }; // mouth right

      mockFaceLandmarker.detect.mockReturnValue({ 
        faceLandmarks: [landmarks],
        faceBlendshapes: [{ categories: [] }]
      });

      const result = await engine.validateFace(video);
      expect(result.isValid).toBe(true);
    });
  });

  describe("getBlinkScores", () => {
    it("returns null if video has no dimensions", async () => {
      const video = createMockVideo(0, 0);
      const result = await engine.getBlinkScores(video);
      expect(result).toBeNull();
    });

    it("returns null if no face detected", async () => {
      const video = createMockVideo();
      mockFaceLandmarker.detect.mockReturnValue({ faceLandmarks: [] });
      const result = await engine.getBlinkScores(video);
      expect(result).toBeNull();
    });

    it("returns null if no blendshapes", async () => {
      const video = createMockVideo();
      mockFaceLandmarker.detect.mockReturnValue({ 
        faceLandmarks: [[]],
        faceBlendshapes: []
      });
      const result = await engine.getBlinkScores(video);
      expect(result).toBeNull();
    });

    it("returns left and right blink scores", async () => {
      const video = createMockVideo();
      mockFaceLandmarker.detect.mockReturnValue({ 
        faceLandmarks: [[]],
        faceBlendshapes: [{
          categories: [
            { categoryName: 'eyeBlinkLeft', score: 0.7 },
            { categoryName: 'eyeBlinkRight', score: 0.8 },
          ]
        }]
      });
      const result = await engine.getBlinkScores(video);
      expect(result).toEqual({ left: 0.7, right: 0.8 });
    });
  });
});
