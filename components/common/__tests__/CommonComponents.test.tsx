import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";
import SafeImage from "../SafeImage";
import BackButton from "../BackButton";
import Heading from "../Heading";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock next-themes for SafeImage
jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

// Mock next/image to just render a standard img for testing
jest.mock("next/image", () => {
  return function DummyImage({ unoptimized, priority, fill, sizes, ...props }: any) {
    return <img {...props} />;
  };
});

describe("Common Components", () => {
  describe("Button Component", () => {
    it("renders children correctly", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText("Click Me")).toBeInTheDocument();
    });

    it("displays loading spinner when isLoading is true", () => {
      render(<Button isLoading>Click Me</Button>);
      // The text should not be visible
      expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
      // It should be disabled
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("handles click events", () => {
      const mockOnClick = jest.fn();
      render(<Button onClick={mockOnClick}>Click Me</Button>);
      fireEvent.click(screen.getByText("Click Me"));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("applies variant classes", () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-red-500");
    });
  });

  describe("SafeImage Component", () => {
    it("renders image with correct src", () => {
      render(<SafeImage src="/test.jpg" alt="Test Image" />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/test.jpg");
      expect(img).toHaveAttribute("alt", "Test Image");
    });

    it("triggers onError and switches to fallback src", () => {
      render(<SafeImage src="/broken.jpg" alt="Broken" />);
      const img = screen.getByRole("img");
      
      // Simulate image load error
      fireEvent.error(img);
      
      // Since we mocked next-themes as "light", the resolved fallback is white_placeholder.png
      expect(img).toHaveAttribute("src", "/images/white_placeholder.png");
    });

    it("triggers onLoad correctly", () => {
      render(<SafeImage src="/good.jpg" alt="Good" />);
      const img = screen.getByRole("img");
      
      fireEvent.load(img);
      // Ensure it doesn't crash and removes the opacity-0 class 
      expect(img.className).toContain("opacity-100");
    });
  });

  describe("BackButton Component", () => {
    it("calls router.back when clicked", () => {
      const mockBack = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
      render(<BackButton />);
      
      const btn = screen.getByRole("button", { name: /Back/i });
      fireEvent.click(btn);
      
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Heading Component", () => {
    it("renders title, subtitle, and centers properly", () => {
      const { container } = render(<Heading title="My Title" subtitle="My Subtitle" center={true} />);
      
      expect(screen.getByText("My Title")).toBeInTheDocument();
      expect(screen.getByText("My Subtitle")).toBeInTheDocument();
      
      // Checks for text-center class on the wrapper div
      expect(container.querySelector(".text-center")).toBeInTheDocument();
    });

    it("renders back button conditionally", () => {
      render(<Heading title="No Back Btn" />);
      expect(screen.queryByRole("button", { name: /Back/i })).not.toBeInTheDocument();

      render(<Heading title="With Back Btn" backBtn={true} />);
      expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    });
  });
});
