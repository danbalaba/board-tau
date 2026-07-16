import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordReservationDetailsModal } from '../landlord-reservation-details-modal';
import { ReservationRequest } from '../../hooks/use-reservation-logic';

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function (target, prop) {
      if (typeof prop === 'string' && prop.startsWith('Icon')) {
        return ({ "data-testid": testId, ...props }: any) => (
          <div data-testid={testId || `icon-${prop.toLowerCase()}`} {...props} />
        );
      }
      return target[prop as keyof typeof target];
    }
  });
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

jest.mock('@/components/modals/Modal', () => {
  return {
    __esModule: true,
    default: ({ isOpen, children, title }: any) => isOpen ? (
      <div data-testid="mock-modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null
  };
});

jest.mock('@/components/common/Button', () => {
  return {
    __esModule: true,
    default: ({ children, onClick, 'data-testid': testId }: any) => (
      <button onClick={onClick} data-testid={testId || 'mock-button'}>{children}</button>
    )
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({})),
  usePathname: jest.fn(() => '')
}));

const mockReservation: any = {
  id: 'res-1',
  listing: { id: 'list-1', title: 'Luxury Condo', imageSrc: '/img.jpg' },
  user: { id: 'user-1', name: 'Alice Smith', email: 'alice@example.com' },
  status: 'RESERVED',
  moveInDate: new Date('2023-01-01').toISOString(),
  stayDuration: 30,
  isArchived: false,
  totalPrice: 5000,
  createdAt: new Date('2023-01-01').toISOString()
};

describe('LandlordReservationDetailsModal', () => {
  const mockProps = {
    reservation: mockReservation,
    isOpen: true,
    onClose: jest.fn(),
    onUpdateStatus: jest.fn().mockResolvedValue(true)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal details correctly after loading delay', async () => {
    render(<LandlordReservationDetailsModal {...mockProps} />);
    
    // Wait for initial loading state to finish
    await waitFor(() => {
      expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Luxury Condo')).toBeInTheDocument();
    expect(screen.getByText('₱5,000')).toBeInTheDocument();
  });

  it('calls onUpdateStatus when Confirm Check-In is clicked', async () => {
    render(<LandlordReservationDetailsModal {...mockProps} />);
    
    await waitFor(() => {
      const checkInBtn = screen.getByText('Confirm Check-In').closest('button');
      fireEvent.click(checkInBtn!);
    });

    expect(mockProps.onUpdateStatus).toHaveBeenCalledWith('res-1', 'CHECKED_IN', undefined);
  });
});
