import React from 'react';
import { render, screen, act } from '@testing-library/react';
import UltimateLogoutOverlay from '../UltimateLogoutOverlay';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, whileTap, whileHover, layoutId, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, whileTap, whileHover, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('UltimateLogoutOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with username and shows portal content', () => {
    render(<UltimateLogoutOverlay userName="John Doe" />);
    
    // It should extract the first name
    expect(screen.getByText(/See you soon,/)).toHaveTextContent('See you soon, John');
    expect(screen.getByText('Board')).toBeInTheDocument();
    expect(screen.getByText('TAU')).toBeInTheDocument();
  });

  it('renders correctly with no username', () => {
    render(<UltimateLogoutOverlay />);
    
    expect(screen.getByText(/See you soon,/)).toHaveTextContent('See you soon, User');
  });

  it('updates progress over time', () => {
    render(<UltimateLogoutOverlay />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(250); // 1 tick
    });
    
    expect(screen.getByText('1%')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(25000); // Many ticks
    });
    
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
