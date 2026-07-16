import { renderHook, act } from '@testing-library/react';
import { useLoadingStore } from '../use-loading-store';

describe('useLoadingStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useLoadingStore());
    act(() => {
      result.current.setIsLoading(false);
      result.current.setIsLoggingOut(false);
    });
  });

  it('initializes with false for both states', () => {
    const { result } = renderHook(() => useLoadingStore());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoggingOut).toBe(false);
  });

  it('updates isLoading state correctly', () => {
    const { result } = renderHook(() => useLoadingStore());

    act(() => {
      result.current.setIsLoading(true);
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setIsLoading(false);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('updates isLoggingOut state correctly', () => {
    const { result } = renderHook(() => useLoadingStore());

    act(() => {
      result.current.setIsLoggingOut(true);
    });
    expect(result.current.isLoggingOut).toBe(true);

    act(() => {
      result.current.setIsLoggingOut(false);
    });
    expect(result.current.isLoggingOut).toBe(false);
  });
});
