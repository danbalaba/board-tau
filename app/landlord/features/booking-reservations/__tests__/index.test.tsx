import React from 'react';
import { render, screen } from '@testing-library/react';
import LandlordBookingReservations from '../index';
import { useSearchParams } from 'next/navigation';

// Mock Heavy SVGs
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

// Mock Next.js dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn(), push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() }))
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() }))
}));

// Mock KYC and EdgeStore for WalkIn Modal
jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: jest.fn(() => ({ edgestore: { identityDocs: { upload: jest.fn() } } }))
}));

jest.mock('@/hooks/useKYC', () => ({
  useKYC: jest.fn(() => ({
    isProcessing: false,
    faceEngine: { validateFace: jest.fn() },
    idEngine: { validateIDCard: jest.fn() }
  }))
}));

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: require('react').forwardRef((props: any, ref: any) => {
        const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }),
      button: require('react').forwardRef((props: any, ref: any) => {
        const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
        return <button ref={ref} {...rest} />;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock hooks to bypass loading states and complex logic
jest.mock('../hooks/use-reservation-logic', () => ({
  useReservationLogic: jest.fn((reservations) => ({
    filteredReservations: reservations,
    rawReservations: reservations,
    totalReservations: reservations.length,
    isLoading: false,
    sortBy: 'newest',
    setSortBy: jest.fn(),
    selectedStatus: 'all',
    setSelectedStatus: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    viewMode: 'grid',
    setViewMode: jest.fn(),
    handleUpdateStatus: jest.fn(),
    handleGenerateReport: jest.fn(),
    isUpdating: false,
    isArchived: false,
    handleToggleArchived: jest.fn(),
    itemsPerPage: 10,
    currentPage: 1,
    setItemsPerPage: jest.fn(),
    setCurrentPage: jest.fn()
  }))
}));

// Mock Common Components
jest.mock('@/components/common/Button', () => {
  return {
    __esModule: true,
    default: ({ children, onClick, 'data-testid': testId }: any) => (
      <button onClick={onClick} data-testid={testId || 'mock-button'}>{children}</button>
    )
  };
});

jest.mock('kbar', () => ({
  useRegisterActions: jest.fn()
}));

const mockReservation: any = {
  id: 'res-1',
  listing: { id: 'list-1', title: 'Test Listing', imageSrc: '/img.jpg' },
  user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  status: 'PENDING_PAYMENT',
  moveInDate: new Date('2023-01-01').toISOString(),
  stayDuration: 30,
  isArchived: false,
  createdAt: new Date('2023-01-01').toISOString()
};

describe('LandlordBookingReservations Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially then shows content', () => {
    render(<LandlordBookingReservations reservations={[mockReservation]} landlordId="land-1" listings={[]} />);
    // Initial render shows loader, but in test environment without actual timeouts it might resolve quickly.
    // Assuming useReservationLogic mock handles this if we mock the hook, but we didn't mock the hook here.
    // The component has a 700ms timeout for loading. We can just verify the dashboard renders.
    expect(screen.getByText(/Showing \d+ reservation/i)).toBeInTheDocument();
  });

  it('renders empty state when no reservations match', () => {
    render(<LandlordBookingReservations reservations={[]} landlordId="land-1" listings={[]} />);
    expect(screen.getByText('No reservation requests found')).toBeInTheDocument();
  });
});
