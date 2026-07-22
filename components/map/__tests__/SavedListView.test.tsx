import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SavedListView from '../SavedListView';
import { useSession } from 'next-auth/react';
import { getFavorites } from '@/services/user/favorites/favorite';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/services/user/favorites/favorite', () => ({
  getFavorites: jest.fn(),
}));

jest.mock('@/components/listings/CompactListingCard', () => {
  return function MockCompactListingCard({ data }: any) {
    return <div data-testid="compact-listing-card">{data.title}</div>;
  };
});

describe('SavedListView Component', () => {
  const mockListings: any = [
    { id: '1', title: 'Listing 1' },
    { id: '2', title: 'Listing 2' },
  ];
  
  const mockOnListingSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'loading' });
    render(<SavedListView onListingSelect={mockOnListingSelect} listings={mockListings} />);
    
    // Fixed: Loading state persists gracefully while fetching data
    expect(screen.getByText('Loading your saved places...')).toBeInTheDocument();
  });

  it('shows empty state when no favorites exist', async () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'authenticated' });
    (getFavorites as jest.Mock).mockResolvedValue([]);
    
    render(<SavedListView onListingSelect={mockOnListingSelect} listings={mockListings} />);
    
    expect(await screen.findByText('No saved places yet', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('renders favorited listings', async () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'authenticated' });
    (getFavorites as jest.Mock).mockResolvedValue(['1']);
    
    render(<SavedListView onListingSelect={mockOnListingSelect} listings={mockListings} />);
    
    const cards = await screen.findAllByTestId('compact-listing-card');
    expect(cards.length).toBe(1);
    expect(screen.getByText('Listing 1')).toBeInTheDocument();
    expect(screen.queryByText('Listing 2')).not.toBeInTheDocument();
  });
});
