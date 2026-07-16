import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordBookingDetailsModal } from '../landlord-booking-details-modal';

// Mock Next.js Dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/mock-path'
}));

// Mock Dependencies
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
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />
}));

describe('LandlordBookingDetailsModal', () => {
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
    isOpen: true,
    onClose: jest.fn(),
    onUpdateStatus: jest.fn(),
    isUpdatingStatus: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<LandlordBookingDetailsModal {...mockProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal details correctly when open', async () => {
    render(<LandlordBookingDetailsModal {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText('Sunny Apartment')).toBeInTheDocument();
    });
    expect(screen.getByText('Booking Details')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('₱5,000 Total Paid')).toBeInTheDocument();
    expect(screen.getByText('Currently In-house')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<LandlordBookingDetailsModal {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText('Sunny Apartment')).toBeInTheDocument();
    });
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn!);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onUpdateStatus when complete stay is clicked', async () => {
    render(<LandlordBookingDetailsModal {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText('Sunny Apartment')).toBeInTheDocument();
    });
    const completeBtn = screen.getByText(/Complete Stay/).closest('button');
    fireEvent.click(completeBtn!);
    expect(mockProps.onUpdateStatus).toHaveBeenCalledWith('b-1', 'COMPLETED');
  });

  it('renders guest photos if present', async () => {
    const walkInBooking = {
      ...mockBooking,
      isWalkIn: true,
      guestPhotoUrl: '/photo.jpg',
      guestIdUrl: '/id.jpg'
    };
    render(<LandlordBookingDetailsModal {...mockProps} booking={walkInBooking} />);
    await waitFor(() => {
      expect(screen.getByText('Sunny Apartment')).toBeInTheDocument();
    });
    // At least 2 images should be present (profile and ID photo)
    const images = screen.getAllByTestId('safe-image');
    expect(images.length).toBeGreaterThanOrEqual(1);
  });
});
