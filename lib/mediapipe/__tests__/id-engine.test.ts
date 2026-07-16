import { IDEngine } from "../id-engine";
import { visionManager } from "../vision-manager";

// Mock the visionManager
jest.mock("../vision-manager", () => ({
  visionManager: {
    createHandLandmarker: jest.fn(),
    createObjectDetector: jest.fn(),
  }
}));

describe("IDEngine", () => {
  let engine: IDEngine;
  let mockHandLandmarker: any;
  let mockObjectDetector: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockHandLandmarker = { detect: jest.fn() };
    mockObjectDetector = { detect: jest.fn() };

    (visionManager.createHandLandmarker as jest.Mock).mockResolvedValue(mockHandLandmarker);
    (visionManager.createObjectDetector as jest.Mock).mockResolvedValue(mockObjectDetector);

    engine = new IDEngine();
  });

  const createMockVideo = (width = 640, height = 480) => ({
    videoWidth: width,
    videoHeight: height,
  } as HTMLVideoElement);

  describe("warmup", () => {
    it("initializes models", async () => {
      await engine.warmup();
      expect(visionManager.createObjectDetector).toHaveBeenCalled();
      expect(visionManager.createHandLandmarker).toHaveBeenCalled();
    });
  });

  describe("validateIDCard", () => {
    it("returns error if camera stream is initializing", async () => {
      const video = createMockVideo(0, 0);
      const result = await engine.validateIDCard(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Camera stream initializing...");
    });

    it("detects digital spoofing (phone/screen)", async () => {
      const video = createMockVideo();
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      mockObjectDetector.detect.mockReturnValue({
        detections: [{ categories: [{ categoryName: "cell phone", score: 0.3 }] }]
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await engine.validateIDCard(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("Digital screens are not allowed");
      consoleSpy.mockRestore();
    });

    it("allows phone detection if score is low (e.g. glossy reflection falsely flagged)", async () => {
      const video = createMockVideo();
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      mockObjectDetector.detect.mockReturnValue({
        detections: [{ categories: [{ categoryName: "cell phone", score: 0.1 }] }]
      });

      const result = await engine.validateIDCard(video);
      expect(result.isValid).toBe(true);
    });

    it("blocks selfies in the ID step", async () => {
      const video = createMockVideo(100, 100);
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      
      // Person bounding box taking up 50% of the screen (50x100)
      mockObjectDetector.detect.mockReturnValue({
        detections: [{
          categories: [{ categoryName: "person", score: 0.9 }],
          boundingBox: { width: 50, height: 100 }
        }]
      });

      const result = await engine.validateIDCard(video);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("Selfie detected");
    });

    it("allows person detection if bounding box is very small (e.g. photo on ID card)", async () => {
      const video = createMockVideo(100, 100);
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      
      // Person bounding box taking up only 5% of the screen
      mockObjectDetector.detect.mockReturnValue({
        detections: [{
          categories: [{ categoryName: "person", score: 0.9 }],
          boundingBox: { width: 10, height: 50 }
        }]
      });

      const result = await engine.validateIDCard(video);
      expect(result.isValid).toBe(true);
    });

    it("passes valid ID card scans", async () => {
      const video = createMockVideo();
      mockHandLandmarker.detect.mockReturnValue({ landmarks: [] });
      mockObjectDetector.detect.mockReturnValue({ detections: [] });

      const result = await engine.validateIDCard(video);
      expect(result.isValid).toBe(true);
    });
  });
});
