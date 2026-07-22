import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecentsListView from '../RecentsListView';
import { useRecentStore } from '@/hooks/use-recent-store';

jest.mock('@/hooks/use-recent-store', () => ({
  useRecentStore: jest.fn(),
}));

jest.mock('@/components/listings/CompactListingCard', () => {
  return function MockCompactListingCard({ data, onClickOverride }: any) {
    return (
      <div data-testid="compact-listing-card" onClick={onClickOverride}>
        {data.title}
      </div>
    );
  };
});

describe('RecentsListView Component', () => {
  const mockListings: any = [
    { id: '1', title: 'Listing 1' },
    { id: '2', title: 'Listing 2' },
  ];
  
  const mockOnListingSelect = jest.fn();
  const mockClearRecents = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no recents exist', () => {
    (useRecentStore as unknown as jest.Mock).mockReturnValue({ 
      recentListings: [], 
      clearRecents: mockClearRecents 
    });
    
    render(<RecentsListView onListingSelect={mockOnListingSelect} listings={mockListings} />);
    
    expect(screen.getByText('No history yet')).toBeInTheDocument();
  });

  it('renders recent listings and clear button', () => {
    (useRecentStore as unknown as jest.Mock).mockReturnValue({ 
      recentListings: [{ id: '1', viewedAt: Date.now() }], 
      clearRecents: mockClearRecents 
    });
    
    render(<RecentsListView onListingSelect={mockOnListingSelect} listings={mockListings} />);
    
    expect(screen.getByText('Listing 1')).toBeInTheDocument();
    expect(screen.queryByText('Listing 2')).not.toBeInTheDocument();
    
    const cards = screen.getAllByTestId('compact-listing-card');
    const clearBtn = screen.getByText('Clear All');
    expect(clearBtn).toBeInTheDocument();
    
    fireEvent.click(clearBtn);
    // Fixed: The global store accurately intercepts the clear dispatch
    expect(mockClearRecents).toHaveBeenCalled();
  });
});
