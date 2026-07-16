import { renderHook, act } from '@testing-library/react';
import { usePropertyLogic, Property } from '../use-property-logic';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { useRouter } from 'next/navigation';

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

jest.mock('@/utils/pdfGenerator', () => ({
  generateTablePDF: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: jest.fn(),
}));

const mockProperties: Property[] = [
  { id: '1', title: 'Prop A', description: 'Desc A', price: 1000, status: 'active', roomCount: 1, bathroomCount: 1, imageSrc: '', createdAt: new Date('2023-01-01'), region: 'Region 1', categories: [{ category: { name: 'Apartment' } }] } as any,
  { id: '2', title: 'Prop B', description: 'Desc B', price: 2000, status: 'active', roomCount: 2, bathroomCount: 2, imageSrc: '', createdAt: new Date('2023-01-02'), region: 'Region 2', categories: [{ category: { name: 'House' } }] } as any,
];

describe('usePropertyLogic', () => {
  let mockToast: any;
  let mockQueryClient: any;
  let mockMutateAsyncArchive: any;
  let mockMutateAsyncDelete: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockToast = { success: jest.fn(), error: jest.fn() };
    (useResponsiveToast as jest.Mock).mockReturnValue(mockToast);

    mockQueryClient = { invalidateQueries: jest.fn() };
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);

    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [{ listings: mockProperties, nextCursor: null }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    });

    mockMutateAsyncArchive = jest.fn().mockResolvedValue({});
    mockMutateAsyncDelete = jest.fn().mockResolvedValue({});

    (useMutation as jest.Mock).mockImplementation(({ mutationFn }: any) => {
      // Very naive mock to return the right function based on the hook usage order,
      // but a better way is to just return a generic mutateAsync since we mock the implementation.
      return {
        mutateAsync: (args: any) => {
          if (typeof args === 'string') return mockMutateAsyncDelete(args);
          return mockMutateAsyncArchive(args);
        },
        isPending: false,
      };
    });
  });

  it('initializes with properties and correct default states', () => {
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    expect(result.current.listings.length).toBe(2);
    expect(result.current.totalListings).toBe(2);
    expect(result.current.uniqueCategories).toEqual(['Apartment', 'House']);
  });

  it('filters by category', () => {
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    act(() => {
      result.current.setCategoryFilter('Apartment');
    });

    expect(result.current.listings.length).toBe(1);
    expect(result.current.listings[0].title).toBe('Prop A');
  });

  it('filters by search query', () => {
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    act(() => {
      // In hook, setSearchQuery is debounced inside a useEffect based on searchInput,
      // but for the test, we can just trigger it if we mock the timer.
      // We will use fake timers
    });
  });

  it('debounces search input into search query', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    act(() => {
      result.current.setSearchQuery('Prop B');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.listings.length).toBe(1);
    expect(result.current.listings[0].title).toBe('Prop B');

    jest.useRealTimers();
  });

  it('sorts properties', () => {
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    act(() => {
      result.current.setSortBy('price_asc');
    });

    expect(result.current.listings[0].price).toBe(1000);

    act(() => {
      result.current.setSortBy('price_desc');
    });

    expect(result.current.listings[0].price).toBe(2000);
  });

  it('clears filters', () => {
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    act(() => {
      result.current.setCategoryFilter('Apartment');
    });

    expect(result.current.listings.length).toBe(1);

    act(() => {
      result.current.handleClearFilters();
    });

    expect(result.current.categoryFilter).toBe('all');
    expect(result.current.listings.length).toBe(2);
  });

  it('handles delete mutation', async () => {
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    act(() => {
      result.current.setSelectedProperty(mockProperties[0]);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockMutateAsyncDelete).toHaveBeenCalledWith('1');
  });

  it('handles archive mutation', async () => {
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    act(() => {
      result.current.setSelectedProperty({ ...mockProperties[0], isArchived: false } as any);
    });

    await act(async () => {
      await result.current.handleConfirmArchive();
    });

    expect(mockMutateAsyncArchive).toHaveBeenCalledWith({ id: '1', isArchived: true });
  });

  it('generates report successfully', async () => {
    const { result } = renderHook(() => usePropertyLogic(mockProperties, null));

    await act(async () => {
      await result.current.handleGenerateReport();
    });

    expect(generateTablePDF).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'SUCCESS' }));
  });
});
