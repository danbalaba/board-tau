import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProfileClient from '../ProfileClient';
import { updateUserProfileClient } from '@/services/client/profile.client';
import { signOut } from 'next-auth/react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useLoadingStore } from '@/hooks/use-loading-store';
import { useRouter } from 'next/navigation';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

jest.mock('@/services/client/profile.client', () => ({
  updateUserProfileClient: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

jest.mock('@/hooks/use-loading-store', () => ({
  useLoadingStore: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/modals/EditProfileModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onUpdate }: any) => isOpen ? (
    <div data-testid="edit-modal">
      <button onClick={onClose}>Close Edit</button>
      <button onClick={() => onUpdate({ name: 'Updated Name' })}>Save Edit</button>
    </div>
  ) : null,
}));

jest.mock('@/components/modals/ChangePasswordModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) => isOpen ? (
    <div data-testid="password-modal">
      <button onClick={onClose}>Close Password</button>
    </div>
  ) : null,
}));

jest.mock('@/components/modals/ChangeProfileImageModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onUpdate }: any) => isOpen ? (
    <div data-testid="image-modal">
      <button onClick={onClose}>Close Image</button>
      <button onClick={() => onUpdate('new-image.jpg').catch(() => {})}>Save Image</button>
    </div>
  ) : null,
}));

jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

describe('ProfileClient Component', () => {
  const mockProfile = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: 'test.jpg',
    hasPassword: true,
  };

  const mockRouterRefresh = jest.fn();
  const mockSuccess = jest.fn();
  const mockError = jest.fn();
  const mockSetIsLoggingOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useRouter as jest.Mock).mockReturnValue({ refresh: mockRouterRefresh });
    (useResponsiveToast as jest.Mock).mockReturnValue({ success: mockSuccess, error: mockError });
    (useLoadingStore as unknown as jest.Mock).mockReturnValue({
      isLoggingOut: false,
      setIsLoggingOut: mockSetIsLoggingOut,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const setupAndAdvanceTimers = () => {
    render(<ProfileClient profile={mockProfile as any} />);
    act(() => {
      jest.advanceTimersByTime(800);
      jest.advanceTimersByTime(1000);
    });
  };

  it('shows loading state initially then renders content', () => {
    render(<ProfileClient profile={mockProfile as any} />);
    
    expect(screen.queryByText('Securely loading your profile...')).not.toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(800);
    });
    expect(screen.getByText('Securely loading your profile...')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('opens and closes edit profile modal', () => {
    setupAndAdvanceTimers();

    const editBtn = screen.getByText('Personal Info');
    fireEvent.click(editBtn);

    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Edit'));
    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
  });

  it('updates profile info and calls router.refresh', async () => {
    setupAndAdvanceTimers();
    (updateUserProfileClient as jest.Mock).mockResolvedValue({ ...mockProfile, name: 'Updated Name' });

    fireEvent.click(screen.getByText('Personal Info'));
    fireEvent.click(screen.getByText('Save Edit'));

    await waitFor(() => {
      expect(updateUserProfileClient).toHaveBeenCalledWith({ name: 'Updated Name' });
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it('opens and closes change password modal', () => {
    setupAndAdvanceTimers();

    const passBtn = screen.getByText('Change Password');
    fireEvent.click(passBtn);

    expect(screen.getByTestId('password-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Password'));
    expect(screen.queryByTestId('password-modal')).not.toBeInTheDocument();
  });

  it('opens change image modal and handles image update', async () => {
    setupAndAdvanceTimers();
    (updateUserProfileClient as jest.Mock).mockResolvedValue({ ...mockProfile, image: 'new-image.jpg' });

    // The avatar has a wrapping div that triggers the modal
    // We can't directly query the avatar by text, so we find the wrapper or just trigger it via standard logic
    // We have a dedicated camera button for it
    const cameraButtons = screen.getAllByRole('button').filter(b => b.className.includes('bg-primary'));
    fireEvent.click(cameraButtons[0]);

    expect(screen.getByTestId('image-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save Image'));

    await waitFor(() => {
      expect(updateUserProfileClient).toHaveBeenCalledWith({ image: 'new-image.jpg' });
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it('shows error toast if image update fails', async () => {
    setupAndAdvanceTimers();
    (updateUserProfileClient as jest.Mock).mockRejectedValue(new Error('Failed'));

    const cameraButtons = screen.getAllByRole('button').filter(b => b.className.includes('bg-primary'));
    fireEvent.click(cameraButtons[0]);

    fireEvent.click(screen.getByText('Save Image'));

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Failed to update profile image');
    });
  });

  it('handles logout confirmation', () => {
    setupAndAdvanceTimers();

    const logoutBtn = screen.getByText('Logout');
    fireEvent.click(logoutBtn);

    // Confirm modal opens
    expect(screen.getByText(/Are you sure you want to sign out/i)).toBeInTheDocument();
    
    // Click actual confirm (which says "Logout" in the modal)
    // There are two "Logout" texts now. The one in the confirm modal is a button
    const confirmButtons = screen.getAllByText('Logout');
    fireEvent.click(confirmButtons[1]); // Assuming the second is the modal button

    expect(mockSetIsLoggingOut).toHaveBeenCalledWith(true);

    // Advance timer for 2500ms
    jest.advanceTimersByTime(2500);
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });
});
