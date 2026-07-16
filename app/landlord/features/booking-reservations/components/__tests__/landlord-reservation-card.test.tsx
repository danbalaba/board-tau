import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordReservationCard } from '../landlord-reservation-card';
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
}));

jest.mock('@/components/common/Button', () => {
  return {
    __esModule: true,
    default: ({ children, onClick, 'data-testid': testId }: any) => (
      <button onClick={onClick} data-testid={testId || 'mock-button'}>{children}</button>
    )
  };
});

jest.mock('@/components/common/SafeImage', () => {
  return {
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="mock-safe-image" />
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

const mockReservation: ReservationRequest = {
  id: 'res-1',
  listing: { id: 'list-1', title: 'Luxury Condo', imageSrc: '/img.jpg' },
  user: { id: 'user-1', name: 'Alice Smith', email: 'alice@example.com' },
  status: 'RESERVED',
  moveInDate: new Date('2023-01-01'),
  stayDuration: 30,
  isArchived: false,
  createdAt: new Date('2023-01-01')
};

describe('LandlordReservationCard', () => {
  const mockProps = {
    reservation: mockReservation,
    idx: 0,
    viewMode: 'grid' as 'grid' | 'list',
    onUpdateStatus: jest.fn(),
    isUpdating: false,
    onViewDetails: jest.fn(),
    onArchive: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reservation details', () => {
    render(<LandlordReservationCard {...mockProps} />);
    expect(screen.getByText('Luxury Condo')).toBeInTheDocument();
    expect(screen.getByText('Perspective Tenant')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('30 Days')).toBeInTheDocument();
  });

  it('calls onViewDetails when Manage button is clicked in grid mode', () => {
    render(<LandlordReservationCard {...mockProps} />);
    const detailsBtn = screen.getByText('Details').closest('button');
    fireEvent.click(detailsBtn!);
    expect(mockProps.onViewDetails).toHaveBeenCalledWith(mockReservation);
  });

  it('calls onUpdateStatus when Check In button is clicked', () => {
    render(<LandlordReservationCard {...mockProps} />);
    const checkInBtn = screen.getByText('Check In').closest('button');
    fireEvent.click(checkInBtn!);
    expect(mockProps.onUpdateStatus).toHaveBeenCalledWith('res-1', 'CHECKED_IN');
  });

  it('calls onArchive when archive icon is clicked', () => {
    render(<LandlordReservationCard {...mockProps} />);
    const archiveBtn = screen.getByTestId('icon-iconarchive').closest('button');
    fireEvent.click(archiveBtn!);
    expect(mockProps.onArchive).toHaveBeenCalled();
  });
});
