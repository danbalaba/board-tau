import { renderHook, act } from '@testing-library/react';
import { useRoomLogic, Room } from '../use-room-logic';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock('@/utils/pdfGenerator', () => ({
  generateTablePDF: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: () => ({
    data: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  }),
  useMutation: (options: any) => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
  }),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Room 101',
    propertyId: 'prop-1',
    propertyTitle: 'Test Property',
    price: 5000,
    capacity: 2,
    availableSlots: 2,
    status: 'AVAILABLE',
    roomType: 'SOLO',
    bedCount: 1,
    reservationFee: 1000,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
  },
  {
    id: 'room-2',
    name: 'Room 102',
    propertyId: 'prop-2',
    propertyTitle: 'Test Property 2',
    price: 8000,
    capacity: 4,
    availableSlots: 4,
    status: 'AVAILABLE',
    roomType: 'BEDSPACE',
    bedCount: 2,
    reservationFee: 1000,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: true,
  }
];

describe('useRoomLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useRoomLogic(mockRooms, null));
    expect(result.current.rooms.length).toBe(1); // Only active rooms shown by default
    expect(result.current.totalCount).toBe(1);
  });

  it('filters by archived status', () => {
    const { result } = renderHook(() => useRoomLogic(mockRooms, null));
    act(() => {
      result.current.setIsArchived(true);
    });
    expect(result.current.rooms.length).toBe(1);
    expect(result.current.rooms[0].name).toBe('Room 102');
  });

  it('handles search input with debounce', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useRoomLogic(mockRooms, null));
    act(() => {
      result.current.setSearchQuery('Room');
    });
    expect(result.current.searchQuery).toBe('Room');
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // In actual app, filtering happens on the server with useInfiniteQuery,
    // so we just verify the state updated.
    jest.useRealTimers();
  });

  it('toggles view mode', () => {
    const { result } = renderHook(() => useRoomLogic(mockRooms, null));
    expect(result.current.viewMode).toBe('grid');
    act(() => {
      result.current.setViewMode('list');
    });
    expect(result.current.viewMode).toBe('list');
  });

  it('clears filters', () => {
    const { result } = renderHook(() => useRoomLogic(mockRooms, null));
    act(() => {
      result.current.setPropertyFilter('prop-2');
      result.current.setTypeFilter('SOLO');
    });
    expect(result.current.propertyFilter).toBe('prop-2');
    expect(result.current.typeFilter).toBe('SOLO');
    
    act(() => {
      result.current.handleClearFilters();
    });
    
    expect(result.current.propertyFilter).toBe('all');
    expect(result.current.typeFilter).toBe('all');
  });
});
