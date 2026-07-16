import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InquiryCard from '../InquiryCard';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
    return <div ref={ref} {...rest} />;
  });
  Dummy.displayName = 'MotionDummy';
  return {
    motion: {
      div: Dummy,
      span: Dummy,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('InquiryCard', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Clear localStorage before each test
    localStorage.clear();
  });

  const mockInquiry = {
    id: 'inq-1',
    listingId: 'list-1',
    roomId: 'room-1',
    userId: 'user-1',
    moveInDate: '2025-01-01',
    checkOutDate: '2025-01-30',
    occupantsCount: 1,
    role: 'TENANT',
    contactMethod: 'EMAIL',
    message: 'Hello',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    reservationFee: 1500,
    isApproved: false,
    createdAt: '2024-12-01T00:00:00.000Z',
    updatedAt: '2024-12-01T00:00:00.000Z',
    listing: {
      id: 'list-1',
      title: 'Beautiful Boarding House',
      imageSrc: '/house.jpg',
      location: {},
      region: 'NCR',
      country: 'Philippines',
    },
    room: {
      id: 'room-1',
      name: 'Room A',
      price: 1500,
      roomType: 'SOLO',
      images: [{ url: '/room.jpg' }],
    },
  };

  const mockOnViewDetails = jest.fn();
  const mockOnCancel = jest.fn();

  it('renders correctly', () => {
    render(
      <InquiryCard 
        inquiry={mockInquiry} 
        onViewDetails={mockOnViewDetails}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.getByText('Beautiful Boarding House')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('₱ 1,500')).toBeInTheDocument();
  });

  it('calls onViewDetails when Details button is clicked', () => {
    render(
      <InquiryCard 
        inquiry={mockInquiry} 
        onViewDetails={mockOnViewDetails}
        onCancel={mockOnCancel}
      />
    );
    
    const detailsBtn = screen.getByText(/Details/i);
    fireEvent.click(detailsBtn);
    expect(mockOnViewDetails).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <InquiryCard 
        inquiry={mockInquiry} 
        onViewDetails={mockOnViewDetails}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('navigates to reservations when View Reservation is clicked on APPROVED status', () => {
    render(
      <InquiryCard 
        inquiry={{ ...mockInquiry, status: 'APPROVED' }} 
        onViewDetails={mockOnViewDetails}
        onCancel={mockOnCancel}
      />
    );
    
    const viewResBtn = screen.getByText(/View Reservation/i);
    expect(viewResBtn).toBeInTheDocument();
    
    fireEvent.click(viewResBtn);
    expect(localStorage.getItem('inquiry_seen_inq-1')).toBe('true');
    expect(mockRouter.push).toHaveBeenCalledWith('/reservations');
  });

  it('does not show View Reservation if already clicked (seen in localStorage)', () => {
    localStorage.setItem('inquiry_seen_inq-1', 'true');
    
    render(
      <InquiryCard 
        inquiry={{ ...mockInquiry, status: 'APPROVED' }} 
        onViewDetails={mockOnViewDetails}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByText(/View Reservation/i)).not.toBeInTheDocument();
  });
});
