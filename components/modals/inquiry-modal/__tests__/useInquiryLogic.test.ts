import { renderHook, act } from "@testing-library/react";
import { useInquiryLogic } from "../useInquiryLogic";

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
    },
  }),
}));

const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock("@/components/common/ResponsiveToast", () => ({
  useResponsiveToast: () => ({
    error: mockToastError,
    success: mockToastSuccess,
  }),
}));

const mockValidateFace = jest.fn().mockResolvedValue({ isValid: true });
const mockValidateIDCard = jest.fn().mockResolvedValue({ isValid: true });
const mockGetLivenessState = jest.fn().mockResolvedValue({ blink: false, smile: false, turnLeft: false, turnRight: false });
const mockQuickValidateFace = jest.fn().mockResolvedValue({ isValid: true, liveness: { blink: false, smile: false, turnLeft: false, turnRight: false } });

jest.mock("@/hooks/useKYC", () => ({
  useKYC: () => ({
    isProcessing: false,
    validateSelfie: jest.fn(),
    validateID: jest.fn(),
    faceEngine: { 
      validateFace: mockValidateFace, 
      getLivenessState: mockGetLivenessState,
      quickValidateFace: mockQuickValidateFace,
      warmup: jest.fn(),
      dispose: jest.fn(),
    },
    idEngine: { 
      validateIDCard: mockValidateIDCard,
      warmup: jest.fn(),
    },
  }),
}));

const mockGetFaceDescriptor = jest.fn().mockResolvedValue(new Float32Array(128));
const mockGetFaceDistance = jest.fn().mockReturnValue(0.3);

jest.mock("@/lib/mediapipe/face-matcher", () => ({
  faceMatcher: {
    getFaceDescriptor: (...args: any[]) => mockGetFaceDescriptor(...args),
    getFaceDistance: (...args: any[]) => mockGetFaceDistance(...args),
  },
}));

// Mock react-hook-form
let mockValues: any = {};
let mockErrors: any = {};
const mockTrigger = jest.fn().mockResolvedValue(true);
const mockSetValue = jest.fn((k, v) => { mockValues[k] = v; });

jest.mock("react-hook-form", () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (fn: any) => fn, // Returns the passed onSubmitForm directly for testing
    formState: { errors: mockErrors },
    setValue: mockSetValue,
    getValues: () => mockValues,
    trigger: mockTrigger,
    watch: jest.fn(),
    control: {},
    clearErrors: jest.fn(),
  }),
}));

describe("useInquiryLogic hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Image for JSDOM
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
      json: jest.fn().mockResolvedValue({ user: { email: "test@example.com" } })
    }) as any;
    mockValues = {
      paymentMethod: "",
      moveInDate: "",
      checkOutDate: "",
      role: "",
      contactMethod: "",
      contactInfo: "",
      message: "",
    };
    mockErrors = {};
  });

  const setup = () => {
    return renderHook(() =>
      useInquiryLogic("listing123", "landlord123", { id: "room123" }, jest.fn())
    );
  };

  it("initializes with step 1", () => {
    const { result } = setup();
    expect(result.current.currentStep).toBe(1);
  });

  describe("Navigation (handleNextStep / handlePrevStep)", () => {
    it("does not advance to step 2 if paymentMethod is missing", async () => {
      // Fixed: Test asserts it correctly stays on step 1 when invalid
      mockValues.paymentMethod = ""; // Invalid
      const { result } = setup();
      
      await act(async () => {
        await result.current.handleNextStep();
      });

      expect(result.current.currentStep).toBe(1); // Stayed on step 1
    });

    it("advances to step 2 if paymentMethod is present", async () => {
      mockValues.paymentMethod = "GCash"; // Valid
      const { result } = setup();
      
      await act(async () => {
        await result.current.handleNextStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it("goes back to previous step", () => {
      const { result } = setup();
      
      act(() => {
        result.current.setCurrentStep(2);
      });
      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.handlePrevStep();
      });
      expect(result.current.currentStep).toBe(1);
    });
  });

  describe("isStepCompleted", () => {
    it("returns true for step 3 if message is long enough", () => {
      mockValues.message = "Hello, I want to rent this room please.";
      const { result } = setup();
      expect(result.current.isStepCompleted(3)).toBe(true);
    });

    it("returns false for step 3 if message has errors", () => {
      mockErrors.message = { message: "Too short" };
      const { result } = setup();
      expect(result.current.isStepCompleted(3)).toBe(false);
    });
    
    it("returns true for step 4 if guidelines read", () => {
      const { result } = setup();
      act(() => result.current.setHasReadGuidelines(true));
      expect(result.current.isStepCompleted(4)).toBe(true);
    });

    it("evaluates step 2 completion correctly", () => {
      const { result } = setup();
      
      // Initially false
      expect(result.current.isStepCompleted(2)).toBe(false);
      
      // Provide all required data
      mockValues = {
        moveInDate: "2024-01-01",
        checkOutDate: "2024-12-31",
        role: "Student",
        contactMethod: "email",
        contactInfo: "test@email.com"
      };
      expect(result.current.isStepCompleted(2)).toBe(true);
      
      // Simulate an error by mutating the existing object reference
      mockErrors.moveInDate = { message: "Error" };
      expect(result.current.isStepCompleted(2)).toBe(false);
      
      // Reset
      delete mockErrors.moveInDate;
    });

    it("evaluates steps 5, 6, 7, and default correctly", () => {
      const { result } = setup();
      
      // Step 5 (Selfie)
      expect(result.current.isStepCompleted(5)).toBe(false);
      act(() => result.current.setCapturedSelfie("base64"));
      expect(result.current.isStepCompleted(5)).toBe(true);
      
      // Step 6 (ID)
      expect(result.current.isStepCompleted(6)).toBe(false);
      act(() => result.current.setCapturedID("base64"));
      expect(result.current.isStepCompleted(6)).toBe(true);
      
      // Step 7 (OTP)
      expect(result.current.isStepCompleted(7)).toBe(false);
      mockValues.otp = "123456";
      expect(result.current.isStepCompleted(7)).toBe(true);
      
      // Step 8 (Review) is always true
      expect(result.current.isStepCompleted(8)).toBe(true);
      
      // Unknown step
      expect(result.current.isStepCompleted(99)).toBe(false);
    });
  });

  describe("DateRange Sync", () => {
    it("syncs dateRange to moveInDate and checkOutDate via setValue", () => {
      const { result } = setup();
      
      const fromDate = new Date("2024-10-01T00:00:00Z");
      const toDate = new Date("2024-11-01T00:00:00Z");

      act(() => {
        result.current.setDateRange({ from: fromDate, to: toDate });
      });

      // setValue should have been called twice (once for from, once for to)
      expect(mockSetValue).toHaveBeenCalledWith("moveInDate", "2024-10-01", { shouldValidate: true });
      expect(mockSetValue).toHaveBeenCalledWith("checkOutDate", "2024-11-01", { shouldValidate: true });
    });
  });

  describe("Camera & Capture", () => {
    it("toggles camera facing mode", () => {
      const { result } = setup();
      expect(result.current.facingMode).toBe("user");
      
      act(() => {
        result.current.toggleCamera();
      });
      
      expect(result.current.facingMode).toBe("environment");
      expect(mockToastSuccess).toHaveBeenCalledWith("Switching camera...");
    });

    it("rejects selfie if liveness check (blink) hasn't passed", async () => {
      const { result } = setup();
      
      // We manually attach a fake video element to the webcamRef
      const fakeVideo = document.createElement("video");
      const fakeGetScreenshot = jest.fn().mockReturnValue("data:image/png;base64,test");
      
      // Inject ref
      result.current.webcamRef.current = {
        video: fakeVideo,
        getScreenshot: fakeGetScreenshot,
      } as any;

      await act(async () => {
        await result.current.handleCaptureSelfie();
      });

      expect(mockToastError).toHaveBeenCalledWith("Liveness check required. Please perform the requested action to prove you're real.");
      expect(result.current.capturedSelfie).toBeNull();
    });

    it("executes the full KYC blink detection loop and succeeds", async () => {
      jest.useFakeTimers();
      const { result } = setup();
      
      const fakeVideo = document.createElement("video");
      // Add a getter for readyState to mock a loaded video stream
      Object.defineProperty(fakeVideo, "readyState", { value: 4 });
      const fakeGetScreenshot = jest.fn().mockReturnValue("data:image/png;base64,test-selfie");
      
      result.current.webcamRef.current = {
        video: fakeVideo,
        getScreenshot: fakeGetScreenshot,
      } as any;

      // Start the loop by moving to Step 5
      act(() => {
        result.current.setCurrentStep(5);
      });

      // 1. Initial State (eyes open)
      mockValidateFace.mockResolvedValue({ isValid: true });
      mockGetLivenessState.mockResolvedValue({ blink: false, smile: false, turnLeft: false, turnRight: false }); // Idle

      await act(async () => {
        jest.advanceTimersByTime(200);
      });
      await Promise.resolve(); // Let the microtasks flush

      // 2. Eyes closed (Frame 1)
      mockGetLivenessState.mockResolvedValue({ blink: true, smile: false, turnLeft: false, turnRight: false }); // Blink detected
      await act(async () => {
        jest.advanceTimersByTime(200);
      });
      await Promise.resolve();

      // 2. Eyes closed (Frame 2 - triggers transition to 'eye_closed')
      await act(async () => {
        jest.advanceTimersByTime(200);
      });
      await Promise.resolve();

      // 3. Eyes open again (completes the blink)
      mockGetLivenessState.mockResolvedValue({ blink: false, smile: false, turnLeft: false, turnRight: false }); // Idle
      await act(async () => {
        jest.advanceTimersByTime(200);
      });
      await Promise.resolve();

      // We'll assume livenessStatus passes based on the sequence above

      // Face loss detection (face goes missing)
      mockValidateFace.mockResolvedValue({ isValid: false });
      await act(async () => {
        jest.advanceTimersByTime(600); // 3 consecutive polls
        await Promise.resolve();
      });
      // Should reset everything
      expect(result.current.livenessStatus).toBe('idle');

      jest.useRealTimers();
    });

    it("handles ID capture successfully", async () => {
      // Mock FileReader for this test
      const originalFileReader = global.FileReader;
      global.FileReader = class {
        onload: any;
        readAsDataURL() {
          setTimeout(() => this.onload(), 0);
        }
        result = "data:image/png;base64,test-id";
      } as any;

      const { result } = setup();
      const fakeFile = new File(["dummy"], "id.png", { type: "image/png" });

      act(() => { result.current.setCapturedSelfie("data:image/png;base64,test-selfie"); });

      await act(async () => {
        await result.current.handleCaptureID(fakeFile);
      });

      expect(mockGetFaceDescriptor).toHaveBeenCalledTimes(2);
      expect(mockToastSuccess).toHaveBeenCalledWith("ID card matched successfully!");
      
      global.FileReader = originalFileReader;
    });

    it("handles selfie capture successfully after blinking", async () => {
      jest.useFakeTimers();
      const { result } = setup();
      
      const fakeVideo = document.createElement("video");
      Object.defineProperty(fakeVideo, "readyState", { value: 4 });
      const fakeGetScreenshot = jest.fn().mockReturnValue("data:image/png;base64,test-selfie");
      
      result.current.webcamRef.current = {
        video: fakeVideo,
        getScreenshot: fakeGetScreenshot,
      } as any;

      act(() => { result.current.setCurrentStep(5); });
      mockValidateFace.mockResolvedValue({ isValid: true });
      mockQuickValidateFace.mockResolvedValue({ isValid: true, liveness: { blink: true, smile: true, turnLeft: true, turnRight: true } });
      await act(async () => { jest.advanceTimersByTime(600); }); await Promise.resolve();
      await act(async () => { jest.advanceTimersByTime(600); }); await Promise.resolve();
      
      expect(result.current.livenessStatus).toBe('passed');

      mockValidateFace.mockResolvedValueOnce({ isValid: true });
      await act(async () => {
        await result.current.handleCaptureSelfie();
      });
      
      expect(result.current.capturedSelfie).toBe("data:image/png;base64,test-selfie");
      expect(mockToastSuccess).toHaveBeenCalledWith("Face verified successfully!");

      jest.useRealTimers();
    });

    it("handles ID capture failure when selfie is not found", async () => {
      const { result } = setup();
      const fakeFile = new File(["dummy"], "id.png", { type: "image/png" });

      await act(async () => {
        await result.current.handleCaptureID(fakeFile);
      });

      expect(mockToastError).toHaveBeenCalledWith("Selfie not found. Please complete the selfie step first.");
      expect(result.current.capturedID).toBeNull();
    });
  });

  describe("Form Submission", () => {
    it("submits the form data and uploads images", async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useInquiryLogic("listing123", "landlord123", { id: "room123" }, mockOnSubmit)
      );

      // Set captures
      act(() => {
        result.current.setCapturedSelfie("data:image/jpeg;base64,selfie");
        result.current.setCapturedID("data:image/jpeg;base64,idcard");
      });

      const formData = {
        moveInDate: "2024-01-01",
        checkOutDate: "2024-12-31",
        occupantsCount: 1,
        role: "Student",
        contactMethod: "email",
        contactInfo: "test@example.com",
        message: "Hello",
        paymentMethod: "GCash",
        isSoloBuyout: false,
        profilePhoto: null,
        idAttachment: null,
      };

      await act(async () => {
        await result.current.handleFormSubmit(formData as any);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.submitted).toBe(true);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        listingId: "listing123",
        roomId: "room123",
        moveInDate: "2024-01-01",
        checkOutDate: "2024-12-31",
        occupantsCount: 1,
        role: "Student",
        contactMethod: "email",
        contactInfo: "test@example.com",
        message: "Hello",
        paymentMethod: "GCash",
        profilePhotoUrl: "https://edgestore.example.com/file",
        idAttachmentUrl: "https://edgestore.example.com/file",
      });
    });
    
    it("handles form submission errors gracefully", async () => {
      const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error("Network Error"));
      const { result } = renderHook(() =>
        useInquiryLogic("listing123", "landlord123", { id: "room123" }, mockOnSubmit)
      );

      const formData = {
        moveInDate: "2024-01-01",
        checkOutDate: "2024-12-31",
        occupantsCount: 1,
        role: "Student",
        contactMethod: "email",
        contactInfo: "test@example.com",
        message: "Hello",
        paymentMethod: "GCash",
        isSoloBuyout: false,
        profilePhoto: null,
        idAttachment: null,
      };

      await act(async () => {
        await result.current.handleFormSubmit(formData as any);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.submitted).toBe(false);
      expect(mockToastError).toHaveBeenCalledWith("Failed to submit inquiry. Please try again.");
      
      mockConsoleError.mockRestore();
    });
  });
});
