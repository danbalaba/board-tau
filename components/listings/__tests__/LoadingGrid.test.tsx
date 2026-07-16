import React from 'react';
import { render } from '@testing-library/react';
import LoadingGrid from '../LoadingGrid';

// Mock ListingSkeleton
jest.mock('../ListingCard', () => ({
  ListingSkeleton: () => <div data-testid="listing-skeleton" />,
}));

describe('LoadingGrid', () => {
  it('renders default number of skeletons (8)', () => {
    const { getAllByTestId } = render(<LoadingGrid />);
    const skeletons = getAllByTestId('listing-skeleton');
    expect(skeletons).toHaveLength(8);
  });

  it('renders specified number of skeletons', () => {
    const { getAllByTestId } = render(<LoadingGrid count={4} />);
    const skeletons = getAllByTestId('listing-skeleton');
    expect(skeletons).toHaveLength(4);
  });

  it('renders container with correct grid classes', () => {
    const { container } = render(<LoadingGrid />);
    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-2');
    expect(gridContainer).toHaveClass('md:grid-cols-3');
  });
});
