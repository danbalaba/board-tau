import { renderHook, act } from '@testing-library/react';
import { useReviewLogic } from '../use-review-logic';

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('useReviewLogic', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useReviewLogic([], null));
    
    expect(result.current.filteredReviews).toEqual([]);
    expect(result.current.totalReviews).toBe(0);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.itemsPerPage).toBe(10);
  });

  it('filters reviews based on search query', () => {
    const mockReviews = [
      { id: '1', user: { name: 'Alice', email: 'alice@test.com' }, listing: { title: 'Room A' }, rating: 5, status: 'approved' },
      { id: '2', user: { name: 'Bob', email: 'bob@test.com' }, listing: { title: 'Room B' }, rating: 4, status: 'pending' },
    ] as any;

    const { result } = renderHook(() => useReviewLogic(mockReviews, null));
    
    act(() => {
      result.current.setSearchQuery('Alice');
    });

    expect(result.current.filteredReviews.length).toBe(1);
    expect(result.current.filteredReviews[0].id).toBe('1');
  });
});
