import { renderHook, act } from "@testing-library/react";
import { useHostApplicationLogic } from "../useHostApplicationLogic";

// -- Mocks --
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/lib/edgestore", () => ({
  useEdgeStore: () => ({
    edgestore: {
      identityDocs: {
        upload: jest.fn().mockResolvedValue({ url: "https://edgestore.example.com/file" }),
      },
      publicFiles: {
        upload: jest.fn().mockResolvedValue({ url: "https://edgestore.example.com/public" }),
      },
    },
  }),
}));

const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastLoading = jest.fn();
jest.mock("@/components/common/ResponsiveToast", () => ({
  useResponsiveToast: () => ({
    error: mockToastError,
    success: mockToastSuccess,
    loading: mockToastLoading,
  }),
}));

const mockValidateFace = jest.fn().mockResolvedValue({ isValid: true });
const mockQuickValidateFace = jest.fn().mockResolvedValue({ isValid: true, liveness: { blink: false, smile: false, turnLeft: false, turnRight: false } });

const mockFaceEngine = {
  validateFace: mockValidateFace,
  quickValidateFace: mockQuickValidateFace,
  warmup: () => Promise.resolve(),
  dispose: jest.fn(),
};

const mockIdEngine = {
  validateIDCard: jest.fn(),
  warmup: jest.fn(),
};

jest.mock("@/hooks/useKYC", () => ({
  useKYC: () => ({
    isProcessing: false,
    faceEngine: mockFaceEngine,
    idEngine: mockIdEngine,
  }),
}));

const mockGetFaceDescriptor = jest.fn().mockResolvedValue(new Float32Array(128));
const mockGetFaceDistance = jest.fn().mockReturnValue(0.3);

jest.mock("@/lib/mediapipe/face-matcher", () => ({
  faceMatcher: {
    getFaceDescriptor: (...args: any[]) => mockGetFaceDescriptor(...args),
    getFaceDescriptorCached: (...args: any[]) => mockGetFaceDescriptor(...args),
    getFaceDistance: (...args: any[]) => mockGetFaceDistance(...args),
  },
}));

jest.mock("@/services/landlord/applications", () => ({
  createHostApplication: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/utils/draftStorage", () => ({
  saveDraftToStorage: jest.fn().mockResolvedValue(undefined),
  loadDraftFromStorage: jest.fn().mockResolvedValue(null),
  clearDraftFromStorage: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-hook-form
let mockValues: any = {};
let mockErrors: any = {};
const mockTrigger = jest.fn().mockResolvedValue(true);
const mockSetValue = jest.fn((k, v) => { mockValues[k] = v; });

jest.mock("react-hook-form", () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (fn: any) => fn,
    formState: { errors: mockErrors },
    setValue: mockSetValue,
    getValues: () => mockValues,
    trigger: mockTrigger,
    watch: jest.fn((cb) => {
      return { unsubscribe: jest.fn() };
    }),
    control: {},
    clearErrors: jest.fn(),
    setError: jest.fn(),
    reset: jest.fn(),
  }),
}));

describe("useHostApplicationLogic hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.Image = class {
      onload: () => void;
      onerror: () => void;
      _src: string;
      constructor() {
        this.onload = () => {};
        this.onerror = () => {};
        this._src = "";
      }
      set src(value: string) {
        this._src = value;
        setTimeout(() => this.onload(), 0);
      }
      get src() {
        return this._src;
      }
    } as any;

    mockValues = {
      businessInfo: { businessName: "", businessType: "", yearsExperience: "" },
      contactInfo: { fullName: "", phoneNumber: "", email: "", ownershipRole: "" },
      propertyEvidence: { address: "", facadePhotoUrl: "", latlng: [15.4822, 120.5963] },
      verification: { selfieUrl: "", idCardUrl: "", businessPermitUrl: "", fireSafetyUrl: "" },
    };
    mockErrors = {};
  });

  const setup = () => {
    return renderHook(() => useHostApplicationLogic());
  };

  it("initializes with desktop step 0 and mobile step 1", () => {
    const { result } = setup();
    expect(result.current.step).toBe(0);
    expect(result.current.mobileStep).toBe(1);
  });

  describe("handleRetakeSelfie and Blurry Selfie Reset", () => {
    it("resets capturedSelfie, capturedID, and flags selfieRetakeNeeded when live selfie descriptor is missing", async () => {
      const longSelfie = "data:image/png;base64," + "A".repeat(500);
      const longID = "data:image/png;base64," + "B".repeat(500);

      const originalFileReader = global.FileReader;
      global.FileReader = class {
        onload: any;
        readAsDataURL() {
          setTimeout(() => this.onload(), 0);
        }
        result = longID;
      } as any;

      mockGetFaceDescriptor.mockResolvedValueOnce(null); // Selfie descriptor fails due to blur

      const { result } = setup();
      const fakeFile = new File(["dummy"], "id.png", { type: "image/png" });

      act(() => {
        result.current.setCapturedSelfie(longSelfie);
        result.current.setStep(7);
      });

      await act(async () => {
        await result.current.handleCaptureID(fakeFile);
      });

      expect(result.current.selfieRetakeNeeded).toBe(true);
      expect(result.current.capturedSelfie).toBeNull();
      expect(result.current.capturedID).toBeNull();
      expect(mockToastError).toHaveBeenCalledWith("Could not verify your live selfie. Please retake it.");

      global.FileReader = originalFileReader;
    });

    it("executes handleRetakeSelfie cleanly and updates step and mobileStep", () => {
      const { result } = setup();

      act(() => {
        result.current.setStep(7);
        result.current.setCapturedSelfie("selfie-data");
        result.current.setCapturedID("id-data");
      });

      act(() => {
        result.current.handleRetakeSelfie();
      });

      expect(result.current.step).toBe(6);
      expect(result.current.mobileStep).toBe(14);
      expect(result.current.selfieRetakeNeeded).toBe(false);
      expect(result.current.capturedSelfie).toBeNull();
      expect(result.current.capturedID).toBeNull();
    });

    it("routes back to selfie step when prevStep is called on ID step with selfieRetakeNeeded", async () => {
      const longSelfie = "data:image/png;base64," + "A".repeat(500);
      const longID = "data:image/png;base64," + "B".repeat(500);

      const originalFileReader = global.FileReader;
      global.FileReader = class {
        onload: any;
        readAsDataURL() {
          setTimeout(() => this.onload(), 0);
        }
        result = longID;
      } as any;

      mockGetFaceDescriptor.mockResolvedValueOnce(null); // Selfie descriptor fails

      const { result } = setup();
      const fakeFile = new File(["dummy"], "id.png", { type: "image/png" });

      act(() => {
        result.current.setCapturedSelfie(longSelfie);
        result.current.setStep(7);
      });

      await act(async () => {
        await result.current.handleCaptureID(fakeFile);
      });

      expect(result.current.selfieRetakeNeeded).toBe(true);

      // Now call prevStep on step 7 while selfieRetakeNeeded is true
      act(() => {
        result.current.prevStep();
      });

      // Should immediately call handleRetakeSelfie and move to step 6 / mobileStep 14
      expect(result.current.step).toBe(6);
      expect(result.current.mobileStep).toBe(14);
      expect(result.current.selfieRetakeNeeded).toBe(false);

      global.FileReader = originalFileReader;
    });
  });
});
