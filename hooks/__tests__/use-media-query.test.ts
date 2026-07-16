import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '../use-media-query';

describe('useMediaQuery', () => {
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
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
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

  it('returns the initial match state correctly', () => {
    // Setup initial state as matching
    mockMatchMedia.mockImplementation((query) => ({
      matches: true,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }));

    const { result } = renderHook(() => useMediaQuery());
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)');
    expect(result.current.isOpen).toBe(true);
  });

  it('updates state when the media query change event fires', () => {
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isOpen).toBe(false);

    // Grab the event listener that the hook registered
    const listener = mockAddEventListener.mock.calls[0][1];

    // Simulate the media query changing to true
    act(() => {
      listener({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery());

    const listener = mockAddEventListener.mock.calls[0][1];
    
    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', listener);
  });
});
