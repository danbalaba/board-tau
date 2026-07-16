import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PrepareStep from "../PrepareStep";

// Mock SafeImage so it doesn't complain about missing Next.js router/context
jest.mock("@/components/common/SafeImage", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />
}));

describe("PrepareStep Component", () => {
  const mockSetIsShowingIDList = jest.fn();
  const mockSetSelectedIDTab = jest.fn();
  const mockSetHasReadGuidelines = jest.fn();

  const defaultProps = {
    isShowingIDList: false,
    setIsShowingIDList: mockSetIsShowingIDList,
    selectedIDTab: "primary" as const,
    setSelectedIDTab: mockSetSelectedIDTab,
    hasReadGuidelines: false,
    setHasReadGuidelines: mockSetHasReadGuidelines,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the guidelines view initially", () => {
    render(<PrepareStep {...defaultProps} />);

    expect(screen.getByText("Identity Verification")).toBeInTheDocument();
    expect(screen.getByText(/Please prepare a valid ID and make sure your camera is turned on/i)).toBeInTheDocument();
    expect(screen.getByText("I UNDERSTAND & I'M READY")).toBeInTheDocument();
  });

  it("clicks the link to show accepted IDs list", () => {
    render(<PrepareStep {...defaultProps} />);

    const linkButton = screen.getByText(/List of accepted IDs/i);
    fireEvent.click(linkButton);

    expect(mockSetIsShowingIDList).toHaveBeenCalledWith(true);
  });

  it("clicks the 'I UNDERSTAND & I'M READY' button", () => {
    render(<PrepareStep {...defaultProps} />);

    const readyButton = screen.getByText("I UNDERSTAND & I'M READY");
    fireEvent.click(readyButton);

    expect(mockSetHasReadGuidelines).toHaveBeenCalledWith(true); // Toggle value
  });

  it("shows different button text if hasReadGuidelines is true", () => {
    render(<PrepareStep {...defaultProps} hasReadGuidelines={true} />);

    expect(screen.getByText("I AM READY TO PROCEED")).toBeInTheDocument();
  });

  describe("ID List View", () => {
    it("renders the ID list when isShowingIDList is true", () => {
      render(<PrepareStep {...defaultProps} isShowingIDList={true} />);

      expect(screen.getByText("List of valid IDs")).toBeInTheDocument();
      expect(screen.getByText("Primary IDs")).toBeInTheDocument();
      expect(screen.getByText("Secondary IDs")).toBeInTheDocument();
    });

    it("displays Primary IDs by default", () => {
      render(<PrepareStep {...defaultProps} isShowingIDList={true} selectedIDTab="primary" />);

      expect(screen.getByText("Driver's License")).toBeInTheDocument();
      expect(screen.getByText("Passport")).toBeInTheDocument();
      expect(screen.queryByText("Student ID (COR)")).not.toBeInTheDocument();
    });

    it("displays Secondary IDs when tab is selected", () => {
      render(<PrepareStep {...defaultProps} isShowingIDList={true} selectedIDTab="secondary" />);

      expect(screen.getByText("Student ID (COR)")).toBeInTheDocument();
      expect(screen.queryByText("Driver's License")).not.toBeInTheDocument();
    });

    it("calls setSelectedIDTab when tab is clicked", () => {
      render(<PrepareStep {...defaultProps} isShowingIDList={true} />);

      const secondaryTab = screen.getByText("Secondary IDs");
      fireEvent.click(secondaryTab);

      expect(mockSetSelectedIDTab).toHaveBeenCalledWith("secondary");
    });

    it("calls setIsShowingIDList and setHasReadGuidelines when 'Understood' button is clicked", () => {
      render(<PrepareStep {...defaultProps} isShowingIDList={true} />);

      const understoodButton = screen.getByText(/Understood, let's continue/i);
      fireEvent.click(understoodButton);

      expect(mockSetIsShowingIDList).toHaveBeenCalledWith(false);
      expect(mockSetHasReadGuidelines).toHaveBeenCalledWith(true);
    });

    it("closes the ID list when back or close buttons are clicked", () => {
      const { container } = render(<PrepareStep {...defaultProps} isShowingIDList={true} />);
      const buttons = container.querySelectorAll("button");
      
      // buttons[0] is the ChevronLeft (Back) button
      fireEvent.click(buttons[0]);
      expect(mockSetIsShowingIDList).toHaveBeenCalledWith(false);
      
      // buttons[1] is the FaTimes (Close) button
      fireEvent.click(buttons[1]);
      expect(mockSetIsShowingIDList).toHaveBeenCalledWith(false);
    });

    it("calls setSelectedIDTab when primary tab is clicked", () => {
      render(<PrepareStep {...defaultProps} isShowingIDList={true} selectedIDTab="secondary" />);

      const primaryTab = screen.getByText("Primary IDs");
      fireEvent.click(primaryTab);

      expect(mockSetSelectedIDTab).toHaveBeenCalledWith("primary");
    });
  });
});
