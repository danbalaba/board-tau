import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListingMenu from '../ListingMenu';
import { usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((cb) => cb),
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}));

jest.mock('@/services/user/reservations', () => ({
  deleteReservation: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

// Mock ConfirmDelete to simplify testing modal flow
jest.mock('@/components/common/ConfirmDelete', () => {
  return function MockConfirmDelete({ onConfirm, title, isLoading }: any) {
    return (
      <div data-testid="mock-confirm-delete">
        <span>{title}</span>
        <button onClick={() => onConfirm()} disabled={isLoading}>Confirm Mock</button>
      </div>
    );
  };
});

describe('ListingMenu', () => {
  const mockCancelReservation = jest.fn();
  const mockSuccess = jest.fn();
  const mockError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockCancelReservation,
    });
    (useResponsiveToast as jest.Mock).mockReturnValue({
      success: mockSuccess,
      error: mockError,
    });
  });

  it('renders nothing on / or /favorites', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    const { container } = render(<ListingMenu id="1" />);
    expect(container).toBeEmptyDOMElement();

    (usePathname as jest.Mock).mockReturnValue('/favorites');
    const { container: container2 } = render(<ListingMenu id="1" />);
    expect(container2).toBeEmptyDOMElement();
  });

  it('renders menu on /reservations', () => {
    (usePathname as jest.Mock).mockReturnValue('/reservations');
    render(<ListingMenu id="1" />);
    
    const menuToggle = screen.getByRole('button');
    expect(menuToggle).toBeInTheDocument();
  });

  it('opens menu and triggers delete confirmation', async () => {
    (usePathname as jest.Mock).mockReturnValue('/reservations');
    render(<ListingMenu id="1" />);
    
    // Open menu
    const menuToggle = screen.getByRole('button');
    fireEvent.click(menuToggle);
    
    // Check if the cancel button is there
    const cancelBtn = screen.getByText('Cancel reservation');
    expect(cancelBtn).toBeInTheDocument();
    
    // Click cancel to open modal
    fireEvent.click(cancelBtn);
    
    // Wait for the modal contents
    await waitFor(() => {
      expect(screen.getByTestId('mock-confirm-delete')).toBeInTheDocument();
    });
    
    // Confirm delete
    fireEvent.click(screen.getByText('Confirm Mock'));
    
    expect(mockCancelReservation).toHaveBeenCalled();
  });

  it('handles successful reservation cancellation', async () => {
    (usePathname as jest.Mock).mockReturnValue('/reservations');
    
    mockCancelReservation.mockImplementation((id: string, { onSuccess }: any) => {
      onSuccess();
    });
    
    render(<ListingMenu id="1" />);
    
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Cancel reservation'));
    
    await waitFor(() => screen.getByText('Confirm Mock'));
    
    fireEvent.click(screen.getByText('Confirm Mock'));
    
    expect(mockSuccess).toHaveBeenCalledWith('Reservation successfully cancelled!');
  });
});
