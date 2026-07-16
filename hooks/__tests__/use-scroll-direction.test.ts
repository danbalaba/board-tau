import { renderHook, act } from '@testing-library/react';
import { useScrollDirection } from '../use-scroll-direction';

describe('useScrollDirection', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
  });

  it('initializes with empty direction', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBe('');
  });

  it('updates direction to down when scrolling down', () => {
    const { result } = renderHook(() => useScrollDirection());

    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('down');
  });

  it('updates direction to up when scrolling up', () => {
    const { result } = renderHook(() => useScrollDirection());

    act(() => {
      // Scroll down first
      window.scrollY = 200;
      window.dispatchEvent(new Event('scroll'));
    });
    
    expect(result.current).toBe('down');

    act(() => {
      // Scroll up slightly
      window.scrollY = 150;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('up');
  });

  it('resets direction to empty when scrolled to very top', () => {
    const { result } = renderHook(() => useScrollDirection());

    act(() => {
      // Scroll down first
      window.scrollY = 100;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('down');

    act(() => {
      // Scroll up to exactly 0 (top of page)
      window.scrollY = 0;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('');
  });
});
