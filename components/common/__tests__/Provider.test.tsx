import React from 'react';
import { render, screen } from '@testing-library/react';
import Providers from '../Provider';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({
    invalidateQueries: jest.fn(),
  })),
  QueryClientProvider: ({ children }: any) => <div data-testid="query-provider">{children}</div>,
}));

jest.mock('@/lib/edgestore', () => ({
  EdgeStoreProvider: ({ children }: any) => <div data-testid="edge-store-provider">{children}</div>,
}));

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: any) => <div data-testid="session-provider">{children}</div>,
  useSession: () => ({ status: 'unauthenticated', data: null }),
}));

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock('@/components/loading/LoadingContext', () => ({
  LoadingProvider: ({ children }: any) => <div data-testid="loading-provider">{children}</div>,
}));

jest.mock('../ResponsiveToast', () => ({
  ResponsiveToastProvider: ({ children }: any) => <div data-testid="responsive-toast-provider">{children}</div>,
}));

jest.mock('nuqs/adapters/next/app', () => ({
  NuqsAdapter: ({ children }: any) => <div data-testid="nuqs-adapter">{children}</div>,
}));

jest.mock('@/context/NotificationContext', () => ({
  NotificationProvider: ({ children }: any) => <div data-testid="notification-provider">{children}</div>,
}));

describe('Providers', () => {
  it('renders all providers and children correctly', () => {
    render(
      <Providers>
        <div data-testid="child-component">Test Child</div>
      </Providers>
    );

    expect(screen.getByTestId('loading-provider')).toBeInTheDocument();
    expect(screen.getByTestId('nuqs-adapter')).toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('edge-store-provider')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-toast-provider')).toBeInTheDocument();
    expect(screen.getByTestId('notification-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('removes light class from root element on mount', () => {
    // Setup initial class
    document.documentElement.classList.add('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);

    render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    );

    // Should have been removed
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
});
