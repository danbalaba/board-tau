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
  default: React.forwardRef(({ audio, screenshotFormat, videoConstraints, ...props }: any, ref) => (
    <div data-testid="webcam" {...props}>Webcam Mock</div>
  ))
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
    hasUserBlinked: false,
    setIsFaceAligned: mockSetIsFaceAligned,
    isProcessing: false,
    isFlashActive: false,
    toggleCamera: mockToggleCamera,
    handleCaptureSelfie: mockHandleCaptureSelfie,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the webcam initially when no selfie is captured", () => {
    render(<SelfieStep {...defaultProps} />);

    expect(screen.getByText("Step 1: Capture Your Selfie")).toBeInTheDocument();
    expect(screen.getByTestId("webcam")).toBeInTheDocument();
    expect(screen.getByText("Capture Selfie")).toBeInTheDocument();
  });

  it("displays 'Please Blink to Continue' when face is aligned but not blinked", () => {
    render(<SelfieStep {...defaultProps} isFaceAligned={true} hasUserBlinked={false} />);

    expect(screen.getByText(/Please Blink to Continue/i)).toBeInTheDocument();
    
    // Capture button should show 'Blink to Unlock' and be disabled
    const captureBtn = screen.getByText("Blink to Unlock");
    expect(captureBtn).toBeInTheDocument();
    expect(captureBtn).toBeDisabled();
  });

  it("displays 'Liveness Confirmed' when face is aligned and blinked", () => {
    render(<SelfieStep {...defaultProps} isFaceAligned={true} hasUserBlinked={true} />);

    expect(screen.getByText(/Liveness Confirmed/i)).toBeInTheDocument();
    
    // Capture button should be enabled
    const captureBtn = screen.getByText("Capture Selfie");
    expect(captureBtn).not.toBeDisabled();
    
    // Clicking capture triggers handleCaptureSelfie
    fireEvent.click(captureBtn);
    expect(mockHandleCaptureSelfie).toHaveBeenCalledTimes(1);
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
    const img = screen.getByTestId("safe-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "data:image/jpeg;base64,123");
    expect(screen.getByText("Verified Biometric")).toBeInTheDocument();
  });

  it("allows clearing the captured selfie", () => {
    render(<SelfieStep {...defaultProps} capturedSelfie="data:image/jpeg;base64,123" />);

    // There should be a close/remove button
    // The button has a FaTimes icon, we can find it via the parent button (it's the only button in the captured state view)
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(mockSetCapturedSelfie).toHaveBeenCalledWith(null);
    expect(mockSetIsFaceAligned).toHaveBeenCalledWith(false);
  });

  it("applies rotation class when facingMode is environment", () => {
    // Tests line 131 branch
    const { container } = render(<SelfieStep {...defaultProps} facingMode="environment" />);
    // The lucide-react icon is rendered as an SVG. We can just check if the class is present on the inner element of the button.
    const switchBtn = screen.getByTitle("Switch Camera");
    const svg = switchBtn.querySelector("svg");
    expect(svg).toHaveClass("rotate-180");
  });

  it("applies processing classes to the capture button when isProcessing is true", () => {
    // Tests line 166 branch
    render(<SelfieStep {...defaultProps} isProcessing={true} />);
    
    const captureBtn = screen.getByRole("button", { name: /Capture Selfie/i });
    expect(captureBtn).toHaveClass("opacity-0 scale-50");
    expect(captureBtn).toBeDisabled();
  });
});
