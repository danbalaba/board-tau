import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LandlordBookings from '../index';
import { useSearchParams } from 'next/navigation';

// Mock Next.js dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn(), push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
  usePathname: jest.fn(() => '/mock-path')
}));

jest.mock('../../inquiry-center/components/landlord-inquiry-archive-modal', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-archive-modal">Archive Modal</div>
}));

jest.mock('kbar', () => ({
  useRegisterActions: jest.fn()
}));

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
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
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock hook
jest.mock('../hooks/use-booking-logic', () => ({
  useBookingLogic: jest.fn((bookings) => ({
    filteredBookings: bookings,
    rawBookings: bookings,
    totalBookings: bookings.length,
    isLoading: false,
    sortBy: 'newest',
    setSortBy: jest.fn(),
    selectedStatus: 'all',
    setSelectedStatus: jest.fn(),
    selectedPaymentStatus: 'all',
    setSelectedPaymentStatus: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    viewMode: 'grid',
    setViewMode: jest.fn(),
    handleUpdateStatus: jest.fn(),
    handleGenerateReport: jest.fn(),
    isUpdatingId: null,
    isArchived: false,
    handleToggleArchivedView: jest.fn(),
    handleToggleArchiveRecord: jest.fn(),
    currentPage: 1,
    setCurrentPage: jest.fn(),
    itemsPerPage: 10,
    setItemsPerPage: jest.fn(),
    isLoadingMore: false,
    handleLoadMore: jest.fn(),
    nextCursor: null
  }))
}));

// Mock Subcomponents
jest.mock('../components/landlord-booking-header', () => ({
  LandlordBookingHeader: () => <div data-testid="mock-header">Header</div>
}));

jest.mock('../components/landlord-booking-card', () => ({
  LandlordBookingCard: ({ booking, onViewDetails }: any) => (
    <div data-testid={`mock-card-${booking.id}`} onClick={() => onViewDetails(booking)}>
      Card: {booking.listing.title}
    </div>
  )
}));

jest.mock('../components/landlord-booking-details-modal', () => ({
  LandlordBookingDetailsModal: ({ booking, onClose }: any) => (
    <div data-testid="mock-details-modal">
      Modal: {booking.listing.title}
      <button onClick={onClose}>Close Modal</button>
    </div>
  )
}));

jest.mock('../../shared/landlord-pagination', () => ({
  LandlordPagination: () => <div data-testid="mock-pagination">Pagination</div>
}));

describe('LandlordBookings Dashboard', () => {
  const mockBooking = {
    id: 'b-1',
    listing: { id: 'l-1', title: 'Test Listing', imageSrc: '/img.jpg' },
    user: { id: 'u-1', name: 'John Doe', email: 'john@test.com' },
    status: 'CHECKED_IN',
    paymentStatus: 'paid',
    totalPrice: 1000,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  const mockProps = {
    bookings: {
      bookings: [mockBooking],
      nextCursor: null
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn()
    });
  });

  it('renders header, pagination and cards correctly', () => {
    render(<LandlordBookings {...mockProps} />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
    expect(screen.getByTestId('mock-card-b-1')).toBeInTheDocument();
    expect(screen.getByText('Card: Test Listing')).toBeInTheDocument();
  });

  it('renders empty state when no bookings', () => {
    render(<LandlordBookings bookings={{ bookings: [], nextCursor: null }} />);
    expect(screen.getByText('No bookings found')).toBeInTheDocument();
  });

  it('opens details modal when a card is clicked', () => {
    render(<LandlordBookings {...mockProps} />);
    const card = screen.getByTestId('mock-card-b-1');
    fireEvent.click(card);

    expect(screen.getByTestId('mock-details-modal')).toBeInTheDocument();
    expect(screen.getByText('Modal: Test Listing')).toBeInTheDocument();
  });

  it('opens details modal if URL query param matches', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'id' ? 'b-1' : null)
    });

    render(<LandlordBookings {...mockProps} />);
    expect(screen.getByTestId('mock-details-modal')).toBeInTheDocument();
  });

  it('closes modal when Close button is clicked', () => {
    render(<LandlordBookings {...mockProps} />);
    
    // Open modal
    fireEvent.click(screen.getByTestId('mock-card-b-1'));
    expect(screen.getByTestId('mock-details-modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('mock-details-modal')).not.toBeInTheDocument();
  });
});
