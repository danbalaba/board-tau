import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InquiryDetailsModal from '../InquiryDetailsModal';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

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
      button: Dummy,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock portal so modal renders inline for testing
jest.mock('@/components/modals/Modal', () => {
  return function MockModal({ isOpen, children, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <button onClick={onClose}>Close Modal</button>
        {children}
      </div>
    );
  };
});

// Mock SafeImage
jest.mock('@/components/common/SafeImage', () => {
  return function MockSafeImage({ src, alt }: any) {
    return <img src={src} alt={alt} data-testid="safe-image" />;
  };
});

describe('InquiryDetailsModal', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const mockInquiry = {
    id: 'inq-1',
    listingId: 'list-1',
    roomId: 'room-1',
    userId: 'user-1',
    moveInDate: '2025-01-01',
    checkOutDate: '2025-01-30',
    occupantsCount: 2,
    role: 'TENANT',
    contactMethod: 'EMAIL',
    message: 'Looking forward to staying here.',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    reservationFee: 1500,
    isApproved: false,
    createdAt: '2024-12-01T00:00:00.000Z',
    updatedAt: '2024-12-01T00:00:00.000Z',
    rejectionReason: '',
    profilePhotoUrl: '/selfie.jpg',
    idAttachmentUrl: '/id.jpg',
    listing: {
      id: 'list-1',
      title: 'Beautiful Boarding House',
      imageSrc: '/house.jpg',
      location: {},
      region: 'NCR',
      country: 'Philippines',
      userId: 'landlord-1'
    },
    room: {
      id: 'room-1',
      name: 'Room A',
      price: 1500,
      capacity: 1,
      roomType: 'SOLO',
      images: [{ id: 'img1', url: '/room1.jpg' }, { id: 'img2', url: '/room2.jpg' }],
    },
  };

  const mockOnClose = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnMarkAsRead = jest.fn();

  it('renders nothing when closed', () => {
    const { container } = render(
      <InquiryDetailsModal 
        inquiry={mockInquiry} 
        isOpen={false} 
        currentUserId="user-1" 
        onClose={mockOnClose}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders details correctly when open', () => {
    render(
      <InquiryDetailsModal 
        inquiry={mockInquiry} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Inquiry Details')).toBeInTheDocument();
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.getAllByText(/Beautiful Boarding House/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Looking forward to staying here/i)).toBeInTheDocument();
  });

  it('shows rejection reason if status is REJECTED', () => {
    render(
      <InquiryDetailsModal 
        inquiry={{ ...mockInquiry, status: 'REJECTED', rejectionReason: 'Not available' }} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Feedback from Host/i)).toBeInTheDocument();
    expect(screen.getByText(/"Not available"/i)).toBeInTheDocument();
  });

  it('shows notification and clears it after 8 seconds', () => {
    const notification = { title: 'Test Alert', description: 'Test desc', id: 'notif-1', isRead: false, type: 'status' } as any;
    
    render(
      <InquiryDetailsModal 
        inquiry={mockInquiry} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
        notification={notification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );
    
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(mockOnMarkAsRead).toHaveBeenCalled();
    
    act(() => {
      jest.advanceTimersByTime(8000);
    });
    
    expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
  });

  it('calls onCancel when Withdraw button is clicked (PENDING status)', () => {
    render(
      <InquiryDetailsModal 
        inquiry={{ ...mockInquiry, status: 'PENDING' }} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
        onCancel={mockOnCancel}
      />
    );

    const withdrawBtn = screen.getByText('Withdraw');
    fireEvent.click(withdrawBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('navigates to chat when Chat Landlord is clicked', () => {
    render(
      <InquiryDetailsModal 
        inquiry={mockInquiry} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
      />
    );

    const chatBtn = screen.getByText('Chat Landlord');
    fireEvent.click(chatBtn);
    expect(mockRouter.push).toHaveBeenCalledWith('/messages?listingId=list-1&otherUserId=landlord-1');
  });

  it('navigates to reservations when View button is clicked (APPROVED status)', () => {
    render(
      <InquiryDetailsModal 
        inquiry={{ ...mockInquiry, status: 'APPROVED' }} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
      />
    );

    const viewBtn = screen.getByText('View');
    fireEvent.click(viewBtn);
    expect(mockRouter.push).toHaveBeenCalledWith('/reservations');
  });
});
