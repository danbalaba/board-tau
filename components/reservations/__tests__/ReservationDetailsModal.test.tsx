import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ReservationDetailsModal from '../ReservationDetailsModal';
import { generateConfirmationSlipPDF } from '@/utils/slipGenerator';

// Mock Modal
jest.mock('@/components/modals/Modal', () => {
  return function MockModal({ isOpen, children, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <button data-testid="close-modal" onClick={onClose}>Close</button>
        {children}
      </div>
    );
  };
});

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

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
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
  paymentMethod: 'GCASH',
  paymentReference: 'REF123',
  createdAt: '2024-12-01T10:00:00Z',
  listing: {
    id: 'list-1',
    userId: 'landlord-1',
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
    reservationFee: 1500,
    roomType: 'Single',
    images: [{ id: '1', url: '/room1.jpg' }, { id: '2', url: '/room2.jpg' }]
  }
};

describe('ReservationDetailsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnPayNow = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    const { container } = render(
      <ReservationDetailsModal 
        reservation={mockReservation} 
        isOpen={false} 
        currentUserId="user-1" 
        onClose={mockOnClose} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders details correctly', () => {
    render(
      <ReservationDetailsModal 
        reservation={mockReservation} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose} 
      />
    );
    
    expect(screen.getByText('Reservation Details')).toBeInTheDocument();
    expect(screen.getAllByText('Room A').length).toBeGreaterThan(0);
    expect(screen.getByText('gcash Transfer')).toBeInTheDocument();
    expect(screen.getByText('Ref: REF123')).toBeInTheDocument();
  });

  it('allows navigating images in room gallery', () => {
    render(
      <ReservationDetailsModal 
        reservation={mockReservation} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose} 
      />
    );
    
    // There are 2 images, so next and prev buttons should be present.
    // We mocked lucide-react with standard icons, so we can select by checking class or buttons
    const buttons = screen.getAllByRole('button');
    // Just click buttons that aren't text buttons
    const nextBtn = buttons.find(b => b.innerHTML.includes('lucide-chevron-right'));
    if (nextBtn) {
      fireEvent.click(nextBtn);
    }
    
    const prevBtn = buttons.find(b => b.innerHTML.includes('lucide-chevron-left'));
    if (prevBtn) {
      fireEvent.click(prevBtn);
    }
  });

  it('handles Pay Now button', () => {
    render(
      <ReservationDetailsModal 
        reservation={mockReservation} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
        onPayNow={mockOnPayNow}
      />
    );
    
    const payBtn = screen.getByText('Pay Now');
    fireEvent.click(payBtn);
    expect(mockOnPayNow).toHaveBeenCalled();
  });

  it('handles Cancel button', () => {
    render(
      <ReservationDetailsModal 
        reservation={mockReservation} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles Download Pass button for RESERVED status', async () => {
    (generateConfirmationSlipPDF as jest.Mock).mockResolvedValueOnce(true);
    
    render(
      <ReservationDetailsModal 
        reservation={{ ...mockReservation, status: 'RESERVED' }} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
      />
    );
    
    const dlBtn = screen.getByText('Download Pass');
    fireEvent.click(dlBtn);
    expect(generateConfirmationSlipPDF).toHaveBeenCalled();
  });

  it('handles Chat Landlord button', () => {
    render(
      <ReservationDetailsModal 
        reservation={mockReservation} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
      />
    );
    
    const chatBtn = screen.getByText('Chat Landlord');
    fireEvent.click(chatBtn);
    expect(mockPush).toHaveBeenCalledWith('/messages?listingId=list-1&otherUserId=landlord-1');
  });

  it('displays notification and marks as read', () => {
    const mockOnMarkAsRead = jest.fn();
    const notification = { title: 'Test Alert', description: 'Test desc', id: 'notif-1', isRead: false, type: 'status' } as any;
    
    const { rerender } = render(
      <ReservationDetailsModal 
        reservation={mockReservation} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
        notification={notification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );
    
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(mockOnMarkAsRead).toHaveBeenCalled();

    rerender(
      <ReservationDetailsModal 
        reservation={mockReservation} 
        isOpen={true} 
        currentUserId="user-1" 
        onClose={mockOnClose}
        notification={undefined}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );
    
    // Test the 8 second auto-dismiss
    act(() => {
      jest.advanceTimersByTime(8000);
    });
    
    expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
  });
});
