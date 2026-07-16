import { renderHook } from '@testing-library/react';
import { useCallbackRef } from '../use-callback-ref';

describe('useCallbackRef', () => {
  it('should return a stable function reference', () => {
    const callback1 = jest.fn();
    const { result, rerender } = renderHook(({ cb }) => useCallbackRef(cb), {
      initialProps: { cb: callback1 }
    });

    const stableFn = result.current;

    // Call it
    stableFn('test');
    expect(callback1).toHaveBeenCalledWith('test');

    // Update callback
    const callback2 = jest.fn();
    rerender({ cb: callback2 });

    // Reference should be exactly the same
    expect(result.current).toBe(stableFn);

    // But it should call the new callback
    stableFn('test2');
    expect(callback2).toHaveBeenCalledWith('test2');
    expect(callback1).not.toHaveBeenCalledWith('test2');
  });

  it('should handle undefined callback safely', () => {
    const { result } = renderHook(() => useCallbackRef(undefined));
    // Should not throw when calling the ref with no callback
    expect(() => result.current()).not.toThrow();
  });
});
