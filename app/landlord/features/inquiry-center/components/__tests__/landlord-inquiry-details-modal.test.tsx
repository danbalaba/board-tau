import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { LandlordInquiryDetailsModal } from '../landlord-inquiry-details-modal';
import { useEdgeStore } from '@/lib/edgestore';
import { useRouter, usePathname } from 'next/navigation';

jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}));

jest.mock('@/components/modals/Modal', () => {
  return function MockModal({ children, isOpen }: any) {
    return isOpen ? <div data-testid="modal">{children}</div> : null;
  };
});

jest.mock('@/components/common/Avatar', () => {
  return function MockAvatar({ name }: any) {
    return <div data-testid="avatar">{name}</div>;
  };
});

jest.mock('@/components/common/SafeImage', () => {
  return {
    __esModule: true,
    default: function MockSafeImage({ alt }: any) {
      return <img alt={alt} data-testid="safe-image" />;
    }
  };
});

jest.mock('@/components/common/Button', () => {
  return function MockButton({ children, onClick }: any) {
    return <button onClick={onClick}>{children}</button>;
  };
});

jest.mock('../landlord-inquiry-decline-modal', () => ({
  LandlordInquiryDeclineModal: ({ isOpen, onConfirm }: any) => {
    return isOpen ? (
      <div data-testid="decline-modal">
        <button onClick={() => onConfirm('Test reason')}>Confirm Decline Mock</button>
      </div>
    ) : null;
  }
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, variants, ...rest } = props;
        return <div ref={ref} {...rest}>{children}</div>;
      }),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, variants, ...rest } = props;
        return <button ref={ref} {...rest}>{children}</button>;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      return () => <div data-testid={`icon-${String(prop).toLowerCase()}`} />;
    }
  });
});

const mockInquiry: any = {
  id: '123',
  status: 'PENDING',
  moveInDate: '2025-01-01',
  checkOutDate: '2025-06-01',
  occupantsCount: 2,
  user: {
    id: 'u1',
    name: 'John Doe',
    email: 'john@example.com'
  },
  listing: {
    id: 'l1',
    title: 'Sunny Apartment',
    imageSrc: '/sunny.jpg'
  },
  room: {
    name: 'Master Bedroom',
    reservationFee: 500
  },
  message: 'Can I bring my cat?',
  isSoloBuyout: true,
  createdAt: new Date().toISOString()
};

describe('LandlordInquiryDetailsModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (useEdgeStore as jest.Mock).mockReturnValue({ edgestore: {} });
    (useRouter as jest.Mock).mockReturnValue({});
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders loading state initially', () => {
    render(<LandlordInquiryDetailsModal inquiry={mockInquiry} isOpen={true} onClose={jest.fn()} onUpdateStatus={jest.fn()} />);
    expect(screen.getByText('Loading Inquiry Data...')).toBeInTheDocument();
  });

  it('renders details after loading completes', () => {
    render(<LandlordInquiryDetailsModal inquiry={mockInquiry} isOpen={true} onClose={jest.fn()} onUpdateStatus={jest.fn()} />);
    
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument();
    expect(screen.getByText('Solo Buyout Request')).toBeInTheDocument();
    expect(screen.getByText(/Can I bring my cat\?/i)).toBeInTheDocument();
    expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
  });

  it('calls onUpdateStatus when Approve is clicked', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    render(<LandlordInquiryDetailsModal inquiry={mockInquiry} isOpen={true} onClose={jest.fn()} onUpdateStatus={mockUpdate} />);
    
    act(() => {
      jest.advanceTimersByTime(600);
    });

    const approveBtn = screen.getByText(/Approve Inquiry/i);
    await act(async () => {
      fireEvent.click(approveBtn);
    });

    expect(mockUpdate).toHaveBeenCalledWith('123', 'APPROVED', undefined);
  });

  it('opens decline modal and processes decline', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    render(<LandlordInquiryDetailsModal inquiry={mockInquiry} isOpen={true} onClose={jest.fn()} onUpdateStatus={mockUpdate} />);
    
    act(() => {
      jest.advanceTimersByTime(600);
    });

    const declineBtn = screen.getByText(/Decline Inquiry/i);
    fireEvent.click(declineBtn);

    const confirmDecline = screen.getByText('Confirm Decline Mock');
    await act(async () => {
      fireEvent.click(confirmDecline);
    });

    expect(mockUpdate).toHaveBeenCalledWith('123', 'REJECTED', 'Test reason');
  });

  it('shows decision already made for non-pending inquiries', () => {
    const approvedInquiry = { ...mockInquiry, status: 'APPROVED' };
    render(<LandlordInquiryDetailsModal inquiry={approvedInquiry} isOpen={true} onClose={jest.fn()} onUpdateStatus={jest.fn()} />);
    
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/Decision already made:/i)).toBeInTheDocument();
    expect(screen.getAllByText('APPROVED').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Approve Inquiry/i)).not.toBeInTheDocument();
  });
});
