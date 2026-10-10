import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SelfieStep from "../SelfieStep";

// Mock SafeImage and react-webcam
jest.mock("@/components/common/SafeImage", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />
}));

jest.mock("react-webcam", () => ({
  __esModule: true,
  default: React.forwardRef(({ audio, screenshotFormat, videoConstraints, mirrored, onUserMedia, onUserMediaError, ...props }: any, ref) => {
    React.useEffect(() => {
      if (onUserMedia) onUserMedia();
    }, [onUserMedia]);
    return <div data-testid="webcam" {...props}>Webcam Mock</div>;
  })
}));

describe("SelfieStep Component", () => {
  const mockSetCapturedSelfie = jest.fn();
  const mockSetIsFaceAligned = jest.fn();
  const mockToggleCamera = jest.fn();
  const mockHandleCaptureSelfie = jest.fn();
  const mockWebcamRef = { current: null };

  const defaultProps = {
    capturedSelfie: null,
    setCapturedSelfie: mockSetCapturedSelfie,
    webcamRef: mockWebcamRef,
    facingMode: "user" as const,
    isFaceAligned: false,
    livenessStatus: 'idle' as const,
    activeChallenge: 'blink' as const,
    setIsFaceAligned: mockSetIsFaceAligned,
    isProcessing: false,
    isEngineReady: true,
    isFlashActive: false,
    toggleCamera: mockToggleCamera,
    handleCaptureSelfie: mockHandleCaptureSelfie,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the webcam initially when no selfie is captured", () => {
    render(<SelfieStep {...defaultProps} />);

    expect(screen.getByText("Step 5: Live Biometric Selfie Check")).toBeInTheDocument();
    expect(screen.getByTestId("webcam")).toBeInTheDocument();
    expect(screen.getByText("Position face within frame")).toBeInTheDocument();
  });

  it("renders camera controls and capture button", () => {
    render(<SelfieStep {...defaultProps} isFaceAligned={true} livenessStatus="idle" />);

    expect(screen.getByText("Position face within frame")).toBeInTheDocument();
    
    const captureBtn = screen.getByRole("button", { name: /Capture Selfie Now/i });
    expect(captureBtn).toBeInTheDocument();
  });

  it("triggers handleCaptureSelfie when capture button is clicked", () => {
    jest.useFakeTimers();
    render(<SelfieStep {...defaultProps} isFaceAligned={true} livenessStatus="passed" />);

    React.act(() => {
      jest.advanceTimersByTime(500);
    });

    const captureBtn = screen.getByRole("button", { name: /Capture Selfie Now/i });
    expect(captureBtn).not.toBeDisabled();
    
    fireEvent.click(captureBtn);
    expect(mockHandleCaptureSelfie).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it("calls toggleCamera when switch camera button is clicked", () => {
    render(<SelfieStep {...defaultProps} />);

    const switchBtn = screen.getByTitle("Switch Camera");
    fireEvent.click(switchBtn);

    expect(mockToggleCamera).toHaveBeenCalledTimes(1);
  });

  it("renders the captured selfie when capturedSelfie is present", () => {
    render(<SelfieStep {...defaultProps} capturedSelfie="data:image/jpeg;base64,123" />);

    // Should not render webcam
    expect(screen.queryByTestId("webcam")).not.toBeInTheDocument();
    
    // Should render SafeImage
    const img = screen.getByAltText("Captured Selfie");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "data:image/jpeg;base64,123");
    expect(screen.getByText("Selfie Photo Captured")).toBeInTheDocument();
  });

  it("allows clearing the captured selfie", () => {
    render(<SelfieStep {...defaultProps} capturedSelfie="data:image/jpeg;base64,123" />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(mockSetCapturedSelfie).toHaveBeenCalledWith(null);
    expect(mockSetIsFaceAligned).toHaveBeenCalledWith(false);
  });

  it("applies rotation class when facingMode is environment", () => {
    render(<SelfieStep {...defaultProps} facingMode="environment" />);
    const switchBtn = screen.getByTitle("Switch Camera");
    const svg = switchBtn.querySelector("svg");
    expect(svg).toHaveClass("rotate-180");
  });

  it("applies processing classes to the capture button when isProcessing is true", () => {
    render(<SelfieStep {...defaultProps} isProcessing={true} />);
    
    const captureBtn = screen.getByRole("button", { name: /Capture Selfie Now/i });
    expect(captureBtn).toHaveClass("opacity-0 scale-50");
    expect(captureBtn).toBeDisabled();
  });
});
