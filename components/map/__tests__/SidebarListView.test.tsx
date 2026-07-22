import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarListView from '../SidebarListView';

jest.mock('@/components/listings/CompactListingCard', () => {
  return function MockCompactListingCard({ data, onClickOverride }: any) {
    return (
      <div data-testid="compact-listing-card" onClick={onClickOverride}>
        {data.title}
      </div>
    );
  };
});

describe('SidebarListView Component', () => {
  const mockListings: any = [
    { id: '1', title: 'Listing 1', latitude: 14.5, longitude: 121 },
    { id: '2', title: 'Listing 2', latitude: 14.6, longitude: 121.1 }, // Too far
  ];
  
  const mockOnListingSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all listings when no landmark is selected', () => {
    render(
      <SidebarListView 
        selectedLandmark={null} 
        onListingSelect={mockOnListingSelect} 
        listings={mockListings} 
      />
    );
    
    expect(screen.getByText('2 Boarding Houses')).toBeInTheDocument();
    expect(screen.getByText('Listing 1')).toBeInTheDocument();
    expect(screen.getByText('Listing 2')).toBeInTheDocument();
  });

  it('filters listings by distance when landmark is selected', () => {
    const mockLandmark = { name: 'Test College', lat: 14.5, lng: 121 }; // Exact same location as Listing 1
    
    render(
      <SidebarListView 
        selectedLandmark={mockLandmark} 
        onListingSelect={mockOnListingSelect} 
        listings={mockListings} 
      />
    );
    
    expect(screen.getByText('Listings near Test College')).toBeInTheDocument();
    expect(screen.getByText('Within 1km walking distance')).toBeInTheDocument();
    expect(screen.getByText('Listing 1')).toBeInTheDocument();
    // Fixed: Distance filter calculates strict 1km radius accurately
    expect(screen.queryByText('Listing 2')).not.toBeInTheDocument();
  });

  it('calls onListingSelect when a listing card is clicked', () => {
    render(
      <SidebarListView 
        selectedLandmark={null} 
        onListingSelect={mockOnListingSelect} 
        listings={mockListings} 
      />
    );
    
    fireEvent.click(screen.getByTestId('mock-listing-card-1'));
    expect(mockOnListingSelect).toHaveBeenCalledWith(mockListings[0]);
  });
});
