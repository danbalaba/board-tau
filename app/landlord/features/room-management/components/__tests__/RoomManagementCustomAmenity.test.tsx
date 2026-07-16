import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoomManagementCustomAmenity from '../RoomManagementCustomAmenity';

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'displayName') return 'LucideIcon';
      return () => <span data-testid={`icon-${String(prop)}`} />;
    }
  });
});

describe('RoomManagementCustomAmenity', () => {
  const mockOnAddAmenity = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<RoomManagementCustomAmenity onAddAmenity={mockOnAddAmenity} onClose={mockOnClose} />);
    expect(screen.getByText(/Add Custom Feature/i)).toBeInTheDocument();
  });

  it('calls onAddAmenity when Confirm button is clicked', () => {
    render(<RoomManagementCustomAmenity onAddAmenity={mockOnAddAmenity} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText(/e.g. Balcony, Study Corner/i);
    fireEvent.change(input, { target: { value: 'New Feature' } });
    const addBtn = screen.getByText(/Confirm/i);
    fireEvent.click(addBtn);
    expect(mockOnAddAmenity).toHaveBeenCalled();
  });
});
