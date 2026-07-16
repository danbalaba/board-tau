import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ModernInquirySelect } from "../ModernInquirySelect";

describe("ModernInquirySelect", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ];

  it("renders with placeholder and label", () => {
    render(<ModernInquirySelect options={options} value="" onChange={jest.fn()} placeholder="Select an option" label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("renders selected option", () => {
    render(<ModernInquirySelect options={options} value="option1" onChange={jest.fn()} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("opens and closes dropdown on click", async () => {
    render(<ModernInquirySelect options={options} value="" onChange={jest.fn()} />);
    
    // Dropdown options should not be visible initially
    expect(screen.queryByText("Option 1")).not.toBeInTheDocument();

    // Click button to open
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();

    // Click again to close
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });
  });

  it("calls onChange and closes when an option is selected", async () => {
    const mockOnChange = jest.fn();
    render(<ModernInquirySelect options={options} value="" onChange={mockOnChange} />);
    
    // Open dropdown
    fireEvent.click(screen.getByRole("button"));
    
    // Click option
    fireEvent.click(screen.getByText("Option 2"));
    
    expect(mockOnChange).toHaveBeenCalledWith("option2");
    
    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });
  });

  it("displays error message when error prop is provided", () => {
    render(<ModernInquirySelect options={options} value="" onChange={jest.fn()} error="This is an error" />);
    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    render(<ModernInquirySelect options={options} value="" onChange={jest.fn()} />);
    
    // Open dropdown
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Option 1")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });
  });
});
