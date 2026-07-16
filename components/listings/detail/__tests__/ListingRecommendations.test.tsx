import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ListingRecommendations } from '../ListingRecommendations';

// Mock the components
jest.mock('@/components/ui/3d-listing-carousel', () => () => <div data-testid="3d-carousel" />);
jest.mock('@/components/listings/ListingCard', () => {
  const ListingCard = () => <div data-testid="listing-card" />;
  ListingCard.ListingSkeleton = () => <div data-testid="listing-skeleton" />;
  return ListingCard;
});

describe('ListingRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders loading skeletons initially', () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<ListingRecommendations listingId="123" />);
    
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Similar Places You Might Like')).toBeInTheDocument();
    expect(screen.getAllByTestId('listing-skeleton')).toHaveLength(3);
  });

  it('renders carousel when data is loaded', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ data: [{ id: '1' }] }),
    });
    
    render(<ListingRecommendations listingId="123" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('3d-carousel')).toBeInTheDocument();
    });
  });

  it('renders nothing when no recommendations', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ data: [] }),
    });
    
    const { container } = render(<ListingRecommendations listingId="123" />);
    
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { container } = render(<ListingRecommendations listingId="123" />);
    
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
