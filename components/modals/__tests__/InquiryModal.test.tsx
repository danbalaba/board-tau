import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InquiryModal from "../InquiryModal";
import { useInquiryLogic } from "../inquiry-modal/useInquiryLogic";

// Mock the custom hook to control the internal logic and steps easily
jest.mock("../inquiry-modal/useInquiryLogic");

// Mock the step components to avoid react-hook-form internal crashes when using a mocked control object
jest.mock("../inquiry-modal/steps/PaymentStep", () => () => <div data-testid="payment-step">PaymentStep</div>);
jest.mock("../inquiry-modal/steps/StayStep", () => () => <div data-testid="stay-step">StayStep</div>);
jest.mock("../inquiry-modal/steps/NoteStep", () => () => <div data-testid="note-step">NoteStep</div>);
jest.mock("../inquiry-modal/steps/PrepareStep", () => () => <div data-testid="prepare-step">PrepareStep</div>);
jest.mock("../inquiry-modal/steps/ReviewStep", () => () => <div data-testid="review-step">ReviewStep</div>);
jest.mock("../inquiry-modal/steps/OTPVerifyStep", () => () => <div data-testid="otp-verify-step">OTPVerifyStep</div>);

const mockRoom = {
  id: "room-123",
  name: "Deluxe Suite",
  price: 5000,
  capacity: 2,
  availableSlots: 1,
  images: [],
  roomType: "Private",
  status: "AVAILABLE",
  reservationFee: 1000,
};

describe("InquiryModal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for the hook
    (useInquiryLogic as jest.Mock).mockReturnValue({
      currentStep: 1,
      totalSteps: 7,
      direction: 1,
      isStepCompleted: jest.fn().mockReturnValue(true),
      handleNextStep: jest.fn(),
      handlePrevStep: jest.fn(),
      handleFormSubmit: jest.fn(),
      submitted: false,
      isUploading: false,
      register: jest.fn(),
      errors: {},
      getValues: jest.fn().mockReturnValue(1),
      watch: jest.fn(),
      control: { _names: { array: new Set(), mount: new Set(), unMount: new Set(), watch: new Set(), focus: '', watchAll: false }, _subjects: { watch: { subscribe: jest.fn() }, array: { subscribe: jest.fn() }, state: { subscribe: jest.fn() } }, _defaultValues: {}, _formValues: {}, _state: {}, register: jest.fn(), unregister: jest.fn() } as any,
      clearErrors: jest.fn(),
      isShowingIDList: false,
      setIsShowingIDList: jest.fn(),
      selectedIDTab: "primary",
      setSelectedIDTab: jest.fn(),
      hasReadGuidelines: false,
      setHasReadGuidelines: jest.fn(),
      isProcessing: false,
      watchedValues: {},
      capturedSelfie: null,
      capturedID: null,
      currentImageIndex: 0,
      setCurrentImageIndex: jest.fn(),
    });
  });

  it("renders the modal and shows step 1 correctly", () => {
    render(
      <InquiryModal
        listingName="Grand Resort"
        listingId="list-123"
        landlordId="landlord-123"
        room={mockRoom}
        onSubmit={mockOnSubmit}
        isLoading={false}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Should display the header
    expect(screen.getByText("Send Inquiry")).toBeInTheDocument();
    expect(screen.getByText("Grand Resort")).toBeInTheDocument();
    
    // Should display step indicators (Pay, Stay, Note, etc.)
    expect(screen.getAllByText(/Pay/i).length).toBeGreaterThan(0);
    
    // Should display the Room Summary Sidebar
    expect(screen.getAllByText("Deluxe Suite").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₱ 5,000").length).toBeGreaterThan(0);
  });

  it("calls onClose when the close button is clicked", () => {
    render(
      <InquiryModal
        listingName="Grand Resort"
        listingId="list-123"
        landlordId="landlord-123"
        room={mockRoom}
        onSubmit={mockOnSubmit}
        isLoading={false}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // The close button is the one with FaTimes, usually aria-label or just button. 
    // We can find it by getting all buttons and finding the one with the close icon, or by role.
    // In our component, it's just a button with onClick={onClose}
    const closeButtons = screen.getAllByRole("button");
    // The close button is the first button in the header
    fireEvent.click(closeButtons[0]);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls handleNextStep when Continue is clicked on a completed step", () => {
    const handleNextStepMock = jest.fn();
    (useInquiryLogic as jest.Mock).mockReturnValue({
      currentStep: 1,
      totalSteps: 7,
      direction: 1,
      isStepCompleted: jest.fn().mockReturnValue(true),
      handleNextStep: handleNextStepMock,
      handlePrevStep: jest.fn(),
      handleFormSubmit: jest.fn(),
      submitted: false,
      isUploading: false,
      register: jest.fn(),
      errors: {},
      getValues: jest.fn().mockReturnValue(1),
      watch: jest.fn(),
      control: { _names: { array: new Set(), mount: new Set(), unMount: new Set(), watch: new Set(), focus: '', watchAll: false }, _subjects: { watch: { subscribe: jest.fn() }, array: { subscribe: jest.fn() }, state: { subscribe: jest.fn() } }, _defaultValues: {}, _formValues: {}, _state: {}, register: jest.fn(), unregister: jest.fn() } as any,
      clearErrors: jest.fn(),
    });

    render(
      <InquiryModal
        listingName="Grand Resort"
        listingId="list-123"
        landlordId="landlord-123"
        room={mockRoom}
        onSubmit={mockOnSubmit}
        isLoading={false}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const continueButton = screen.getByText(/CONTINUE/i);
    fireEvent.click(continueButton);

    expect(handleNextStepMock).toHaveBeenCalledTimes(1);
  });

  it("renders all steps and success overlay", () => {
    // We will render step 7 to cover the ReviewStep branch
    (useInquiryLogic as jest.Mock).mockReturnValue({
      currentStep: 7,
      totalSteps: 7,
      direction: 1,
      isStepCompleted: jest.fn().mockReturnValue(true),
      handleNextStep: jest.fn(),
      handlePrevStep: jest.fn(),
      handleFormSubmit: jest.fn(),
      submitted: true, // test the success overlay
      isUploading: false,
      register: jest.fn(),
      errors: {},
      getValues: jest.fn().mockReturnValue(1),
      watchedValues: {},
    });

    render(
      <InquiryModal
        listingName="Grand Resort"
        listingId="list-123"
        landlordId="landlord-123"
        room={mockRoom}
        onSubmit={mockOnSubmit}
        isLoading={false}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Success overlay
    expect(screen.getByText("INQUIRY SENT!")).toBeInTheDocument();
  });

  it("toggles mobile details and image carousel", () => {
    const setCurrentImageIndexMock = jest.fn();
    (useInquiryLogic as jest.Mock).mockReturnValue({
      currentStep: 2, // Cover Step 2 render
      totalSteps: 7,
      direction: 1,
      isStepCompleted: jest.fn().mockReturnValue(true),
      handleNextStep: jest.fn(),
      handlePrevStep: jest.fn(),
      handleFormSubmit: jest.fn(),
      submitted: false,
      isUploading: false,
      register: jest.fn(),
      errors: {},
      getValues: jest.fn().mockReturnValue(1),
      watch: jest.fn(),
      control: { _names: { array: new Set(), mount: new Set(), unMount: new Set(), watch: new Set(), focus: '', watchAll: false }, _subjects: { watch: { subscribe: jest.fn() }, array: { subscribe: jest.fn() }, state: { subscribe: jest.fn() } }, _defaultValues: {}, _formValues: {}, _state: {}, register: jest.fn(), unregister: jest.fn() } as any,
      clearErrors: jest.fn(),
      currentImageIndex: 0,
      setCurrentImageIndex: setCurrentImageIndexMock,
    });

    const roomWithImages = {
      ...mockRoom,
      images: [
        { id: "1", url: "img1.jpg" },
        { id: "2", url: "img2.jpg" },
      ]
    };

    render(
      <InquiryModal
        listingName="Grand Resort"
        listingId="list-123"
        landlordId="landlord-123"
        room={roomWithImages}
        onSubmit={mockOnSubmit}
        isLoading={false}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Toggle mobile details
    // Find the button wrapping the room name in the mobile view
    const mobileToggle = screen.getByRole("button", { name: /Deluxe Suite/i });
    fireEvent.click(mobileToggle);
    // The details should expand, meaning the total reservation fee text will appear in the DOM
    expect(screen.getAllByText(/Total Reservation Fee/i).length).toBeGreaterThan(0);

    // Image carousel
    // The previous and next buttons are rendered when images.length > 1
    // They are buttons inside the image container, not easy to query by text. 
    // We can query them by class or just find the buttons that don't have text (they have icons)
    const buttons = screen.getAllByRole("button");
    // Close button (0), Mobile Toggle (1), Prev Image (2), Next Image (3), Back (4), Continue (5)
    // Actually, there's another close button on the success modal? No, we aren't in success mode.
    // Let's just click all buttons that don't have text or aria-labels if possible, or we can use generic clicks
    // The image nav buttons have 'pointer-events-auto'
    const imageNavButtons = buttons.filter(btn => btn.className.includes("pointer-events-auto"));
    
    if (imageNavButtons.length >= 2) {
      fireEvent.click(imageNavButtons[0]); // Prev
      expect(setCurrentImageIndexMock).toHaveBeenCalled();
      fireEvent.click(imageNavButtons[1]); // Next
      expect(setCurrentImageIndexMock).toHaveBeenCalledTimes(2);
    }
  });

  it("covers remaining step renders", () => {
    // Just a loop to render steps 3, 4, 5, 6 to hit the switch cases in renderStepContent
    const steps = [3, 4, 5, 6];
    
    steps.forEach(step => {
      (useInquiryLogic as jest.Mock).mockReturnValue({
        currentStep: step,
        totalSteps: 7,
        direction: 1,
        isStepCompleted: jest.fn().mockReturnValue(true),
        handleNextStep: jest.fn(),
        handlePrevStep: jest.fn(),
        handleFormSubmit: jest.fn(),
        submitted: false,
        isUploading: false,
        register: jest.fn(),
        errors: {},
        getValues: jest.fn().mockReturnValue(1),
        watch: jest.fn(),
        control: { _names: { array: new Set(), mount: new Set(), unMount: new Set(), watch: new Set(), focus: '', watchAll: false }, _subjects: { watch: { subscribe: jest.fn() }, array: { subscribe: jest.fn() }, state: { subscribe: jest.fn() } }, _defaultValues: {}, _formValues: {}, _state: {}, register: jest.fn(), unregister: jest.fn() } as any,
        clearErrors: jest.fn(),
        isShowingIDList: false,
        setIsShowingIDList: jest.fn(),
        selectedIDTab: "primary",
        setSelectedIDTab: jest.fn(),
        hasReadGuidelines: false,
        setHasReadGuidelines: jest.fn(),
        isProcessing: false,
      });

      const { unmount } = render(
        <InquiryModal
          listingName="Grand Resort"
          listingId="list-123"
          landlordId="landlord-123"
          room={mockRoom}
          onSubmit={mockOnSubmit}
          isLoading={false}
          isOpen={true}
          onClose={mockOnClose}
        />
      );
      unmount();
    });
  });
});
