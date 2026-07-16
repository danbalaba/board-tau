import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListingReviews from '../ListingReviews';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({ error: toast.error }),
}));

jest.mock('@/components/common/SafeImage', () => {
  return function MockSafeImage({ src, alt }: any) {
    return <img src={src} alt={alt} data-testid="safe-image" />;
  };
});

jest.mock('@/components/common/Avatar', () => {
  return function MockAvatar({ name }: any) {
    return <div data-testid="avatar">{name}</div>;
  };
});

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, whileHover, layoutId, viewport, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, animate, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

describe('ListingReviews', () => {
  const mockReviews = [
    {
      id: 'r1',
      rating: 5,
      comment: 'Great place!',
      createdAt: new Date('2026-07-01'),
      user: { id: 'u1', name: 'John' },
      likedIds: [],
    },
    {
      id: 'r2',
      rating: 3,
      comment: 'Okay place.',
      createdAt: new Date('2026-06-01'),
      user: { id: 'u2', name: 'Jane' },
      likedIds: ['u1'],
      response: 'Thanks for the feedback.',
    },
  ];

  const defaultProps = {
    reviews: mockReviews,
    listingRating: 4.0,
    listingReviewCount: 2,
    ownerName: 'Owner Bob',
    currentUser: { id: 'u1' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reviews correctly', () => {
    render(<ListingReviews {...defaultProps} />);
    
    expect(screen.getByText('Guest Reviews')).toBeInTheDocument();
    expect(screen.getByText('2 TOTAL')).toBeInTheDocument();
    expect(screen.getByText('"Great place!"')).toBeInTheDocument();
    expect(screen.getByText('"Okay place."')).toBeInTheDocument();
    
    // Response
    expect(screen.getByText('Reply from')).toBeInTheDocument();
    expect(screen.getByText('Owner Bob')).toBeInTheDocument();
    expect(screen.getByText('"Thanks for the feedback."')).toBeInTheDocument();
  });

  it('shows no reviews UI if reviews array is empty', () => {
    render(<ListingReviews {...defaultProps} reviews={[]} />);
    
    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });

  it('handles liking a review', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    
    render(<ListingReviews {...defaultProps} />);
    
    const likeBtns = screen.getAllByText(/Helpful/);
    fireEvent.click(likeBtns[0]); // like first review
    
    expect(axios.post).toHaveBeenCalledWith('/api/reviews/r1/like');
  });

  it('shows error if liking without being logged in', () => {
    render(<ListingReviews {...defaultProps} currentUser={null} />);
    
    const likeBtns = screen.getAllByText(/Helpful/);
    fireEvent.click(likeBtns[0]);
    
    expect(toast.error).toHaveBeenCalledWith('Please log in to like a review');
  });

  it('sorts reviews correctly', () => {
    render(<ListingReviews {...defaultProps} />);
    
    // Sort dropdown
    fireEvent.click(screen.getByText(/Sort By:/));
    
    // Click Lowest Rated
    fireEvent.click(screen.getByText('Lowest Rated'));
    
    // Jane's review (3 stars) should appear before John's (5 stars)
    const comments = screen.getAllByText(/"Great place!"|"Okay place."/);
    expect(comments[0]).toHaveTextContent('"Okay place."');
    expect(comments[1]).toHaveTextContent('"Great place!"');
  });
});
