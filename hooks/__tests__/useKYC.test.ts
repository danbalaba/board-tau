import { renderHook, act, waitFor } from "@testing-library/react";
import { useKYC } from "../useKYC";

// Mock the AI engines
jest.mock("@/lib/mediapipe/face-engine", () => ({
  faceEngine: {
    warmup: jest.fn().mockResolvedValue(true),
    validateFace: jest.fn(),
  },
}));

jest.mock("@/lib/mediapipe/id-engine", () => ({
  idEngine: {
    warmup: jest.fn().mockResolvedValue(true),
    validateIDCard: jest.fn(),
  },
}));

// Mock ResponsiveToast
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock("@/components/common/ResponsiveToast", () => ({
  useResponsiveToast: () => ({
    error: mockToastError,
    success: mockToastSuccess,
  }),
}));

describe("useKYC hook", () => {
  const { faceEngine } = require("@/lib/mediapipe/face-engine");
  const { idEngine } = require("@/lib/mediapipe/id-engine");

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the browser's Image object so that setting .src triggers onload
    // because JSDOM does not natively load dummy base64 images.
    global.Image = class {
      onload: any;
      _src: string = "";
      set src(val: string) {
        this._src = val;
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
      get src() {
        return this._src;
      }
    } as any;
  });

  it("initializes and warms up engines on mount", async () => {
    const { result } = renderHook(() => useKYC());
    
    // Initially isInitializing is true
    expect(result.current.isInitializing).toBe(true);
    
    await waitFor(() => {
      expect(faceEngine.warmup).toHaveBeenCalled();
      expect(idEngine.warmup).toHaveBeenCalled();
      expect(result.current.isInitializing).toBe(false);
    });
  });

  describe("validateSelfie", () => {
    it("returns true and shows success toast when face is valid", async () => {
      faceEngine.validateFace.mockResolvedValueOnce({ isValid: true });
      
      const { result } = renderHook(() => useKYC());
      
      let isValid = false;
      await act(async () => {
        // Pass a dummy data URL
        isValid = await result.current.validateSelfie("data:image/png;base64,dummy");
      });

      expect(isValid).toBe(true);
      expect(mockToastSuccess).toHaveBeenCalledWith("Face verified successfully!");
    });

    it("returns false and shows error toast when face is invalid", async () => {
      faceEngine.validateFace.mockResolvedValueOnce({ isValid: false, reason: "No face detected" });
      
      const { result } = renderHook(() => useKYC());
      
      let isValid = true;
      await act(async () => {
        isValid = await result.current.validateSelfie("data:image/png;base64,dummy");
      });

      expect(isValid).toBe(false);
      expect(mockToastError).toHaveBeenCalledWith("No face detected");
    });
  });

  describe("validateID", () => {
    it("returns true and shows success toast when ID is valid", async () => {
      idEngine.validateIDCard.mockResolvedValueOnce({ isValid: true });
      
      const { result } = renderHook(() => useKYC());
      
      let isValid = false;
      await act(async () => {
        isValid = await result.current.validateID("data:image/png;base64,dummy");
      });

      expect(isValid).toBe(true);
      expect(mockToastSuccess).toHaveBeenCalledWith("ID card detected!");
    });

    it("returns false and shows error toast when ID is invalid", async () => {
      idEngine.validateIDCard.mockResolvedValueOnce({ isValid: false, reason: "ID not found" });
      
      const { result } = renderHook(() => useKYC());
      
      let isValid = true;
      await act(async () => {
        isValid = await result.current.validateID("data:image/png;base64,dummy");
      });

      expect(isValid).toBe(false);
      expect(mockToastError).toHaveBeenCalledWith("ID not found");
    });
  });
});
