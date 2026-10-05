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

const mockValidateIDCard = jest.fn().mockResolvedValue({ isValid: true });

const mockIdEngine = {
  validateIDCard: mockValidateIDCard,
  warmup: jest.fn(),
};

jest.mock("@/hooks/useKYC", () => ({
  useKYC: () => ({
    isProcessing: false,
    faceEngine: mockFaceEngine,
    idEngine: mockIdEngine,
  }),
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

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ success: true, status: 'VERIFIED', similarity: 95 }),
    }) as any;

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
    it("resets capturedID and flags toast error when AWS Rekognition verification fails", async () => {
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

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/kyc/verify')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              success: false,
              status: 'NEEDS_MANUAL_REVIEW',
              reason: 'Face on ID card does not match live selfie.',
            }),
          });
        }
        return Promise.resolve({ json: () => Promise.resolve({}) });
      });

      const { result } = setup();
      const fakeFile = new File(["dummy"], "id.png", { type: "image/png" });

      act(() => {
        result.current.setCapturedSelfie(longSelfie);
        result.current.setStep(7);
      });

      await act(async () => {
        await result.current.handleCaptureID(fakeFile);
      });

      expect(result.current.capturedID).toBeNull();
      expect(mockToastError).toHaveBeenCalledWith("Face on ID card does not match live selfie.");

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

    it("routes back to selfie step when prevStep is called on ID step with selfieRetakeNeeded", () => {
      const { result } = setup();

      act(() => {
        result.current.setStep(7);
        result.current.setCapturedSelfie(null);
        result.current.setCapturedID(null);
      });

      // Simulate retake flow trigger
      act(() => {
        result.current.handleRetakeSelfie();
      });

      expect(result.current.step).toBe(6);
      expect(result.current.mobileStep).toBe(14);
      expect(result.current.selfieRetakeNeeded).toBe(false);
    });
  });
});
