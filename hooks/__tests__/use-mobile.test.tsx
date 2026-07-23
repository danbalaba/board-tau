import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  let mockAddEventListener: jest.Mock;
  let mockRemoveEventListener: jest.Mock;

  beforeEach(() => {
    mockAddEventListener = jest.fn();
    mockRemoveEventListener = jest.fn();
    
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true when window.innerWidth is less than 1024 on initial mount', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false when window.innerWidth is greater than or equal to 1024 on initial mount', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('updates state when the resize event fires', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    const resizeHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'resize')[1];

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
      resizeHandler();
    });

    expect(result.current).toBe(true);
  });

  it('cleans up the event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    const resizeHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'resize')[1];
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', resizeHandler);
  });
});
