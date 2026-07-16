import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NavbarClient from '../NavbarClient';
import { usePathname } from 'next/navigation';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, ...rest } = props;
    return <div ref={ref} {...rest} />;
  });
  Dummy.displayName = 'MotionDummy';
  return {
    motion: {
      div: Dummy,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock child components
jest.mock('../Logo', () => () => <div data-testid="logo">Logo</div>);
jest.mock('../UserMenu', () => () => <div data-testid="user-menu">UserMenu</div>);
jest.mock('../NotificationBell', () => () => <div data-testid="notification-bell">NotificationBell</div>);
jest.mock('../../layout/ThemeToggle', () => ({ ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div> }));
jest.mock('../Search', () => () => <div data-testid="desktop-search">Search</div>);
jest.mock('../MobileSearch', () => () => <div data-testid="mobile-search">MobileSearch</div>);

describe('NavbarClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly on home page', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<NavbarClient />);
    
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-search')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-search')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('renders correctly on non-home page (hides search)', () => {
    (usePathname as jest.Mock).mockReturnValue('/some-other-page');
    render(<NavbarClient />);
    
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-search')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-search')).not.toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('applies scrolled classes when window is scrolled', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    const { container } = render(<NavbarClient />);
    
    // Initially not scrolled (transparent)
    expect(container.querySelector('header')).toHaveClass('bg-transparent');

    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event('scroll'));
    });

    // Should apply scrolled classes
    expect(container.querySelector('header')).toHaveClass('bg-white/72');
  });
});
