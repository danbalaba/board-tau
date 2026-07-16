import React from 'react';
import { render, screen, act } from '@testing-library/react';
import GlobalLoadingOverlay from '../GlobalLoadingOverlay';
import { LoadingProvider, useLoading } from '../LoadingContext';
import { usePathname, useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      span: React.forwardRef(({ children, ...props }: any, ref: any) => <span ref={ref} {...props}>{children}</span>),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// A test component to trigger loading state
const TestComponent = () => {
  const { startLoading, stopLoading } = useLoading();
  return (
    <div>
      <button onClick={startLoading}>Start</button>
      <button onClick={stopLoading}>Stop</button>
    </div>
  );
};

describe('GlobalLoadingOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/home');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing initially', () => {
    render(
      <LoadingProvider>
        <GlobalLoadingOverlay />
      </LoadingProvider>
    );
    expect(screen.queryByText(/BoardTAU Syncing/i)).not.toBeInTheDocument();
  });

  it('renders overlay when loading starts', () => {
    render(
      <LoadingProvider>
        <TestComponent />
        <GlobalLoadingOverlay />
      </LoadingProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.getByText(/BoardTAU Syncing/i)).toBeInTheDocument();
  });

  it('hides overlay after minimum loading time', () => {
    const { rerender } = render(
      <LoadingProvider>
        <TestComponent />
        <GlobalLoadingOverlay />
      </LoadingProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.getByText(/BoardTAU Syncing/i)).toBeInTheDocument();

    // Trigger stop logic by simulating a path change
    (usePathname as jest.Mock).mockReturnValue('/new-page');
    
    // Rerender to apply mock change
    rerender(
      <LoadingProvider>
        <TestComponent />
        <GlobalLoadingOverlay />
      </LoadingProvider>
    );
    
    // Fast forward minimum loading time (800ms)
    act(() => {
      jest.advanceTimersByTime(800);
    });

    expect(screen.queryByText(/BoardTAU Syncing/i)).not.toBeInTheDocument();
  });

  it('triggers fail-safe timeout', () => {
    render(
      <LoadingProvider>
        <TestComponent />
        <GlobalLoadingOverlay />
      </LoadingProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.getByText(/BoardTAU Syncing/i)).toBeInTheDocument();

    // Fast forward fail-safe time (5000ms)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText(/BoardTAU Syncing/i)).not.toBeInTheDocument();
  });
});
