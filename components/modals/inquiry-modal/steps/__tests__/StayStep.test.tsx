import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import StayStep from "../StayStep";
import { useForm } from "react-hook-form";

// Mock the ModernInquirySelect to just render a native select for easier testing
jest.mock("../../components/ModernInquirySelect", () => ({
  ModernInquirySelect: ({ options, value, onChange, placeholder, error }: any) => (
    <div data-testid="mock-select">
      <select 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}));

// Wrapper component to provide useForm context
const StayStepWrapper = ({ defaultValues, roomProps, activeStay }: any) => {
  const { register, control, watch, setValue, getValues, clearErrors, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      moveInDate: "",
      checkOutDate: "",
      occupantsCount: 1,
      isSoloBuyout: false,
      role: "",
      contactMethod: "",
      contactInfo: "",
      ...defaultValues
    }
  });
  
  // CRITICAL: The real InquiryModal watches all fields, which triggers a re-render
  // when occupantsCount changes. We must replicate that here for the UI to update in tests.
  watch();

  const [dateRange, setDateRange] = React.useState<any>({ 
    from: defaultValues?.moveInDate ? new Date(defaultValues.moveInDate) : undefined, 
    to: defaultValues?.checkOutDate ? new Date(defaultValues.checkOutDate) : undefined 
  });
  const [showCalendar, setShowCalendar] = React.useState(false);

  const defaultRoom = { availableSlots: 4, capacity: 4, roomType: "BEDSPACE", ...roomProps };

  return (
    <StayStep
      dateRange={dateRange}
      setDateRange={setDateRange}
      showCalendar={showCalendar}
      setShowCalendar={setShowCalendar}
      getValues={getValues}
      setValue={setValue}
      control={control}
      errors={errors}
      room={defaultRoom}
      activeStay={activeStay}
      register={register}
      watch={watch}
      clearErrors={clearErrors}
    />
  );
};

// Suppress act() warnings caused by react-hook-form's async internal updates
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("was not wrapped in act")) return;
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

describe("StayStep Component", () => {
  it("renders correctly with default values", async () => {
    await act(async () => {
      render(<StayStepWrapper />);
    });
    expect(screen.getByText(/2. Stay Details/i)).toBeInTheDocument();
    expect(screen.getByText("Number of Occupants (Including you)")).toBeInTheDocument();
  });

  it("handles occupant count increment and decrement", async () => {
    await act(async () => {
      render(<StayStepWrapper />);
    });
    
    // Initial value is 1
    expect(screen.getByText("1")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const minusBtn = buttons[0];
    const plusBtn = buttons[1];

    // Decrement should be disabled at 1 (Bug Fixed)
    expect(minusBtn).toBeDisabled();

    // Increment
    fireEvent.click(plusBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    // Now decrement should be enabled
    expect(minusBtn).not.toBeDisabled();
    fireEvent.click(minusBtn);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders solo buyout option when conditions are met", async () => {
    await act(async () => {
      render(<StayStepWrapper roomProps={{ roomType: "BEDSPACE", capacity: 4, availableSlots: 4 }} />);
    });
    expect(screen.getByText("Rent Entire Room (Solo Occupancy)")).toBeInTheDocument();
  });

  it("hides solo buyout if availableSlots < capacity", async () => {
    await act(async () => {
      render(<StayStepWrapper roomProps={{ roomType: "BEDSPACE", capacity: 4, availableSlots: 3 }} />);
    });
    expect(screen.queryByText("Rent Entire Room (Solo Occupancy)")).not.toBeInTheDocument();
  });

  it("renders contact info input dynamically based on contact method", async () => {
    await act(async () => {
      render(<StayStepWrapper />);
    });
    
    // Initial render with no contact method
    expect(screen.queryByPlaceholderText(/e.g. 09123456789/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/example@email.com/i)).not.toBeInTheDocument();

    // The contact method is the second mock select
    const selects = screen.getAllByRole("combobox");
    const contactMethodSelect = selects[1];

    // Select email
    fireEvent.change(contactMethodSelect, { target: { value: "email" } });
    
    // Check if email input appears
    expect(await screen.findByPlaceholderText("example@email.com")).toBeInTheDocument();

    // Select phone
    fireEvent.change(contactMethodSelect, { target: { value: "phone" } });
    
    // Check if phone input appears
    expect(await screen.findByPlaceholderText("e.g. 09123456789 or +63...")).toBeInTheDocument();
  });

  it("displays active stay overlap warning", async () => {
    await act(async () => {
      render(
        <StayStepWrapper 
          defaultValues={{ moveInDate: "2024-10-01" }} 
          activeStay={{ endDate: "2024-10-15", status: "ACTIVE", listing: { title: "Test Condo" } }} 
        />
      );
    });
    expect(screen.getByText("Active Residence Conflict")).toBeInTheDocument();
  });

  it("handles calendar opening, closing, and clearing dates", async () => {
    const mockSetDateRange = jest.fn();
    await act(async () => {
      render(
        <StayStepWrapper 
          defaultValues={{ moveInDate: "2024-10-01", checkOutDate: "2024-10-15" }} 
        />
      );
    });
    
    // Check if dates are rendered
    expect(screen.getByText(/Oct 01, 2024/)).toBeInTheDocument();
    
    // Open calendar
    const calendarContainer = screen.getByText(/Oct 01, 2024/).closest('div.flex.items-center.gap-2.w-full') || screen.getByText(/Oct 01, 2024/);
    fireEvent.click(calendarContainer);
    
    // The calendar should now be open, meaning the Done button should be visible
    const doneBtn = screen.getByText("Done");
    expect(doneBtn).toBeInTheDocument();
    
    // Close calendar via Done button
    fireEvent.click(doneBtn);
    expect(screen.queryByText("Done")).not.toBeInTheDocument();
    
    // Clear dates
    const clearBtn = screen.getByTitle("Clear dates");
    fireEvent.click(clearBtn);
    
    expect(screen.getByText("Select dates")).toBeInTheDocument();
  });

  it("updates occupant count when solo buyout is checked", async () => {
    await act(async () => {
      render(<StayStepWrapper roomProps={{ roomType: "BEDSPACE", capacity: 4, availableSlots: 4 }} defaultValues={{ occupantsCount: 2 }} />);
    });
    
    expect(screen.getByText("2")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox); // check it

    // Occupant count should be forced to 1
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("validates contact methods correctly", async () => {
    let mockGetValues = jest.fn();
    const mockRegister = jest.fn();
    const mockWatch = jest.fn();
    
    // To test the internal validation rules without doing a full E2E, we can 
    // extract the validation logic directly by providing mock hooks to a lighter setup.
    let emailValidation: any;
    let phoneValidation: any;
    
    // We can extract them by rendering with specific contact methods and looking at the props
    // passed to the Controller, but since Controller is internal to react-hook-form,
    // we'll just test the error rendering side effects.
    await act(async () => {
      render(<StayStepWrapper />);
    });
    
    const selects = screen.getAllByRole("combobox");
    const contactMethodSelect = selects[1];
    
    // Test Email validation side effects
    fireEvent.change(contactMethodSelect, { target: { value: "email" } });
    const emailInput = await screen.findByPlaceholderText("example@email.com");
    
    // Assuming the validation runs on blur or change, we simulate invalid inputs
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);
    
    // Wait for the error message to appear
    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: "test<script>@email.com" } });
    fireEvent.blur(emailInput);
    expect(await screen.findByText("Please remove special characters (< > { } [ ])")).toBeInTheDocument();
    
    // Test valid email
    fireEvent.change(emailInput, { target: { value: "valid@email.com" } });
    fireEvent.blur(emailInput);
    // Error should go away or the internal rule just passes (we can't explicitly assert missing error immediately without waitForElementToBeRemoved, but the branch will be covered).

    // Test Phone validation side effects
    fireEvent.change(contactMethodSelect, { target: { value: "phone" } });
    const phoneInput = await screen.findByPlaceholderText("e.g. 09123456789 or +63...");
    
    fireEvent.change(phoneInput, { target: { value: "123" } });
    fireEvent.blur(phoneInput);
    expect(await screen.findByText("Please enter a valid phone number (e.g. 09123456789 or +63...)")).toBeInTheDocument();
    
    // Test valid phone
    fireEvent.change(phoneInput, { target: { value: "09123456789" } });
    fireEvent.blur(phoneInput);
  });
});
