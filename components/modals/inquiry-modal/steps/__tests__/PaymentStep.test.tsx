import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import PaymentStep from "../PaymentStep";

describe("PaymentStep", () => {
  const mockRegister = jest.fn();
  const mockGetValues = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetValues.mockReturnValue("");
  });

  const setup = (errors: any = {}) => {
    return render(
      <PaymentStep
        register={mockRegister as any}
        errors={errors}
        getValues={mockGetValues as any}
      />
    );
  };

  it("renders all payment options", () => {
    setup();

    // Check titles
    expect(screen.getByText("Credit/Debit Card (Stripe)")).toBeInTheDocument();
    // Fixed the intentional error for the final green screenshot!
    expect(screen.getByText("GCash")).toBeInTheDocument();
    expect(screen.getByText("Maya")).toBeInTheDocument();

    // Check radio buttons are passed to register
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);
    expect(mockRegister).toHaveBeenCalledWith("paymentMethod", expect.any(Object));
  });

  it("applies active styles to the selected payment method", () => {
    mockGetValues.mockReturnValue("gcash");
    setup();

    // Since our styling relies on classNames matching a condition, we can test that the GCash label
    // gets the active classes ('bg-primary/5')
    const gcashLabel = screen.getByText("GCash").closest("label");
    expect(gcashLabel).toHaveClass("bg-primary/5");

    const stripeLabel = screen.getByText("Credit/Debit Card (Stripe)").closest("label");
    expect(stripeLabel).not.toHaveClass("bg-primary/5");
  });

  it("displays error message when there is a validation error", () => {
    const errors = {
      paymentMethod: { message: "Payment method is required" },
    };
    setup(errors);

    expect(screen.getByText("Payment method is required")).toBeInTheDocument();
  });
});
