import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from '../use-debounced-callback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should delay the execution of the callback', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

    result.current('test args');
    
    // Callback should not be called immediately
    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    // Should be called with the exact arguments after delay
    expect(mockCallback).toHaveBeenCalledWith('test args');
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer if called again before the delay completes', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

    result.current('first call');

    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Call again before timer finishes
    result.current('second call');

    act(() => {
      jest.advanceTimersByTime(300); // 600ms total, but 300ms since last call
    });
    
    // Still not called because the second call reset the timer
    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200); // Completes the 500ms since the *second* call
    });

    // Should only be called once, with the latest arguments
    expect(mockCallback).toHaveBeenCalledWith('second call');
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending timeouts on unmount', () => {
    const mockCallback = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(mockCallback, 500));

    result.current('test');

    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    // Unmount the component before the timer finishes
    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Callback should never execute because it was cleared on unmount
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
