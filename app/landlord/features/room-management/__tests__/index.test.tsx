import React from 'react';
import { render, screen } from '@testing-library/react';
import RoomManagementDashboard from '../index';
import { useRoomLogic } from '../hooks/use-room-logic';

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'displayName') return 'LucideIcon';
      return () => <span data-testid={`icon-${String(prop)}`} />;
    }
  });
});

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: new Proxy({}, {
      get: (_, tag) => {
        const FakeMotionComponent = React.forwardRef(({ children, ...props }: any, ref: any) => {
          const { initial, animate, exit, transition, whileHover, whileTap, layoutId, ...validProps } = props;
          return React.createElement(tag, { ...validProps, ref }, children);
        });
        FakeMotionComponent.displayName = `MotionComponent`;
        return FakeMotionComponent;
      }
    }),
  };
});

// Mock Next Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

// Mock Next Navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('../hooks/use-room-logic');

describe('RoomManagementDashboard', () => {
  const mockRooms = [
    {
      id: 'room-1',
      name: 'Test Room 1',
      propertyTitle: 'Test Property',
      price: 15000,
      capacity: 2,
      availableSlots: 1,
      status: 'AVAILABLE',
      roomType: 'SOLO',
      images: []
    }
  ];

  const defaultMockRoomLogic = {
    rooms: mockRooms,
    totalCount: 1,
    currentPage: 1,
    setCurrentPage: jest.fn(),
    itemsPerPage: 10,
    deleteModalOpen: false,
    setDeleteModalOpen: jest.fn(),
    viewModalOpen: false,
    setViewModalOpen: jest.fn(),
    archiveModalOpen: false,
    setArchiveModalOpen: jest.fn(),
    addModalOpen: false,
    setAddModalOpen: jest.fn(),
    selectedRoom: null,
    setSelectedRoom: jest.fn(),
    isDeleting: false,
    isArchiving: false,
    sortBy: 'newest',
    setSortBy: jest.fn(),
    viewMode: 'grid',
    setViewMode: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    propertyFilter: 'all',
    setPropertyFilter: jest.fn(),
    typeFilter: 'all',
    setTypeFilter: jest.fn(),
    capacityFilter: 'all',
    setCapacityFilter: jest.fn(),
    isArchived: false,
    setIsArchived: jest.fn(),
    uniqueProperties: [],
    uniqueCapacities: [],
    hasMore: false,
    isLoadingMore: false,
    handleLoadMore: jest.fn(),
    isLoading: false,
    handleConfirmDelete: jest.fn(),
    handleGenerateReport: jest.fn(),
    handleClearFilters: jest.fn(),
    handleConfirmArchive: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoomLogic as jest.Mock).mockReturnValue(defaultMockRoomLogic);
  });

  it('renders the dashboard header and search', () => {
    render(<RoomManagementDashboard initialData={{ rooms: mockRooms as any, nextCursor: null }} />);
    expect(screen.getByText(/Rooms/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search rooms.../i)).toBeInTheDocument();
  });

  it('renders the room list', () => {
    render(<RoomManagementDashboard initialData={{ rooms: mockRooms as any, nextCursor: null }} />);
    expect(screen.getByText(/Test Room 1/i)).toBeInTheDocument();
  });

  it('renders empty state when no rooms match', () => {
    (useRoomLogic as jest.Mock).mockReturnValue({
      ...defaultMockRoomLogic,
      rooms: [],
      totalCount: 0,
      isLoading: false,
    });
    
    render(<RoomManagementDashboard initialData={{ rooms: [], nextCursor: null }} />);
    expect(screen.getByText(/No units found/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear filters/i)).toBeInTheDocument();
  });
});
