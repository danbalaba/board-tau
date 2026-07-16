import { renderHook, act } from '@testing-library/react';
import { useRecentStore } from '../use-recent-store';

describe('useRecentStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useRecentStore());
    act(() => {
      result.current.clearRecents();
    });
  });

  it('initializes with empty recent listings', () => {
    const { result } = renderHook(() => useRecentStore());
    expect(result.current.recentListings).toEqual([]);
  });

  it('adds a listing to recents', () => {
    const { result } = renderHook(() => useRecentStore());
    
    act(() => {
      result.current.addRecentListing({
        id: '1', title: 'Test Room', imageSrc: 'img.jpg', price: 1000, rating: 4, region: 'MNL'
      } as any);
    });

    expect(result.current.recentListings).toHaveLength(1);
    expect(result.current.recentListings[0].id).toBe('1');
    expect(result.current.recentListings[0].viewedAt).toBeDefined();
  });

  it('prevents duplicates and moves the duplicate to the front', () => {
    const { result } = renderHook(() => useRecentStore());
    
    act(() => {
      result.current.addRecentListing({ id: '1', title: 'Room 1' } as any);
      result.current.addRecentListing({ id: '2', title: 'Room 2' } as any);
      // Add room 1 again
      result.current.addRecentListing({ id: '1', title: 'Room 1' } as any);
    });

    expect(result.current.recentListings).toHaveLength(2);
    expect(result.current.recentListings[0].id).toBe('1');
    expect(result.current.recentListings[1].id).toBe('2');
  });

  it('keeps only the 20 most recent items', () => {
    const { result } = renderHook(() => useRecentStore());
    
    act(() => {
      for (let i = 1; i <= 25; i++) {
        result.current.addRecentListing({ id: i.toString(), title: `Room ${i}` } as any);
      }
    });

    expect(result.current.recentListings).toHaveLength(20);
    // The most recently added (25) should be at the front
    expect(result.current.recentListings[0].id).toBe('25');
    // The 20th item (added 6th) should be at the back
    expect(result.current.recentListings[19].id).toBe('6');
  });

  it('clears all recent listings', () => {
    const { result } = renderHook(() => useRecentStore());
    
    act(() => {
      result.current.addRecentListing({ id: '1', title: 'Test Room' } as any);
      result.current.clearRecents();
    });

    expect(result.current.recentListings).toHaveLength(0);
  });
});
