import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RightSwipePanel from '../RightSwipePanel';
import { useRouter } from 'next/navigation';
import { useMenuPanel } from '@/hooks/use-menu-panel';
import { useLoadingStore } from '@/hooks/use-loading-store';
import { useNotification } from '@/context/NotificationContext';
import { signOut } from 'next-auth/react';

// Mock Next Auth
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

// Mock hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/hooks/use-menu-panel', () => ({
  useMenuPanel: jest.fn(),
}));
jest.mock('@/hooks/use-loading-store', () => ({
  useLoadingStore: jest.fn(),
}));
jest.mock('@/context/NotificationContext', () => ({
  useNotification: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, mode, ...rest } = props;
    return <div ref={ref} {...rest} />;
  });
  Dummy.displayName = 'MotionDummy';
  
  return {
    motion: { div: Dummy, button: Dummy },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  const MockModal = ({ children, isOpen }: any) => {
    if (isOpen === false) return null;
    return <div data-testid="mock-modal-wrapper">{children}</div>;
  };
  MockModal.Trigger = ({ children, name, onClick }: any) => (
    <div data-testid={`modal-trigger-${name}`} onClick={onClick}>
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
  };
});

jest.mock('@/components/common/ConfirmModal', () => {
  return function MockConfirmModal({ onConfirm, onClose, title }: any) {
    return (
      <div data-testid="mock-confirm-modal">
        <h2>{title}</h2>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  };
});

// Mock Modals to avoid importing heavy libraries like resend (which uses TextEncoder)
jest.mock('@/components/modals/AuthModal', () => function MockAuthModal() { return <div data-testid="mock-auth-modal" />; });
jest.mock('@/components/modals/HostApplicationModal', () => function MockHostApplicationModal() { return <div data-testid="mock-host-modal" />; });

// Mock ThemeToggle
jest.mock('@/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

describe('RightSwipePanel Component', () => {
  const mockRouter = { push: jest.fn() };
  const mockOnOpen = jest.fn();
  const mockOnClose = jest.fn();
  const mockSetIsLoggingOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useMenuPanel as unknown as jest.Mock).mockReturnValue({
      isOpen: false,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
    });
    (useLoadingStore as unknown as jest.Mock).mockReturnValue({
      isLoggingOut: false,
      setIsLoggingOut: mockSetIsLoggingOut,
    });
    (useNotification as jest.Mock).mockReturnValue({
      unreadStats: { byType: {} },
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockUser = { id: 'user-1', name: 'John Doe', email: 'test@example.com' };

  it('renders swipe trigger when closed', () => {
    render(<RightSwipePanel />);
    // The panel itself is hidden, but the trigger should be rendered
    const trigger = document.querySelector('.group.cursor-pointer');
    expect(trigger).toBeInTheDocument();
    
    if (trigger) fireEvent.click(trigger);
    expect(mockOnOpen).toHaveBeenCalled();
  });

  it('renders panel content when open for unauthenticated user', () => {
    (useMenuPanel as unknown as jest.Mock).mockReturnValue({ isOpen: true, onOpen: mockOnOpen, onClose: mockOnClose });
    
    render(<RightSwipePanel />);
    
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Signup')).toBeInTheDocument();
  });

  it('renders panel content when open for authenticated user', () => {
    (useMenuPanel as unknown as jest.Mock).mockReturnValue({ isOpen: true, onOpen: mockOnOpen, onClose: mockOnClose });
    
    render(<RightSwipePanel user={mockUser as any} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('My favorites')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('handles navigation clicks and closes panel', () => {
    (useMenuPanel as unknown as jest.Mock).mockReturnValue({ isOpen: true, onOpen: mockOnOpen, onClose: mockOnClose });
    
    render(<RightSwipePanel user={mockUser as any} />);
    
    // Timer makes it interactable
    act(() => { jest.advanceTimersByTime(500); });
    
    const favBtn = screen.getByText('My favorites').closest('button');
    if (favBtn) fireEvent.click(favBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/favorites');
  });

  it('handles logout flow', () => {
    (useMenuPanel as unknown as jest.Mock).mockReturnValue({ isOpen: true, onOpen: mockOnOpen, onClose: mockOnClose });
    
    render(<RightSwipePanel user={mockUser as any} />);
    
    // Timer makes it interactable
    act(() => { jest.advanceTimersByTime(500); });
    
    const logoutBtn = screen.getByText('Logout').closest('button');
    if (logoutBtn) fireEvent.click(logoutBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
    
    // Wait for state updates
    expect(screen.getByTestId('mock-confirm-modal')).toBeInTheDocument();
    
    const confirmBtn = screen.getByText('Confirm');
    fireEvent.click(confirmBtn);
    
    expect(mockSetIsLoggingOut).toHaveBeenCalledWith(true);
    
    act(() => { jest.advanceTimersByTime(2500); });
    
    expect(signOut).toHaveBeenCalled();
  });
});
