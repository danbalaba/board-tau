import { renderHook } from '@testing-library/react';
import { useSearchSummary } from '../useSearchSummary';
import { useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/data/colleges', () => ({
  colleges: [
    { value: 'col1', label: 'College One' },
  ],
}));

describe('useSearchSummary', () => {
  const mockUseSearchParams = useSearchParams as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockSearchParams = (params: Record<string, string | string[]>) => {
    return {
      get: (key: string) => {
        const val = params[key];
        return Array.isArray(val) ? val[0] : (val || null);
      },
      getAll: (key: string) => {
        const val = params[key];
        return Array.isArray(val) ? val : (val ? [val] : []);
      }
    };
  };

  it('returns default labels when no params are provided', () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

    const { result } = renderHook(() => useSearchSummary());

    expect(result.current.locationLabel).toBe('Near TAU');
    expect(result.current.categoryLabel).toBe('Any category');
    expect(result.current.priceLabel).toBe('Any price');
    expect(result.current.roomTypeLabel).toBe('Any room');
    expect(result.current.occupantLabel).toBe('Occupants');
  });

  it('formats location label correctly', () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({
      college: 'col1',
      distance: '5'
    }));

    const { result } = renderHook(() => useSearchSummary());
    expect(result.current.locationLabel).toBe('Near College One · ≤ 5 km');
  });

  it('formats category label for single category', () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({
      categories: ['Apartment']
    }));

    const { result } = renderHook(() => useSearchSummary());
    expect(result.current.categoryLabel).toBe('Apartment');
  });

  it('formats category label for multiple categories', () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({
      categories: ['Apartment', 'Dormitory']
    }));

    const { result } = renderHook(() => useSearchSummary());
    expect(result.current.categoryLabel).toBe('2 categories');
  });

  it('formats price label correctly', () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({
      minPrice: '1000',
      maxPrice: '5000'
    }));

    const { result } = renderHook(() => useSearchSummary());
    expect(result.current.priceLabel).toBe('₱1000–5000 / mo');
  });

  it('formats roomType label correctly', () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({
      roomType: 'Solo'
    }));

    const { result } = renderHook(() => useSearchSummary());
    expect(result.current.roomTypeLabel).toBe('Solo');
  });

  it('formats occupant label correctly', () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({
      guestCount: '2'
    }));

    const { result } = renderHook(() => useSearchSummary());
    expect(result.current.occupantLabel).toBe('2 occupants');
  });
});
