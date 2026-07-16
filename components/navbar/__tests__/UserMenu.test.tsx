import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import UserMenu from '../UserMenu';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/loading/LoadingContext';
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
jest.mock('@/components/loading/LoadingContext', () => ({
  useLoading: jest.fn(),
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

// Mock components
jest.mock('@/components/common/Menu', () => {
  const Menu = ({ children }: any) => <div data-testid="mock-menu">{children}</div>;
  Menu.Toggle = ({ children }: any) => <div data-testid="mock-menu-toggle">{children}</div>;
  Menu.List = ({ children }: any) => <div data-testid="mock-menu-list">{children}</div>;
  Menu.Button = ({ children, onClick, className }: any) => <button data-testid="mock-menu-button" onClick={onClick} className={className}>{children}</button>;
  return Menu;
});

jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  const MockModal = ({ children, isOpen }: any) => {
    if (isOpen === false) return null;
    return <div data-testid="mock-modal-wrapper">{children}</div>;
  };
  MockModal.Trigger = ({ children }: any) => <div data-testid="mock-modal-trigger">{children}</div>;
  MockModal.Window = ({ children }: any) => <div data-testid="mock-modal-window">{children}</div>;
  return {
    __esModule: true,
    default: MockModal,
    ModalContext: React.createContext({}),
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

// Mock Modals to avoid importing heavy libraries like resend/jose
jest.mock('@/components/modals/AuthModal', () => function MockAuthModal() { return <div data-testid="mock-auth-modal" />; });
jest.mock('@/components/modals/HostApplicationModal', () => function MockHostApplicationModal() { return <div data-testid="mock-host-modal" />; });

// Avoid next/image issues
jest.mock('next/image', () => ({
  __esModule: true,
  default: () => <img alt="mocked-image" />,
}));

describe('UserMenu Component', () => {
  const mockRouter = { push: jest.fn() };
  const mockStartLoading = jest.fn();
  const mockOnOpen = jest.fn();
  const mockSetIsLoggingOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLoading as jest.Mock).mockReturnValue({ startLoading: mockStartLoading });
    (useMenuPanel as unknown as jest.Mock).mockReturnValue({ onOpen: mockOnOpen });
    (useLoadingStore as unknown as jest.Mock).mockReturnValue({
      isLoggingOut: false,
      setIsLoggingOut: mockSetIsLoggingOut,
    });
    (useNotification as jest.Mock).mockReturnValue({
      unreadStats: { byType: { inquiry: 2, message: 1 } },
    });
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
  };

  it('renders correctly for unauthenticated users', () => {
    render(<UserMenu />);
    
    // Should render the Login trigger
    expect(screen.getByText('Log in')).toBeInTheDocument();
    // Does not render user info
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('renders correctly for authenticated users', () => {
    render(<UserMenu user={mockUser as any} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('filters menu items based on role (admin)', () => {
    const adminUser = { ...mockUser, role: 'admin' };
    render(<UserMenu user={adminUser as any} />);
    
    // Should render Admin link
    expect(screen.getByText('Admin')).toBeInTheDocument();
    // Should NOT render student links like My Inquiries
    expect(screen.queryByText('My Inquiries')).not.toBeInTheDocument();
  });

  it('handles navigation correctly', () => {
    render(<UserMenu user={mockUser as any} />);
    
    const favoritesLink = screen.getByText('My favorites');
    fireEvent.click(favoritesLink);
    
    expect(mockStartLoading).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/favorites');
  });

  it('handles logout flow with confirmation', () => {
    render(<UserMenu user={mockUser as any} />);
    
    const logoutLink = screen.getByText('Log out');
    fireEvent.click(logoutLink);
    
    // Should open the confirmation modal
    expect(screen.getByTestId('mock-confirm-modal')).toBeInTheDocument();
    expect(screen.getByText('Sign Out?')).toBeInTheDocument();
    
    // Click confirm
    const confirmBtn = screen.getByText('Confirm');
    fireEvent.click(confirmBtn);
    
    expect(mockSetIsLoggingOut).toHaveBeenCalledWith(true);
    
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('opens mobile menu panel when clicked on small screens', () => {
    // Mock window innerWidth
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    
    render(<UserMenu user={mockUser as any} />);
    
    const menuToggle = screen.getByTestId('mock-menu-toggle').firstChild as HTMLElement;
    fireEvent.click(menuToggle);
    
    expect(mockOnOpen).toHaveBeenCalled();
  });
});
