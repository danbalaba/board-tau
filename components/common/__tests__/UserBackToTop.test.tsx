import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import UserBackToTop from '../UserBackToTop';

// Mock framer-motion to simplify testing
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('UserBackToTop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
    // Reset scrollY
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  it('is not visible initially when scroll is less than 400', () => {
    render(<UserBackToTop />);
    expect(screen.queryByRole('button', { name: /back to top/i })).not.toBeInTheDocument();
  });

  it('becomes visible when window is scrolled past 400', () => {
    render(<UserBackToTop />);
    
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    
    expect(screen.getByRole('button', { name: /back to top/i })).toBeInTheDocument();
  });

  it('hides when window is scrolled back up', () => {
    render(<UserBackToTop />);
    
    // Scroll down
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    
    expect(screen.getByRole('button', { name: /back to top/i })).toBeInTheDocument();
    
    // Scroll up
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    
    expect(screen.queryByRole('button', { name: /back to top/i })).not.toBeInTheDocument();
  });

  it('calls window.scrollTo when clicked', () => {
    render(<UserBackToTop />);
    
    // Scroll down to show button
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    
    const button = screen.getByRole('button', { name: /back to top/i });
    fireEvent.click(button);
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('cleans up scroll listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<UserBackToTop />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
