import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewStep from "../ReviewStep";
import { format } from "date-fns";

// Mock SafeImage
jest.mock("@/components/common/SafeImage", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />
}));

describe("ReviewStep Component", () => {
  const mockRoom = {
    reservationFee: 1000,
    capacity: 4,
  };

  // watchedValues structure: 
  // [0: paymentMethod, 1: moveInDate, 2: checkOutDate, 3: role, 4: contactMethod, 5: contactInfo, 6: message, 7: occupantsCount, 8: isSoloBuyout]
  const defaultWatchedValues = [
    "GCash", // paymentMethod
    "2023-12-25", // moveInDate
    "", "", "", "", "", 
    1, // occupantsCount
    false // isSoloBuyout
  ];

  const defaultProps = {
    watchedValues: defaultWatchedValues,
    capturedSelfie: null,
    capturedID: null,
    room: mockRoom,
  };

  it("renders summary details correctly", () => {
    render(<ReviewStep {...defaultProps} />);

    expect(screen.getByText("Final Summary & Review")).toBeInTheDocument();
    
    // Check In Date
    expect(screen.getByText(format(new Date("2023-12-25"), 'MMM dd, yyyy'))).toBeInTheDocument();
    
    // Payment Method
    expect(screen.getByText("GCash")).toBeInTheDocument();
    
    // Reservation Fee calculation (1000 * 1 = 1000)
    // It appears twice: once in the total, once in the calculation breakdown
    expect(screen.getAllByText(/₱ 1,000/)).toHaveLength(2);
    expect(screen.getByText(/1 occupants/)).toBeInTheDocument();
  });

  it("calculates Solo Buyout fee correctly", () => {
    const soloBuyoutValues = [...defaultWatchedValues];
    soloBuyoutValues[8] = true; // isSoloBuyout

    render(<ReviewStep {...defaultProps} watchedValues={soloBuyoutValues} />);

    // Reservation Fee calculation (1000 * 4 = 4000)
    // 4000 is the total. The breakdown says "Calculated as ₱ 1,000 x 4"
    expect(screen.getByText(/₱ 4,000/)).toBeInTheDocument();
    expect(screen.getByText(/₱ 1,000/)).toBeInTheDocument(); // Base fee
    expect(screen.getByText(/Full Room Buyout/)).toBeInTheDocument();
  });

  it("renders captured images and opens preview portal", async () => {
    render(
      <ReviewStep 
        {...defaultProps} 
        capturedSelfie="data:image/jpeg;base64,selfie" 
        capturedID="data:image/jpeg;base64,idcard" 
      />
    );

    const images = screen.getAllByTestId("safe-image");
    expect(images).toHaveLength(2); // One for selfie, one for ID

    // Click to open portal preview
    fireEvent.click(images[0].parentElement!);

    // Should render a third image in the portal preview
    expect(screen.getAllByTestId("safe-image")).toHaveLength(3);
    expect(screen.getByText("Verification Quality Check")).toBeInTheDocument();

    // Click the close button
    const closeBtn = screen.getAllByRole("button")[0];
    fireEvent.click(closeBtn);

    // Portal closes, back to 2 images (use waitFor because framer-motion AnimatePresence keeps it in DOM while animating exit)
    await waitFor(() => {
      expect(screen.getAllByTestId("safe-image")).toHaveLength(2);
      expect(screen.queryByText("Verification Quality Check")).not.toBeInTheDocument();
    });
  });

  it("opens preview when ID is clicked and closes when backdrop is clicked", async () => {
    render(
      <ReviewStep 
        {...defaultProps} 
        capturedSelfie="data:image/jpeg;base64,selfie" 
        capturedID="data:image/jpeg;base64,idcard" 
      />
    );

    const images = screen.getAllByTestId("safe-image");
    
    // Click the ID preview (second image)
    fireEvent.click(images[1].parentElement!);

    // Portal opens, 3 images rendered
    expect(screen.getAllByTestId("safe-image")).toHaveLength(3);
    
    // Click the backdrop to close. We must click the outer container, not the inner image container which has stopPropagation()
    const backdrop = screen.getByText("Click anywhere to close preview").parentElement!;
    fireEvent.click(backdrop);

    // Should close
    await waitFor(() => {
      expect(screen.getAllByTestId("safe-image")).toHaveLength(2);
    });
  });
});
