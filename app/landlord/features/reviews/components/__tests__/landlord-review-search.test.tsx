import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordReviewSearch } from '../landlord-review-search';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: any) => value,
}));

const mockReviews = [
  { id: '1', user: { name: 'Alice', email: 'alice@test.com' }, listing: { title: 'Room A' }, rating: 5, status: 'approved' },
  { id: '2', user: { name: 'Bob', email: 'bob@test.com' }, listing: { title: 'Room B' }, rating: 4, status: 'pending' }
];

describe('LandlordReviewSearch', () => {
  const mockSetSearchQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <LandlordReviewSearch
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
        reviews={mockReviews as any}
      />
    );
    expect(screen.getByPlaceholderText(/Search reviews.../i)).toBeInTheDocument();
  });

  it('calls setSearchQuery on input change', async () => {
    render(
      <LandlordReviewSearch
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
        reviews={mockReviews as any}
      />
    );
    
    const input = screen.getByPlaceholderText(/Search reviews.../i);
    fireEvent.change(input, { target: { value: 'Alice' } });
    
    await waitFor(() => {
      expect(mockSetSearchQuery).toHaveBeenCalledWith('Alice');
    });
  });

  it('clears search query when clear button is clicked', () => {
    render(
      <LandlordReviewSearch
        searchQuery="Alice"
        setSearchQuery={mockSetSearchQuery}
        reviews={mockReviews as any}
      />
    );
    
    // Clear button appears when searchQuery is not empty
    const clearBtn = screen.getByRole('button'); // there's a clear button
    fireEvent.click(clearBtn);
    
    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
  });
});
