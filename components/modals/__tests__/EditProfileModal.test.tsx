import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfileModal from '../EditProfileModal';
import { geocodeAddress, reverseGeocode } from '@/services/geocoding';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

jest.mock('@/services/geocoding', () => ({
  geocodeAddress: jest.fn(),
  reverseGeocode: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

// Mock dynamic Map import
jest.mock('next/dynamic', () => () => {
  return function MockMap({ onLocationSelect }: any) {
    return (
      <div data-testid="mock-map" onClick={() => onLocationSelect && onLocationSelect(15.0, 120.0)}>
        Map Component
      </div>
    );
  };
});

jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  const Modal = ({ children, onClose, title }: any) => (
    <div data-testid="mock-modal">
      {title && <div data-testid="modal-header">{title}</div>}
      <button data-testid="modal-close" onClick={onClose}>Close</button>
      {children}
    </div>
  );
  Modal.WindowHeader = ({ title }: any) => <div data-testid="modal-header">{title}</div>;
  return Modal;
});

jest.mock('@/components/inputs/ModalInput', () => {
  const React = require('react');
  return React.forwardRef(function MockModalInput({ id, label, type, onChange, onBlur, name, register }: any, ref: any) {
    const reg = register ? register(id) : {};
    return (
      <div data-testid={`input-wrapper-${id}`}>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          data-testid={`input-${id}`}
          type={type || 'text'}
          {...reg}
          onChange={(e) => {
            if (reg.onChange) reg.onChange(e);
            if (onChange) onChange(e);
          }}
        />
      </div>
    );
  });
});

jest.mock('@/components/inputs/Textarea', () => {
  const React = require('react');
  return React.forwardRef(function MockTextarea({ id, label, register }: any, ref: any) {
    const reg = register ? register(id) : {};
    return (
      <div data-testid={`textarea-wrapper-${id}`}>
        <label htmlFor={id}>{label}</label>
        <textarea
          id={id}
          data-testid={`textarea-${id}`}
          {...reg}
        />
      </div>
    );
  });
});

describe('EditProfileModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockSuccess = jest.fn();
  const mockErrorToast = jest.fn();

  const defaultProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '09123456789',
    city: 'Tarlac City',
    region: 'Tarlac',
    address: '123 Main St',
    bio: 'Hello world',
    emailVerified: new Date(),
    image: null,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useResponsiveToast as jest.Mock).mockReturnValue({
      success: mockSuccess,
      error: mockErrorToast,
    });
    // @ts-ignore
    mockOnUpdate.mockResolvedValue();
  });

  it('renders correctly with default profile values', () => {
    render(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        profile={defaultProfile as any}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByTestId('modal-header')).toHaveTextContent('Edit My Account');
    expect(screen.getByTestId('input-name')).toHaveValue('John Doe');
    expect(screen.getByTestId('input-phoneNumber')).toHaveValue('09123456789');
    expect(screen.getByTestId('input-city')).toHaveValue('Tarlac City');
    expect(screen.getByTestId('input-region')).toHaveValue('Tarlac');
    expect(screen.getByTestId('input-address')).toHaveValue('123 Main St');
    expect(screen.getByTestId('textarea-bio')).toHaveValue('Hello world');
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('submits successfully with updated values', async () => {
    render(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        profile={defaultProfile as any}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByTestId('input-city'), { target: { value: 'Camiling' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Jane Doe',
        city: 'Camiling',
        phoneNumber: '09123456789', // Unchanged
        bio: 'Hello world', // Unchanged
      }));
      expect(mockSuccess).toHaveBeenCalledWith('Profile updated successfully');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles address search correctly', async () => {
    (geocodeAddress as jest.Mock).mockResolvedValue({
      address: '456 New St',
      city: 'Capas',
      province: 'Tarlac',
      coordinates: [15.3, 120.5],
    });

    render(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        profile={defaultProfile as any}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.change(screen.getByTestId('input-address'), { target: { value: '456 New St Capas' } });

    // The search button doesn't have text, but we can find it by its onClick handler or just querying the button next to the input
    // The button has a search icon inside it, and is disabled when searching
    // Since it's inside a flex container next to address, we can find it by type="button"
    const buttons = screen.getAllByRole('button');
    // The search button is the 2nd button (1st is modal close, then search, then back, then save)
    // Wait, mock-map also has no button
    const searchBtn = buttons.find(b => b.className.includes('bg-primary text-white')) || buttons[1];
    
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(geocodeAddress).toHaveBeenCalledWith('456 New St Capas');
      expect(screen.getByTestId('input-city')).toHaveValue('Capas');
      expect(screen.getByTestId('input-region')).toHaveValue('Tarlac');
      expect(mockSuccess).toHaveBeenCalledWith('Location pinned!');
    });
  });

  it('handles reverse geocoding on map click', async () => {
    (reverseGeocode as jest.Mock).mockResolvedValue({
      address: '789 Map St',
      city: 'Concepcion',
      province: 'Tarlac',
    });

    render(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        profile={defaultProfile as any}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByTestId('mock-map'));

    await waitFor(() => {
      expect(reverseGeocode).toHaveBeenCalledWith(15.0, 120.0);
      expect(screen.getByTestId('input-address')).toHaveValue('789 Map St');
      expect(screen.getByTestId('input-city')).toHaveValue('Concepcion');
      expect(mockSuccess).toHaveBeenCalledWith('Address auto-filled from map pin!');
    });
  });

  it('handles submission error gracefully', async () => {
    mockOnUpdate.mockRejectedValue(new Error('Update failed'));

    render(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        profile={defaultProfile as any}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith('Failed to update profile');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
