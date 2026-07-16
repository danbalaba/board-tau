import React from 'react';
import { render, screen } from '@testing-library/react';
import LandlordReviews from '../index';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('kbar', () => ({
  useRegisterActions: jest.fn(),
}));

jest.mock('../hooks/use-review-logic', () => ({
  useReviewLogic: () => ({
    filteredReviews: [],
    totalReviews: 0,
    currentPage: 1,
    setCurrentPage: jest.fn(),
    itemsPerPage: 10,
    setItemsPerPage: jest.fn(),
    nextCursor: null,
    isLoadingMore: false,
    selectedStatus: 'all',
    setSelectedStatus: jest.fn(),
    selectedRating: 'all',
    setSelectedRating: jest.fn(),
    viewMode: 'grid',
    setViewMode: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    rawReviews: [],
    handleLoadMore: jest.fn(),
    handleGenerateReport: jest.fn(),
    respondModal: { isOpen: false, reviewId: null, reviewTitle: '' },
    setRespondModal: jest.fn(),
    updateReviewResponse: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('../components/landlord-review-header', () => ({
  LandlordReviewHeader: () => <div data-testid="review-header">Header</div>,
}));

jest.mock('../components/landlord-review-card', () => ({
  LandlordReviewCard: () => <div data-testid="review-card">Card</div>,
}));

jest.mock('../components/landlord-review-respond-modal', () => ({
  LandlordReviewRespondModal: () => <div data-testid="respond-modal">Respond Modal</div>,
}));

jest.mock('../components/landlord-review-details-modal', () => ({
  LandlordReviewDetailsModal: () => <div data-testid="details-modal">Details Modal</div>,
}));

jest.mock('../../shared/landlord-pagination', () => ({
  LandlordPagination: () => <div data-testid="pagination">Pagination</div>,
}));

describe('LandlordReviews Index', () => {
  it('renders the empty state correctly when there are no reviews', () => {
    const mockReviewsData = { reviews: [], nextCursor: null };
    render(<LandlordReviews reviews={mockReviewsData as any} />);

    expect(screen.getByTestId('review-header')).toBeInTheDocument();
    expect(screen.getByText('No reviews found')).toBeInTheDocument();
    expect(screen.getByTestId('respond-modal')).toBeInTheDocument();
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
  });
});
