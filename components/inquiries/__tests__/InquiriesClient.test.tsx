import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import InquiriesClient from '../InquiriesClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/context/NotificationContext', () => ({
  useNotification: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, ...rest } = props;
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

// Mock ModernLoader to avoid element issues
jest.mock('@/components/common/ModernLoader', () => {
  return function MockModernLoader() {
    return <div data-testid="modern-loader">Loading...</div>;
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

// Mock react-select inside ModernSelect
jest.mock('react-select', () => {
  const React = require('react');
  return function MockSelect({ options, value, onChange, placeholder }: any) {
    return (
      <select
        data-testid={`mock-select-${placeholder}`}
        value={value?.value || value}
        onChange={(e) => {
          const option = options.find((o: any) => o.value === e.target.value);
          onChange(option || e.target.value);
        }}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };
});

describe('InquiriesClient', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  const mockSearchParams = {
    get: jest.fn(),
  };

  const mockNotificationContext = {
    notifications: [],
    markAsRead: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useNotification as jest.Mock).mockReturnValue(mockNotificationContext);
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const mockInquiries = [
    {
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
    },
    {
      id: 'inq-2',
      listingId: 'list-2',
      roomId: 'room-2',
      userId: 'user-1',
      moveInDate: '2025-02-01',
      checkOutDate: '2025-02-28',
      occupantsCount: 1,
      role: 'TENANT',
      contactMethod: 'EMAIL',
      message: 'Hi',
      status: 'APPROVED',
      paymentStatus: 'UNPAID',
      reservationFee: 2000,
      isApproved: true,
      createdAt: '2024-12-05T00:00:00.000Z',
      updatedAt: '2024-12-05T00:00:00.000Z',
      listing: {
        id: 'list-2',
        title: 'City Center Dorm',
        imageSrc: '/dorm.jpg',
        location: {},
        region: 'NCR',
        country: 'Philippines',
      },
      room: {
        id: 'room-2',
        name: 'Room B',
        price: 2000,
        roomType: 'SHARED',
        images: [{ url: '/room2.jpg' }],
      },
    }
  ];

  const advanceTimers = () => {
    // Loop to clear all nested timers correctly without skipping updates
    for (let i = 0; i < 5; i++) {
      act(() => {
        jest.runOnlyPendingTimers();
      });
    }
  };

  it('renders empty state when no inquiries', () => {
    render(<InquiriesClient initialInquiries={[]} currentUserId="user-1" />);
    advanceTimers();
    
    expect(screen.getByText('No Inquiries Found')).toBeInTheDocument();
  });

  it('renders inquiries list', () => {
    render(<InquiriesClient initialInquiries={mockInquiries} currentUserId="user-1" />);
    advanceTimers();
    
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.getByText('Room B')).toBeInTheDocument();
  });

  it('filters inquiries by search query', () => {
    render(<InquiriesClient initialInquiries={mockInquiries} currentUserId="user-1" />);
    advanceTimers();
    
    const searchInput = screen.getByPlaceholderText(/Search by room name/i);
    fireEvent.change(searchInput, { target: { value: 'Room B' } });
    
    advanceTimers();
    
    expect(screen.queryByText('Room A')).not.toBeInTheDocument();
    expect(screen.getByText('Room B')).toBeInTheDocument();
  });

  it('handles cancellation flow', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<InquiriesClient initialInquiries={mockInquiries} currentUserId="user-1" />);
    advanceTimers();
    
    // Find Cancel buttons (only available for PENDING status - Room A)
    const cancelBtns = screen.getAllByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtns[0]);
    
    // Confirm Cancellation modal
    expect(screen.getByText('Cancel Inquiry?')).toBeInTheDocument();
    const confirmCancelBtn = screen.getByText('Yes, Cancel');
    fireEvent.click(confirmCancelBtn);
    
    // Reason Modal
    expect(screen.getByText('Withdrawal Reason')).toBeInTheDocument();
    
    // Select Reason
    const reasonBtn = screen.getByText('Inquired by mistake');
    fireEvent.click(reasonBtn);
    
    // Final Confirm
    const finalConfirmBtn = screen.getByText('Confirm Withdrawal');
    fireEvent.click(finalConfirmBtn);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/inquiries/inq-1/cancel',
        expect.any(Object)
      );
    });
    
    expect(mockRouter.refresh).toHaveBeenCalled();
  });
});
