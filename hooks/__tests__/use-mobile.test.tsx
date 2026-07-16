import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  let mockMatchMedia: jest.Mock;
  let mockAddEventListener: jest.Mock;
  let mockRemoveEventListener: jest.Mock;

  beforeEach(() => {
    mockAddEventListener = jest.fn();
    mockRemoveEventListener = jest.fn();
    
    mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true when window.innerWidth is less than 768 on initial mount', () => {
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('returns false when window.innerWidth is greater than or equal to 768 on initial mount', () => {
    // Mock desktop width
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('updates state when the media query change event fires', () => {
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Get the change handler attached by the hook
    const changeHandler = mockAddEventListener.mock.calls[0][1];

    // Simulate resizing window to mobile and firing the event
    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
      changeHandler();
    });

    expect(result.current).toBe(true);
  });

  it('cleans up the event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    
    const changeHandler = mockAddEventListener.mock.calls[0][1];
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', changeHandler);
  });
});
