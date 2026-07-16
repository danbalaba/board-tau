import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import IDStep from "../IDStep";

// Mock SafeImage and react-webcam
jest.mock("@/components/common/SafeImage", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />
}));

jest.mock("react-webcam", () => ({
  __esModule: true,
  // Destructure audio to avoid React warning: "Received `false` for a non-boolean attribute `audio`."
  default: React.forwardRef(({ audio, screenshotFormat, videoConstraints, ...props }: any, ref) => (
    <div data-testid="webcam" {...props}>Webcam Mock</div>
  ))
}));

describe("IDStep Component", () => {
  const mockSetCapturedID = jest.fn();
  const mockSetIsIDAligned = jest.fn();
  const mockSetIsPhoneDetected = jest.fn();
  const mockToggleCamera = jest.fn();
  const mockHandleCaptureID = jest.fn();
  const mockWebcamRef = { current: null };

  const defaultProps = {
    capturedID: null,
    setCapturedID: mockSetCapturedID,
    webcamRef: mockWebcamRef,
    facingMode: "environment" as const,
    isIDAligned: false,
    setIsIDAligned: mockSetIsIDAligned,
    isPhoneDetected: false,
    setIsPhoneDetected: mockSetIsPhoneDetected,
    isProcessing: false,
    toggleCamera: mockToggleCamera,
    handleCaptureID: mockHandleCaptureID,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the webcam initially when no ID is captured", () => {
    render(<IDStep {...defaultProps} />);

    expect(screen.getByText("Step 2: Capture Your ID Card")).toBeInTheDocument();
    expect(screen.getByTestId("webcam")).toBeInTheDocument();
    expect(screen.getByText("Scan ID Card")).toBeInTheDocument();
  });

  it("displays 'Physical Presence Required' when a phone screen is detected", () => {
    // Bug Fixed: Phone detection state correctly passed to component
    render(<IDStep {...defaultProps} isPhoneDetected={true} />);

    expect(screen.getByText(/Physical Presence Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Digital screens or photos detected/i)).toBeInTheDocument();
  });

  it("displays 'Ready to Scan' when ID is aligned", () => {
    render(<IDStep {...defaultProps} isIDAligned={true} />);

    expect(screen.getByText(/Ready to Scan/i)).toBeInTheDocument();
    
    const captureBtn = screen.getByText("Scan ID Card");
    expect(captureBtn).not.toBeDisabled();
    
    // Clicking capture triggers handleCaptureID
    fireEvent.click(captureBtn);
    expect(mockHandleCaptureID).toHaveBeenCalledTimes(1);
  });

  it("calls toggleCamera when switch camera button is clicked", () => {
    render(<IDStep {...defaultProps} />);

    const switchBtn = screen.getByTitle("Switch Camera");
    fireEvent.click(switchBtn);

    expect(mockToggleCamera).toHaveBeenCalledTimes(1);
  });

  it("renders the captured ID when capturedID is present", () => {
    render(<IDStep {...defaultProps} capturedID="data:image/jpeg;base64,456" />);

    // Should not render webcam
    expect(screen.queryByTestId("webcam")).not.toBeInTheDocument();
    
    // Should render SafeImage
    const img = screen.getByTestId("safe-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "data:image/jpeg;base64,456");
    expect(screen.getByText("Verified ID Document")).toBeInTheDocument();
  });

  it("allows clearing the captured ID", () => {
    render(<IDStep {...defaultProps} capturedID="data:image/jpeg;base64,456" />);

    // Click the clear button (which is the only button rendered when captured)
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(mockSetCapturedID).toHaveBeenCalledWith(null);
    expect(mockSetIsIDAligned).toHaveBeenCalledWith(false);
    expect(mockSetIsPhoneDetected).toHaveBeenCalledWith(false);
  });

  it("does not apply rotation class when facingMode is user", () => {
    // Tests line 135 branch
    render(<IDStep {...defaultProps} facingMode="user" />);
    const switchBtn = screen.getByTitle("Switch Camera");
    const svg = switchBtn.querySelector("svg");
    expect(svg).not.toHaveClass("rotate-180");
  });

  it("applies processing classes to the capture button when isProcessing is true", () => {
    // Tests line 158 branch
    render(<IDStep {...defaultProps} isProcessing={true} />);
    
    const captureBtn = screen.getByRole("button", { name: /Scan ID Card/i });
    expect(captureBtn).toHaveClass("opacity-0 scale-50");
    expect(captureBtn).toBeDisabled();
  });
});
