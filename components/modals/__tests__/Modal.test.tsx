import React, { useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "../Modal";
import { useIsClient } from "@/hooks/useIsClient";

// Mock framer-motion to avoid animation delays in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useIsClient to always return true during testing
jest.mock("@/hooks/useIsClient", () => ({
  useIsClient: jest.fn(() => true),
}));

describe("Modal Component (Standalone)", () => {
  it("renders when isOpen is true", () => {
    render(
      <Modal isOpen={true} title="Standalone Modal">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText("Standalone Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} title="Standalone Modal">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.queryByText("Standalone Modal")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} title="Test Modal" onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );
    
    const closeBtn = screen.getByLabelText("Close");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("adds overflow-hidden to body when open", () => {
    // Mock scroll values
    window.pageYOffset = 100;
    window.scrollTo = jest.fn();
    
    const { unmount, rerender } = render(
      <Modal isOpen={true} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
    
    // Close modal via prop change
    rerender(
      <Modal isOpen={false} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 100);

    unmount();
  });

  it("closes standalone modal when clicking outside", () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} title="Standalone Modal" onClose={handleClose} closeOnOutsideClick={true}>
        <div>Modal Content</div>
      </Modal>
    );

    // The wrapper div is the backdrop. Since we mocked framer-motion, it's just a standard div.
    // However, finding the specific backdrop div can be tricky.
    // It's the first child of the portal (which is in document.body).
    // Let's click on an element that would represent the outside.
    // In our mock, it's the fixed inset-0 div.
    const backdrop = document.querySelector(".fixed.inset-0");
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when useIsClient is false (SSR)", () => {
    (useIsClient as jest.Mock).mockReturnValueOnce(false);
    render(
      <Modal isOpen={true} title="SSR Modal">
        <div>Content</div>
      </Modal>
    );
    expect(screen.queryByText("SSR Modal")).not.toBeInTheDocument();
  });
});

describe("Modal Context API (Trigger & Window)", () => {
  const TestComponent = () => {
    return (
      <Modal>
        <Modal.Trigger name="test-modal">
          <button>Open Modal</button>
        </Modal.Trigger>
        <Modal.Window name="test-modal">
          <div>
            <Modal.WindowHeader title="Context Modal" />
            <div>Context Content</div>
          </div>
        </Modal.Window>
      </Modal>
    );
  };

  it("opens modal on trigger click", () => {
    render(<TestComponent />);
    
    // Initially closed
    expect(screen.queryByText("Context Modal")).not.toBeInTheDocument();
    
    // Click trigger
    fireEvent.click(screen.getByText("Open Modal"));
    
    // Now open
    expect(screen.getByText("Context Modal")).toBeInTheDocument();
    expect(screen.getByText("Context Content")).toBeInTheDocument();
  });

  it("closes modal on header close button click", () => {
    render(<TestComponent />);
    
    fireEvent.click(screen.getByText("Open Modal"));
    expect(screen.getByText("Context Modal")).toBeInTheDocument();
    
    const closeBtn = screen.getByLabelText("Close");
    fireEvent.click(closeBtn);
    
    expect(screen.queryByText("Context Modal")).not.toBeInTheDocument();
  });

  it("closes modal on escape key", () => {
    render(<TestComponent />);
    
    fireEvent.click(screen.getByText("Open Modal"));
    expect(screen.getByText("Context Modal")).toBeInTheDocument();
    
    fireEvent.keyDown(window, { key: "Escape" });
    
    expect(screen.queryByText("Context Modal")).not.toBeInTheDocument();
  });

  it("calls custom onClick in Trigger", () => {
    const customOnClick = jest.fn();
    render(
      <Modal>
        <Modal.Trigger name="test" onClick={customOnClick}>
          <button>Custom Click</button>
        </Modal.Trigger>
      </Modal>
    );

    fireEvent.click(screen.getByText("Custom Click"));
    expect(customOnClick).toHaveBeenCalledTimes(1);
  });

  it("does not render Window when useIsClient is false", () => {
    (useIsClient as jest.Mock).mockReturnValueOnce(false);
    render(
      <Modal>
        <Modal.Window name="test">
          <div>Content</div>
        </Modal.Window>
      </Modal>
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });
});
