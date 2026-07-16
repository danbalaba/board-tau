import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Search from '../Search';
import { useSearchSummary } from '@/hooks/useSearchSummary';
import { ThemeProvider } from 'next-themes';
import { ModalContext } from '@/components/modals/Modal';

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
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock useSearchSummary hook
jest.mock('@/hooks/useSearchSummary', () => ({
  useSearchSummary: jest.fn(),
}));

// Mock SearchModal (dynamic import)
jest.mock('@/components/modals/SearchModal', () => {
  return function MockSearchModal() {
    return <div data-testid="search-modal">SearchModal Content</div>;
  };
});

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, layoutId, ...rest } = props;
    return <div ref={ref} {...rest} />;
  });
  Dummy.displayName = 'MotionDummy';
  
  const ButtonDummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, layoutId, ...rest } = props;
    return <button ref={ref} {...rest} />;
  });
  
  return {
    motion: {
      div: Dummy,
      button: ButtonDummy,
    },
  };
});

// Mock Modal Component Suite
jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  
  const MockModal = ({ children }: any) => {
    return <div data-testid="modal-provider">{children}</div>;
  };
  
  MockModal.Trigger = ({ children, name }: any) => (
    <div data-testid={`modal-trigger-${name}`} onClick={() => {}}>
      {children}
    </div>
  );
  
  MockModal.Window = ({ children, name }: any) => (
    <div data-testid={`modal-window-${name}`}>
      {children}
    </div>
  );
  
  return {
    __esModule: true,
    default: MockModal,
    ModalContext: React.createContext({ open: jest.fn(), close: jest.fn(), openName: '' }),
  };
});

describe('Search Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchSummary as jest.Mock).mockReturnValue({
      locationLabel: 'Anywhere',
      priceLabel: 'Any week',
      roomTypeLabel: 'Add Guests',
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider attribute="class">
        {ui}
      </ThemeProvider>
    );
  };

  it('renders default compact search correctly', () => {
    renderWithProviders(<Search compact={true} />);
    
    expect(screen.getByText('Anywhere')).toBeInTheDocument();
    expect(screen.getByText('Any week')).toBeInTheDocument();
    expect(screen.getByText('Add Guests')).toBeInTheDocument();
    
    // Check if modal components are present
    expect(screen.getByTestId('modal-trigger-search')).toBeInTheDocument();
  });

  it('renders full non-compact search correctly', () => {
    renderWithProviders(<Search compact={false} />);
    
    // The mobile view has 'Search for boarding houses'
    const searchTexts = screen.getAllByText('Search for boarding houses');
    expect(searchTexts.length).toBeGreaterThan(0);
    
    // The desktop view uses the search summary labels
    expect(screen.getAllByText('Anywhere').length).toBeGreaterThan(0);
  });
});
