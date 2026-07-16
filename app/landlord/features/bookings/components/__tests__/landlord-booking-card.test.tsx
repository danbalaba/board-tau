import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordBookingCard } from '../landlord-booking-card';

// Mock Dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return true;
      return () => <div data-testid={`icon-${String(prop).toLowerCase()}`} />;
    }
  });
});

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, layout, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
    button: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, layout, ...rest } = props;
      return <button ref={ref} {...rest} />;
    })
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />
}));

describe('LandlordBookingCard', () => {
  const mockBooking = {
    id: 'b-1',
    listing: { id: 'l-1', title: 'Sunny Apartment', imageSrc: '/img.jpg' },
    room: { id: 'r-1', name: 'Master Room', price: 5000 },
    user: { id: 'u-1', name: 'John Doe', email: 'john@example.com' },
    status: 'CHECKED_IN',
    paymentStatus: 'paid',
    totalPrice: 5000,
    startDate: new Date('2023-01-01').toISOString(),
    endDate: new Date('2023-01-10').toISOString(),
    isArchived: false,
    createdAt: new Date('2023-01-01').toISOString(),
  };

  const mockProps = {
    booking: mockBooking,
    idx: 0,
    viewMode: 'grid' as const,
    statusColors: {},
    paymentStatusColors: {},
    onUpdateStatus: jest.fn(),
    isUpdatingStatus: false,
    onViewDetails: jest.fn(),
    onArchive: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders booking information correctly', () => {
    render(<LandlordBookingCard {...mockProps} />);
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('₱5,000')).toBeInTheDocument();
  });

  it('calls onViewDetails when clicking View Details button', () => {
    render(<LandlordBookingCard {...mockProps} />);
    const viewBtn = screen.getByText('Details').closest('button');
    fireEvent.click(viewBtn!);
    expect(mockProps.onViewDetails).toHaveBeenCalledWith(mockBooking);
  });

  it('calls onUpdateStatus when updating status', () => {
    render(<LandlordBookingCard {...mockProps} booking={{ ...mockBooking, status: 'CHECKED_IN' }} />);
    // "Complete Stay" button should be available for CHECKED_IN
    const completeBtn = screen.getByText(/Complete/i).closest('button');
    fireEvent.click(completeBtn!);
    expect(mockProps.onUpdateStatus).toHaveBeenCalledWith('b-1', 'COMPLETED');
  });

  it('calls onArchive when archive button is clicked', () => {
    render(<LandlordBookingCard {...mockProps} />);
    // Grid mode renders the archive button with an icon
    const archiveBtn = screen.getByTitle('Archive');
    fireEvent.click(archiveBtn!);
    expect(mockProps.onArchive).toHaveBeenCalled();
  });

  it('renders list view correctly', () => {
    render(<LandlordBookingCard {...mockProps} viewMode="list" />);
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
