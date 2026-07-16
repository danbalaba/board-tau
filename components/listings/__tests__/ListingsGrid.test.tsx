import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ListingsGrid from '../ListingsGrid';
import { getAIEnrichmentAction } from '@/app/actions/ai-enrichment';

jest.mock('@/app/actions/ai-enrichment', () => ({
  getAIEnrichmentAction: jest.fn(),
}));

jest.mock('@/components/listings/ListingCard', () => {
  return function MockListingCard({ data, aiHighlight }: any) {
    return (
      <div data-testid="listing-card">
        <span>{data.title}</span>
        {aiHighlight && <span data-testid="ai-highlight">{aiHighlight}</span>}
      </div>
    );
  };
});

jest.mock('@/components/listings/LoadMore', () => () => <div data-testid="load-more" />);

jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  staggerContainer: {},
  staggerItem: {},
}));

describe('ListingsGrid Component', () => {
  const mockListings: any[] = [
    { id: '1', title: 'Listing 1' },
    { id: '2', title: 'Listing 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders listings initially', () => {
    render(
      <ListingsGrid 
        listings={mockListings} 
        nextCursor={undefined} 
        favorites={[]} 
        searchParamsObj={{}} 
      />
    );

    expect(screen.getByText('Listing 1')).toBeInTheDocument();
    expect(screen.getByText('Listing 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('listing-card')).toHaveLength(2);
    expect(screen.queryByTestId('load-more')).not.toBeInTheDocument();
  });

  it('renders LoadMore when nextCursor is provided', () => {
    render(
      <ListingsGrid 
        listings={mockListings} 
        nextCursor="cursor-123" 
        favorites={[]} 
        searchParamsObj={{}} 
      />
    );

    expect(screen.getByTestId('load-more')).toBeInTheDocument();
  });

  it('calls AI enrichment when searchParams are present', async () => {
    (getAIEnrichmentAction as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { id: '1', title: 'Listing 1', aiHighlight: 'Great match!' },
        { id: '2', title: 'Listing 2', aiHighlight: 'Close to university' },
      ],
    });

    render(
      <ListingsGrid 
        listings={mockListings} 
        nextCursor={undefined} 
        favorites={[]} 
        searchParamsObj={{ query: 'manila' }} 
      />
    );

    await waitFor(() => {
      expect(getAIEnrichmentAction).toHaveBeenCalledTimes(1);
    });

    // Check if enriched data is displayed
    await waitFor(() => {
      expect(screen.getByText('Great match!')).toBeInTheDocument();
      expect(screen.getByText('Close to university')).toBeInTheDocument();
    });
  });

  it('does not call AI enrichment if listings already have aiHighlight', async () => {
    const enrichedListings = [
      { id: '1', title: 'Listing 1', aiHighlight: 'Already enriched' }
    ];

    render(
      <ListingsGrid 
        listings={enrichedListings as any} 
        nextCursor={undefined} 
        favorites={[]} 
        searchParamsObj={{ query: 'manila' }} 
      />
    );

    await waitFor(() => {
      expect(getAIEnrichmentAction).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Already enriched')).toBeInTheDocument();
  });
});
