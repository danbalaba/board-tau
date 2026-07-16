import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ReservationsClient from '../ReservationsClient';

// Mock dependencies
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: jest.fn(() => ({ get: jest.fn() }))
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } } })
}));

jest.mock('@/context/NotificationContext', () => ({
  useNotification: () => ({
    notifications: [],
    markAsRead: jest.fn()
  })
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn()
  }
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, custom, variants, initial, animate, exit, whileHover, whileTap, drag, dragConstraints, dragElastic, ...props }: any, ref: any) => (
        <div ref={ref} {...props}>{children}</div>
      )),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <button ref={ref} {...props}>{children}</button>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
  };
});

// Mock Child Components
jest.mock('@/components/reservations/ReservationCard', () => {
  return function MockReservationCard({ reservation, onViewDetails, onPayNow, onCancel, onReview }: any) {
    return (
      <div data-testid="reservation-card">
        {reservation.room.name}
        <button onClick={onViewDetails}>Details</button>
        <button onClick={onPayNow}>Pay</button>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onReview}>Review</button>
      </div>
    );
  };
});

jest.mock('@/components/reservations/ReservationDetailsModal', () => {
  return function MockReservationDetailsModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="details-modal">
        <button onClick={onClose}>Close Details</button>
      </div>
    );
  };
});

jest.mock('@/components/reservations/PaymentModal', () => {
  return function MockPaymentModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="payment-modal">
        <button onClick={onClose}>Close Payment</button>
      </div>
    );
  };
});

jest.mock('@/components/modals/ReviewModal', () => {
  return function MockReviewModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="review-modal">
        <button onClick={onClose}>Close Review</button>
      </div>
    );
  };
});

jest.mock('@/components/modals/Modal', () => {
  return function MockModal({ isOpen, children }: any) {
    if (!isOpen) return null;
    return <div data-testid="generic-modal">{children}</div>;
  };
});

jest.mock('@/components/common/ConfirmModal', () => {
  return function MockConfirmModal({ onConfirm, onClose }: any) {
    return (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel Confirm</button>
      </div>
    );
  };
});

// Mock ModernSelect
jest.mock('@/components/common/ModernSelect', () => {
  return function MockModernSelect({ value, onChange, options }: any) {
    return (
      <select data-testid="modern-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  };
});

jest.mock('@/components/common/ModernLoader', () => {
  return function MockModernLoader({ text }: any) {
    return <div data-testid="modern-loader">{text}</div>;
  };
});

const mockReservations = [
  {
    id: 'res-1',
    listingId: 'list-1',
    roomId: 'room-1',
    userId: 'user-1',
    startDate: '2025-01-01',
    endDate: '2025-01-30',
    durationInDays: 30,
    totalPrice: 1500,
    occupantsCount: 1,
    status: 'PENDING_PAYMENT',
    paymentStatus: 'UNPAID',
    createdAt: '2024-12-01T10:00:00Z',
    listing: {
      id: 'list-1',
      title: 'Awesome Listing',
      imageSrc: '/img.jpg',
      location: {}
    },
    room: {
      id: 'room-1',
      name: 'Room A',
      price: 1500,
      reservationFee: 1500,
      roomType: 'Single',
      images: []
    }
  }
];

describe('ReservationsClient', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const advanceTimers = () => {
    // We need to loop because some timers trigger state updates that trigger new timers
    for (let i = 0; i < 5; i++) {
      act(() => {
        jest.runOnlyPendingTimers();
      });
    }
  };

  it('renders correctly and shows reservations after loading', () => {
    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    
    // Advance timers for the air-gap buffer and loading state
    advanceTimers();
    
    expect(screen.getByText('My Reservations')).toBeInTheDocument();
    expect(screen.getByTestId('reservation-card')).toBeInTheDocument();
    expect(screen.getByText('Room A')).toBeInTheDocument();
  });

  it('handles empty reservations', () => {
    render(<ReservationsClient initialReservations={[]} userId="user-1" />);
    advanceTimers();
    
    expect(screen.getByText('No Reservations Found')).toBeInTheDocument();
  });

  it('opens and closes details modal', () => {
    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    const detailsBtn = screen.getByText('Details');
    fireEvent.click(detailsBtn);
    
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close Details'));
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();
  });

  it('opens payment modal', () => {
    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    const payBtn = screen.getByText('Pay');
    fireEvent.click(payBtn);
    
    expect(screen.getByTestId('payment-modal')).toBeInTheDocument();
  });

  it('handles cancellation flow', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    // 1. Click Cancel on card
    fireEvent.click(screen.getByText('Cancel'));
    
    // 2. Should show Confirm Modal
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    
    // 3. Click Confirm in Confirm Modal
    fireEvent.click(screen.getByText('Confirm'));
    
    // 4. Should show Reason Modal
    expect(screen.getByText('Cancellation Details')).toBeInTheDocument();
    
    // 5. Select a reason
    fireEvent.click(screen.getByText('Financial constraints'));
    
    // 6. Submit Cancellation
    fireEvent.click(screen.getByText('Submit Cancellation'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reservations/res-1/cancel', expect.any(Object));
    });
  });

  it('filters reservations based on search', () => {
    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    expect(screen.getByTestId('reservation-card')).toBeInTheDocument();
    
    const searchInput = screen.getByPlaceholderText('Search by room name or location...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Room' } });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('No Reservations Found')).toBeInTheDocument();
  });

  it('filters reservations by status', () => {
    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    // Fixed: The filter now correctly binds to the PENDING_PAYMENT criteria
    const statusSelect = screen.getAllByTestId('modern-select')[0];
    fireEvent.change(statusSelect, { target: { value: 'PENDING_PAYMENT' } });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('Room A')).toBeInTheDocument();
  });

  it('sorts reservations by price-high', () => {
    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    const sortSelect = screen.getAllByTestId('modern-select')[1];
    fireEvent.change(sortSelect, { target: { value: 'price-high' } });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('Room A')).toBeInTheDocument();
  });

  it('sorts reservations by price-low', () => {
    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    const sortSelect = screen.getAllByTestId('modern-select')[1];
    fireEvent.change(sortSelect, { target: { value: 'price-low' } });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('Room A')).toBeInTheDocument();
  });

  it('auto-opens modal from search params', () => {
    const { useSearchParams } = require('next/navigation');
    useSearchParams.mockReturnValue({
      get: jest.fn((key) => key === 'id' ? 'res-1' : null),
    });

    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
  });

  it('handles sync payment on success status param', async () => {
    const { useSearchParams } = require('next/navigation');
    useSearchParams.mockReturnValue({
      get: jest.fn((key) => key === 'status' ? 'success' : null),
    });
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    
    act(() => {
      jest.advanceTimersByTime(800); // for isMounted
    });
    
    // We must advance timers again to resolve the setTimeout(..., 1500)
    // We use a small loop because async effects can create a chain
    for (let i = 0; i < 5; i++) {
      act(() => {
        jest.runOnlyPendingTimers();
      });
    }

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reservations/sync-payment');
    });
  });

  it('handles cancelled payment status param', () => {
    const { useSearchParams } = require('next/navigation');
    useSearchParams.mockReturnValue({
      get: jest.fn((key) => key === 'status' ? 'cancelled' : null),
    });
    
    const toast = require('react-hot-toast').default;
    render(<ReservationsClient initialReservations={mockReservations} userId="user-1" />);
    advanceTimers();
    
    expect(toast.error).toHaveBeenCalledWith('Payment was cancelled or failed. Please try again.');
  });
});
