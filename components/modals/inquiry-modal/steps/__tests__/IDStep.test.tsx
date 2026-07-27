import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IDStep from "../IDStep";
import userEvent from "@testing-library/user-event";

// Mock SafeImage
jest.mock("@/components/common/SafeImage", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />
}));

const mockToastError = jest.fn();
jest.mock("@/components/common/ResponsiveToast", () => ({
  useResponsiveToast: () => ({
    error: mockToastError,
    success: jest.fn(),
  })
}));

// Mock framer-motion so AnimatePresence/motion.div renders children immediately (no exit animations in JSDOM)
jest.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_: any, tag: string) => {
      return ({ children, ...props }: any) => {
        const React = require("react");
        const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
        return React.createElement(tag, rest, children);
      };
    },
  }),
  AnimatePresence: ({ children }: any) => children,
}));

describe("IDStep Component", () => {
  const mockSetCapturedID = jest.fn();
  const mockHandleCaptureID = jest.fn();

  const defaultProps = {
    capturedID: null,
    setCapturedID: mockSetCapturedID,
    isProcessing: false,
    handleCaptureID: mockHandleCaptureID,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockToastError.mockClear();
    global.URL.createObjectURL = jest.fn(() => "blob:fake-url");
    global.URL.revokeObjectURL = jest.fn();
    window.alert = jest.fn();
  });

  it("renders the upload UI initially", () => {
    render(<IDStep {...defaultProps} />);

    expect(screen.getByText("Step 2: Upload Your ID Card")).toBeInTheDocument();
    expect(screen.getByText("Take Photo")).toBeInTheDocument();
    expect(screen.getByText("Gallery")).toBeInTheDocument();
  });

  it("shows preview when file is selected", async () => {
    render(<IDStep {...defaultProps} />);
    
    const file = new File(["dummy content"], "id.png", { type: "image/png" });
    const inputs = document.querySelectorAll('input[type="file"]');
    const uploadInput = inputs[1] as HTMLInputElement;

    await userEvent.upload(uploadInput, file);

    await waitFor(() => {
      expect(screen.getByAltText("ID Preview")).toBeInTheDocument();
      expect(screen.getByText("Use This Photo")).toBeInTheDocument();
      expect(screen.getByText(/Retake/i)).toBeInTheDocument();
    });
  });

  it("calls handleCaptureID on confirm", async () => {
    render(<IDStep {...defaultProps} />);
    
    const file = new File(["dummy content"], "id.png", { type: "image/png" });
    const inputs = document.querySelectorAll('input[type="file"]');
    const uploadInput = inputs[1] as HTMLInputElement;

    await userEvent.upload(uploadInput, file);

    await waitFor(() => {
      expect(screen.getByText("Use This Photo")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Use This Photo"));

    expect(mockHandleCaptureID).toHaveBeenCalledWith(file);
  });

  it("clears preview on retake", async () => {
    render(<IDStep {...defaultProps} />);
    
    const file = new File(["dummy content"], "id.png", { type: "image/png" });
    const inputs = document.querySelectorAll('input[type="file"]');
    const uploadInput = inputs[1] as HTMLInputElement;

    await userEvent.upload(uploadInput, file);

    await waitFor(() => {
      expect(screen.getByText(/Retake/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Retake/i));

    await waitFor(() => {
      expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
      expect(screen.getByText("Take Photo")).toBeInTheDocument();
    });
  });

  it("alerts on file too large", async () => {
    render(<IDStep {...defaultProps} />);
    
    const largeFile = new File(["dummy content"], "large.png", { type: "image/png" });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 }); // 11 MB
    
    const inputs = document.querySelectorAll('input[type="file"]');
    const uploadInput = inputs[1] as HTMLInputElement;

    await userEvent.upload(uploadInput, largeFile);

    expect(mockToastError).toHaveBeenCalledWith("File size is too large. Please upload an image under 5MB.");
  });

  it("renders the captured ID when capturedID is present", () => {
    render(<IDStep {...defaultProps} capturedID="data:image/jpeg;base64,456" />);

    const img = screen.getByAltText("Captured ID");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "data:image/jpeg;base64,456");
    expect(screen.getByText("Verified ID Document")).toBeInTheDocument();
  });

  it("allows clearing the captured ID", () => {
    render(<IDStep {...defaultProps} capturedID="data:image/jpeg;base64,456" />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // The close button

    expect(mockSetCapturedID).toHaveBeenCalledWith(null);
  });
  
  it("shows processing state", async () => {
    render(<IDStep {...defaultProps} isProcessing={true} />);
    
    // Select a file first to see the confirm button
    const file = new File(["dummy content"], "id.png", { type: "image/png" });
    const inputs = document.querySelectorAll('input[type="file"]');
    const uploadInput = inputs[1] as HTMLInputElement;

    await userEvent.upload(uploadInput, file);

    await waitFor(() => {
      expect(screen.getByText(/Verifying\.\.\./i)).toBeInTheDocument();
    });
    
    expect(screen.getByRole("button", { name: /Verifying\.\.\./i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Retake/i })).toBeDisabled();
  });
});
