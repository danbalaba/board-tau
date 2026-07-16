import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection';

// Mock next/navigation for any deeper dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(() => [])
  }))
}));

// Mock SearchManager to keep this test focused purely on HeroSection
jest.mock('@/components/navbar/SearchManager', () => {
  return function MockSearchManager() {
    return <div data-testid="search-manager">Search Manager Mock</div>;
  };
});

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      h1: React.forwardRef(({ children, ...props }: any, ref: any) => <h1 ref={ref} {...props}>{children}</h1>),
      p: React.forwardRef(({ children, ...props }: any, ref: any) => <p ref={ref} {...props}>{children}</p>),
      span: React.forwardRef(({ children, ...props }: any, ref: any) => <span ref={ref} {...props}>{children}</span>),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useScroll: () => ({ scrollY: { on: jest.fn() } }),
    useTransform: () => ({}),
  };
});

describe('HeroSection', () => {
  it('renders hero content and search manager correctly', () => {
    render(<HeroSection />);
    
    // Check for main headline
    expect(screen.getByText(/Find your perfect boarding house/i)).toBeInTheDocument();
    
    // Check for subtitle
    expect(screen.getByText(/Discover comfortable and affordable accommodations/i)).toBeInTheDocument();
    
    // Check that SearchManager is embedded
    expect(screen.getByTestId('search-manager')).toBeInTheDocument();
  });
});
