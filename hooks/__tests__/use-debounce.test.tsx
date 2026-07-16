import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should update the value only after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });

    // Value should still be 'initial' before the delay
    expect(result.current).toBe('initial');

    // Fast-forward time by 499ms
    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    // Fast-forward time by 1ms (total 500ms)
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset the timer if the value changes before the delay completes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Update to 'first change'
    rerender({ value: 'first change', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(300); // Wait 300ms
    });
    expect(result.current).toBe('initial');

    // Update to 'second change' before the first 500ms finishes
    rerender({ value: 'second change', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(300); // Wait another 300ms (Total 600ms since first change)
    });
    // Still initial because the second change reset the 500ms timer
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(200); // Finish the remaining 200ms of the second timer
    });
    expect(result.current).toBe('second change');
  });
});
