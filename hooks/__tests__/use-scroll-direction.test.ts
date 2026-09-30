import { renderHook, act } from '@testing-library/react';
import { useScrollDirection } from '../use-scroll-direction';

describe('useScrollDirection', () => {
  let frameCallbacks: FrameRequestCallback[] = [];

  beforeEach(() => {
    frameCallbacks = [];
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      frameCallbacks.push(cb);
      return 0;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const triggerScroll = (y: number) => {
    act(() => {
      window.scrollY = y;
      window.dispatchEvent(new Event('scroll'));
      const cbs = [...frameCallbacks];
      frameCallbacks = [];
      cbs.forEach(cb => cb(performance.now()));
    });
  };

  it('initializes with empty direction', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBe('');
  });

  it('updates direction to down when scrolling down', () => {
    const { result } = renderHook(() => useScrollDirection());

    triggerScroll(100);

    expect(result.current).toBe('down');
  });

  it('updates direction to up when scrolling up', () => {
    const { result } = renderHook(() => useScrollDirection());

    triggerScroll(200);
    expect(result.current).toBe('down');

    triggerScroll(150);
    expect(result.current).toBe('up');
  });

  it('resets direction to empty when scrolled to very top', () => {
    const { result } = renderHook(() => useScrollDirection());

    triggerScroll(100);
    expect(result.current).toBe('down');

    triggerScroll(0);
    expect(result.current).toBe('');
  });
});
