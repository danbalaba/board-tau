import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordBookingSearch } from '../landlord-booking-search';

// Mock hooks
jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: (val: any) => val,
}));

describe('LandlordBookingSearch', () => {
  const mockSetSearchQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with placeholder', () => {
    render(<LandlordBookingSearch searchQuery="" setSearchQuery={mockSetSearchQuery} bookings={[]} />);
    expect(screen.getByPlaceholderText('Search tenant or property...')).toBeInTheDocument();
  });

  it('displays current search query', () => {
    render(<LandlordBookingSearch searchQuery="John" setSearchQuery={mockSetSearchQuery} bookings={[]} />);
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });

  it('calls setSearchQuery on input change', async () => {
    render(<LandlordBookingSearch searchQuery="" setSearchQuery={mockSetSearchQuery} bookings={[]} />);
    const input = screen.getByPlaceholderText('Search tenant or property...');
    
    fireEvent.change(input, { target: { value: 'Doe' } });
    
    await waitFor(() => {
      expect(mockSetSearchQuery).toHaveBeenCalledWith('Doe');
    });
  });
});
