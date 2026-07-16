import { visionManager } from "../vision-manager";
import { FilesetResolver, FaceLandmarker, HandLandmarker, ObjectDetector } from "@mediapipe/tasks-vision";

jest.mock("@mediapipe/tasks-vision", () => {
  return {
    FilesetResolver: {
      forVisionTasks: jest.fn().mockResolvedValue("mock-resolver"),
    },
    FaceLandmarker: {
      createFromOptions: jest.fn().mockResolvedValue("mock-face-landmarker"),
    },
    HandLandmarker: {
      createFromOptions: jest.fn().mockResolvedValue("mock-hand-landmarker"),
    },
    ObjectDetector: {
      createFromOptions: jest.fn().mockResolvedValue("mock-object-detector"),
    },
  };
});

describe("visionManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("is a singleton", () => {
    // We can't access VisionManager constructor directly since it's private,
    // but we can assert the exported instance is always the same.
    const instance1 = visionManager;
    const instance2 = visionManager;
    expect(instance1).toBe(instance2);
  });

  it("resolves the wasmResolver only once", async () => {
    const resolver = await visionManager.getResolver();
    expect(resolver).toBe("mock-resolver");
    expect(FilesetResolver.forVisionTasks).toHaveBeenCalledTimes(1);

    // Call again, should not call forVisionTasks again
    const resolver2 = await visionManager.getResolver();
    expect(resolver2).toBe("mock-resolver");
    expect(FilesetResolver.forVisionTasks).toHaveBeenCalledTimes(1);
  });

  it("creates FaceLandmarker with correct options", async () => {
    const face = await visionManager.createFaceLandmarker();
    expect(face).toBe("mock-face-landmarker");
    expect(FaceLandmarker.createFromOptions).toHaveBeenCalledWith("mock-resolver", expect.objectContaining({
      baseOptions: {
        modelAssetPath: `/models/face_landmarker.task`,
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "IMAGE",
      numFaces: 1,
    }));
  });

  it("creates HandLandmarker with correct options", async () => {
    const hand = await visionManager.createHandLandmarker();
    expect(hand).toBe("mock-hand-landmarker");
    expect(HandLandmarker.createFromOptions).toHaveBeenCalledWith("mock-resolver", expect.objectContaining({
      runningMode: "IMAGE",
      numHands: 2,
    }));
  });

  it("creates ObjectDetector with correct options", async () => {
    const obj = await visionManager.createObjectDetector();
    expect(obj).toBe("mock-object-detector");
    expect(ObjectDetector.createFromOptions).toHaveBeenCalledWith("mock-resolver", expect.objectContaining({
      baseOptions: {
        modelAssetPath: `/models/id_detector.tflite`,
        delegate: "GPU",
      },
      scoreThreshold: 0.5,
      runningMode: "IMAGE",
    }));
  });
});
