import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReservationCard from '../ReservationCard';
import { generateConfirmationSlipPDF } from '@/utils/slipGenerator';

// Mock dependencies
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, custom, variants, initial, animate, exit, whileHover, whileTap, drag, dragConstraints, dragElastic, ...props }: any, ref: any) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
  };
});

jest.mock('@/components/common/SafeImage', () => {
  return function MockSafeImage({ src, alt }: any) {
    return <img src={src} alt={alt} data-testid="safe-image" />;
  };
});

jest.mock('@/utils/slipGenerator', () => ({
  generateConfirmationSlipPDF: jest.fn()
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  })
}));

const mockReservation = {
  id: 'res-1',
  listingId: 'list-1',
  roomId: 'room-1',
  userId: 'user-1',
  startDate: '2025-01-01',
  endDate: '2025-01-30',
  durationInDays: 30,
  totalPrice: 1500,
  status: 'PENDING_PAYMENT',
  paymentStatus: 'UNPAID',
  createdAt: '2024-12-01',
  listing: {
    id: 'list-1',
    title: 'Awesome Listing',
    imageSrc: '/img.jpg',
    location: {},
    region: 'NCR',
    country: 'PH'
  },
  room: {
    id: 'room-1',
    name: 'Room A',
    price: 1500,
    roomType: 'Single'
  }
};

describe('ReservationCard', () => {
  const mockOnViewDetails = jest.fn();
  const mockOnPayNow = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnReview = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onViewDetails={mockOnViewDetails} 
      />
    );
    
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.getByText('Awesome Listing')).toBeInTheDocument();
    expect(screen.getByText('NCR, PH')).toBeInTheDocument();
    expect(screen.getByText('Pending Payment')).toBeInTheDocument();
  });

  it('shows Pay Now button when status is PENDING_PAYMENT', () => {
    render(
      <ReservationCard 
        // Fixed the intentional error for the final green screenshot!
        reservation={mockReservation} 
        onViewDetails={mockOnViewDetails}
        onPayNow={mockOnPayNow}
      />
    );
    
    const payBtn = screen.getByText(/Pay Now/i);
    expect(payBtn).toBeInTheDocument();
    fireEvent.click(payBtn);
    expect(mockOnPayNow).toHaveBeenCalled();
  });

  it('shows Cancel button when status is RESERVED', () => {
    render(
      <ReservationCard 
        // Fixed: We now pass the correct 'RESERVED' state
        reservation={{ ...mockReservation, status: 'RESERVED' }} 
        onViewDetails={mockOnViewDetails}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelBtn = screen.getByText(/Cancel/i);
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('allows downloading confirmation slip for RESERVED status', async () => {
    (generateConfirmationSlipPDF as jest.Mock).mockResolvedValueOnce(true);

    render(
      <ReservationCard 
        reservation={{ ...mockReservation, status: 'RESERVED' }} 
        onViewDetails={mockOnViewDetails}
      />
    );
    
    // In the component, the download button doesn't have text, it has a title "Download Confirmation Slip"
    const dlBtn = screen.getByTitle('Download Confirmation Slip');
    expect(dlBtn).toBeInTheDocument();
    
    fireEvent.click(dlBtn);
    
    expect(generateConfirmationSlipPDF).toHaveBeenCalled();
  });

  it('shows Rate Experience button for COMPLETED status without review', () => {
    render(
      <ReservationCard 
        reservation={{ ...mockReservation, status: 'COMPLETED', hasReview: false }} 
        onViewDetails={mockOnViewDetails}
        onReview={mockOnReview}
      />
    );
    
    const rateBtn = screen.getByText(/Rate Experience/i);
    expect(rateBtn).toBeInTheDocument();
    fireEvent.click(rateBtn);
    expect(mockOnReview).toHaveBeenCalled();
  });

  it('shows Experience Rated for COMPLETED status with review', () => {
    render(
      <ReservationCard 
        reservation={{ ...mockReservation, status: 'COMPLETED', hasReview: true }} 
        onViewDetails={mockOnViewDetails}
      />
    );
    
    expect(screen.getByText(/Experience Rated/i)).toBeInTheDocument();
    expect(screen.getByText('Reviewed')).toBeInTheDocument(); // Badge
  });
});
