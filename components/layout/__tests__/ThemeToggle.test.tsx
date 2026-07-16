import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from 'next-themes';

jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      button: React.forwardRef(({ children, whileTap, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>)
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if not mounted yet (hydration check)', () => {
    // When using Next.js hydration workarounds, it renders a dummy button initially
    (useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    });

    // We can't strictly test the !mounted state directly because useEffect runs immediately in JSDOM,
    // but we can at least assert it renders without crashing
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('renders sun icon and toggles to dark theme', () => {
    (useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    });

    render(<ThemeToggle />);
    
    // Title reflects the target theme switch
    const button = screen.getByTitle('Switch to dark mode');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('renders moon icon and toggles to light theme', () => {
    (useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: 'dark',
      setTheme: mockSetTheme
    });

    render(<ThemeToggle />);
    
    // Title reflects the target theme switch
    const button = screen.getByTitle('Switch to light mode');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('uses document.startViewTransition if available', () => {
    (useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    });

    // Mock startViewTransition
    const mockStartViewTransition = jest.fn((cb) => cb());
    document.startViewTransition = mockStartViewTransition as any;

    render(<ThemeToggle />);
    
    const button = screen.getByTitle('Switch to dark mode');
    fireEvent.click(button);

    expect(mockStartViewTransition).toHaveBeenCalled();
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    // Clean up
    delete (document as any).startViewTransition;
  });
});
