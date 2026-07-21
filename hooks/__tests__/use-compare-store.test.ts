import { renderHook, act } from '@testing-library/react';
import { useCompareStore } from '../use-compare-store';

describe('useCompareStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCompareStore());
    act(() => {
      result.current.clearListings();
    });
  });

  it('initializes with an empty selected listings array', () => {
    const { result } = renderHook(() => useCompareStore());
    expect(result.current.selectedListingIds).toEqual([]);
  });

  it('adds a listing ID to the store', () => {
    const { result } = renderHook(() => useCompareStore());

    act(() => {
      result.current.addListing('listing_1');
    });

    expect(result.current.selectedListingIds).toEqual(['listing_1']);
  });

  it('does not add duplicate listing IDs', () => {
    const { result } = renderHook(() => useCompareStore());

    act(() => {
      result.current.addListing('listing_1');
      result.current.addListing('listing_1');
    });

    expect(result.current.selectedListingIds).toEqual(['listing_1']);
  });

  it('limits the maximum number of listings to 3 (drops oldest)', () => {
    const { result } = renderHook(() => useCompareStore());

    act(() => {
      result.current.addListing('listing_1');
      result.current.addListing('listing_2');
      result.current.addListing('listing_3');
      result.current.addListing('listing_4'); // Should drop listing_1
    });

    expect(result.current.selectedListingIds).toEqual([
      'listing_2',
      'listing_3',
      'listing_4'
    ]);
  });

  it('removes a specific listing ID', () => {
    const { result } = renderHook(() => useCompareStore());

    act(() => {
      result.current.addListing('listing_1');
      result.current.addListing('listing_2');
      result.current.removeListing('listing_1');
    });

    expect(result.current.selectedListingIds).toEqual(['listing_2']);
  });

  it('clears all listings', () => {
    const { result } = renderHook(() => useCompareStore());

    act(() => {
      result.current.addListing('listing_1');
      result.current.addListing('listing_2');
      result.current.clearListings();
    });

    expect(result.current.selectedListingIds).toEqual([]);
  });
});
