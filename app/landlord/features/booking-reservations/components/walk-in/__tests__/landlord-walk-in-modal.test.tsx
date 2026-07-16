import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandlordWalkInModal from '../landlord-walk-in-modal';
import { useWalkInModal } from '../../../hooks/use-walk-in-modal';

jest.mock('../../../hooks/use-walk-in-modal', () => ({
  useWalkInModal: jest.fn()
}));

jest.mock('@/components/common/SafeImage', () => {
  return {
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="mock-safe-image" />
  };
});

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('../steps/walk-in-location-step', () => () => <div data-testid="step-1">Location Step</div>);
jest.mock('../steps/walk-in-guest-step', () => () => <div data-testid="step-2">Guest Step</div>);
jest.mock('@/components/modals/inquiry-modal/steps/SelfieStep', () => () => <div data-testid="step-3">Selfie Step</div>);
jest.mock('@/components/modals/inquiry-modal/steps/IDStep', () => () => <div data-testid="step-4">ID Step</div>);
jest.mock('../steps/walk-in-payment-step', () => () => <div data-testid="step-5">Payment Step</div>);
jest.mock('../steps/walk-in-review-step', () => () => <div data-testid="step-6">Review Step</div>);

describe('LandlordWalkInModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const mockModalLogic = {
    currentStep: 1,
    totalSteps: 6,
    direction: 1,
    isUploading: false,
    submitted: false,
    handleNextStep: jest.fn(),
    handlePrevStep: jest.fn(),
    handleFormSubmit: jest.fn(),
    isStepCompleted: jest.fn().mockReturnValue(true),
    getValues: jest.fn((key) => {
      if (key === 'listingId') return 'list-1';
      if (key === 'roomId') return 'room-1';
      return null;
    }),
    register: jest.fn(),
    errors: {},
    setValue: jest.fn(),
    watch: jest.fn(),
    dateRange: undefined,
    setDateRange: jest.fn(),
    showCalendar: false,
    setShowCalendar: jest.fn(),
    setCurrentImageIndex: jest.fn(),
    currentImageIndex: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWalkInModal as jest.Mock).mockReturnValue(mockModalLogic);
  });

  const mockListings = [
    { id: 'list-1', title: 'Listing 1', rooms: [{ id: 'room-1', name: 'Room 1', price: 1000 }] }
  ];

  it('renders step 1 initially', () => {
    render(<LandlordWalkInModal isOpen={true} onClose={mockOnClose} landlordId="l-1" listings={mockListings} onSuccess={mockOnSuccess} />);
    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(screen.getByText('Create Walk-In Record')).toBeInTheDocument();
  });

  it('calls handleNextStep when continue is clicked', () => {
    render(<LandlordWalkInModal isOpen={true} onClose={mockOnClose} landlordId="l-1" listings={mockListings} onSuccess={mockOnSuccess} />);
    const continueBtn = screen.getByText('CONTINUE').closest('button');
    fireEvent.click(continueBtn!);
    expect(mockModalLogic.handleNextStep).toHaveBeenCalled();
  });

  it('calls handlePrevStep when back is clicked', () => {
    (useWalkInModal as jest.Mock).mockReturnValue({ ...mockModalLogic, currentStep: 2 });
    render(<LandlordWalkInModal isOpen={true} onClose={mockOnClose} landlordId="l-1" listings={mockListings} onSuccess={mockOnSuccess} />);
    
    const backBtn = screen.getByText('BACK').closest('button');
    fireEvent.click(backBtn!);
    expect(mockModalLogic.handlePrevStep).toHaveBeenCalled();
  });

  it('renders success overlay when submitted is true', () => {
    (useWalkInModal as jest.Mock).mockReturnValue({ ...mockModalLogic, submitted: true });
    render(<LandlordWalkInModal isOpen={true} onClose={mockOnClose} landlordId="l-1" listings={mockListings} onSuccess={mockOnSuccess} />);
    
    expect(screen.getByText('WALK-IN CREATED!')).toBeInTheDocument();
  });
});
