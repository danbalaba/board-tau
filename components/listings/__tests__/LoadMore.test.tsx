import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadMore from '../LoadMore';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLoadMore } from '@/hooks/useLoadMore';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock('@/hooks/useLoadMore', () => ({
  useLoadMore: jest.fn(),
}));

jest.mock('../ListingCard', () => {
  const ListingCard = ({ data }: any) => <div data-testid={`listing-${data.id}`}>{data.title}</div>;
  ListingCard.ListingSkeleton = () => <div data-testid="listing-skeleton" />;
  return ListingCard;
});

describe('LoadMore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLoadMore as jest.Mock).mockReturnValue({ ref: { current: null } });
  });

  it('renders listings correctly', () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            listings: [
              { id: '1', title: 'Listing 1' },
              { id: '2', title: 'Listing 2' },
            ],
            nextCursor: 'cursor2',
          },
        ],
      },
      isFetchingNextPage: false,
      hasNextPage: true,
      status: 'success',
      fetchNextPage: jest.fn(),
    });

    render(<LoadMore nextCursor="cursor1" queryKey={['listings']} favorites={[]} />);

    expect(screen.getByTestId('listing-1')).toHaveTextContent('Listing 1');
    expect(screen.getByTestId('listing-2')).toHaveTextContent('Listing 2');
    expect(screen.queryByTestId('listing-skeleton')).not.toBeInTheDocument();
  });

  it('renders skeletons while pending', () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isFetchingNextPage: false,
      hasNextPage: true,
      status: 'pending',
      fetchNextPage: jest.fn(),
    });

    render(<LoadMore nextCursor="cursor1" queryKey={['listings']} favorites={[]} />);

    expect(screen.getAllByTestId('listing-skeleton')).toHaveLength(4);
  });

  it('renders skeletons while fetching next page', () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            listings: [{ id: '1', title: 'Listing 1' }],
          },
        ],
      },
      isFetchingNextPage: true,
      hasNextPage: true,
      status: 'success',
      fetchNextPage: jest.fn(),
    });

    render(<LoadMore nextCursor="cursor1" queryKey={['listings']} favorites={[]} />);

    expect(screen.getByTestId('listing-1')).toBeInTheDocument();
    expect(screen.getAllByTestId('listing-skeleton')).toHaveLength(4);
  });

  it('renders error message on error', () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isFetchingNextPage: false,
      hasNextPage: false,
      status: 'error',
      fetchNextPage: jest.fn(),
    });

    render(<LoadMore nextCursor="cursor1" queryKey={['listings']} favorites={[]} />);

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });

  it('passes correctly to useLoadMore', () => {
    const fetchNextPage = jest.fn();
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isFetchingNextPage: false,
      hasNextPage: true,
      status: 'success',
      fetchNextPage,
    });

    render(<LoadMore nextCursor="cursor1" queryKey={['listings']} favorites={[]} />);

    expect(useLoadMore).toHaveBeenCalledWith(
      fetchNextPage,
      true, // hasNextPage
      false, // isFetching/pending
      false // isError
    );
  });
});
