import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePasswordModal from '../ChangePasswordModal';
import { changeUserPasswordClient } from '@/services/client/profile.client';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

// Mock Modal components
jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  return function MockModal({ children, isOpen, title }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/inputs/ModalInput', () => {
  const React = require('react');
  return React.forwardRef(function MockModalInput({ id, label, type, placeholder, onChange, onBlur, name }: any, ref: any) {
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          data-testid={`input-${id}`}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          ref={ref}
        />
      </div>
    );
  });
});

jest.mock('@/components/common/Button', () => {
  return function MockButton({ children, onClick, type, disabled }: any) {
    return (
      <button type={type} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  };
});

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
}));

jest.mock('@/services/client/profile.client', () => ({
  changeUserPasswordClient: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

describe('ChangePasswordModal Component', () => {
  const mockOnClose = jest.fn();
  const mockSuccess = jest.fn();
  const mockError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useResponsiveToast as jest.Mock).mockReturnValue({
      success: mockSuccess,
      error: mockError,
    });
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: jest.fn() },
    });
  });

  it('renders correctly when user has a password', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} hasPassword={true} />);
    
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Change Password');
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Secure Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Re-type New Password/i)).toBeInTheDocument();
  });

  it('renders correctly when user does not have a password', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} hasPassword={false} />);
    
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Set Account Password');
    expect(screen.queryByLabelText(/Current Password/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Create New Password/i)).toBeInTheDocument();
  });

  it('closes when back button is clicked', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} hasPassword={true} />);
    
    fireEvent.click(screen.getByText('Back'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits form successfully when changing password', async () => {
    (changeUserPasswordClient as jest.Mock).mockResolvedValue(true);
    const { container } = render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} hasPassword={true} />);
    
    fireEvent.change(screen.getByTestId('input-oldPassword'), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByTestId('input-newPassword'), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByTestId('input-confirmPassword'), { target: { value: 'NewPass123!' } });
    
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(changeUserPasswordClient).toHaveBeenCalledWith('oldpass123', 'NewPass123!');
      expect(mockSuccess).toHaveBeenCalledWith('Password updated successfully');
      expect(mockOnClose).toHaveBeenCalled();
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it('submits form successfully when setting new password', async () => {
    (changeUserPasswordClient as jest.Mock).mockResolvedValue(true);
    const { container } = render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} hasPassword={false} />);
    
    fireEvent.change(screen.getByTestId('input-newPassword'), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByTestId('input-confirmPassword'), { target: { value: 'NewPass123!' } });
    
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(changeUserPasswordClient).toHaveBeenCalledWith('', 'NewPass123!');
      expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining('Password set successfully'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('displays error toast on failure', async () => {
    (changeUserPasswordClient as jest.Mock).mockRejectedValue(new Error('Invalid old password'));
    const { container } = render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} hasPassword={true} />);
    
    fireEvent.change(screen.getByTestId('input-oldPassword'), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByTestId('input-newPassword'), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByTestId('input-confirmPassword'), { target: { value: 'NewPass123!' } });
    
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(changeUserPasswordClient).toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledWith('Invalid old password');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
