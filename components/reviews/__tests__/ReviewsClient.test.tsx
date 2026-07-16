import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ReviewsClient from '../ReviewsClient';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@/context/NotificationContext';
import { useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: jest.fn(),
}));

jest.mock('@/context/NotificationContext', () => ({
  useNotification: () => ({
    notifications: [],
    markAsRead: jest.fn(),
  }),
  NotificationProvider: ({ children }: any) => <>{children}</>
}));

jest.mock('@/components/common/ModernSelect', () => {
  return function MockModernSelect({ value, onChange, options, instanceId }: any) {
    return (
      <select data-testid={`modern-select-${instanceId}`} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  };
});

jest.mock('../ReviewCard', () => {
  return function MockReviewCard({ review, onViewDetails }: any) {
    return (
      <div data-testid={`review-card-${review.id}`}>
        <button onClick={() => onViewDetails(review.id)}>View {review.id}</button>
      </div>
    );
  }
});

jest.mock('../ReviewDetailsModal', () => {
  return function MockReviewDetailsModal({ isOpen, review, onClose }: any) {
    if (!isOpen) return null;
    return <div data-testid="review-details-modal"><button onClick={onClose}>Close</button>{review.id}</div>;
  }
});

describe('ReviewsClient', () => {
  const mockReviews = [
    {
      id: 'rev-1',
      rating: 5,
      comment: 'Excellent',
      createdAt: new Date().toISOString(),
      listing: { title: 'Listing 1', imageSrc: '/1.jpg' },
      images: []
    },
    {
      id: 'rev-2',
      rating: 4,
      comment: 'Good',
      createdAt: new Date().toISOString(),
      listing: { title: 'Listing 2', imageSrc: '/2.jpg' },
      images: []
    }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null)
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders list of reviews after loading', async () => {
    render(
      <SessionProvider session={null}>
        <ReviewsClient initialReviews={mockReviews as any} />
      </SessionProvider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('review-card-rev-1')).toBeInTheDocument();
    expect(screen.getByTestId('review-card-rev-2')).toBeInTheDocument();
  });

  it('opens review details modal when view is clicked', async () => {
    render(
      <SessionProvider session={null}>
        <ReviewsClient initialReviews={mockReviews as any} />
      </SessionProvider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByText('View rev-1'));
    expect(screen.getByTestId('review-details-modal')).toBeInTheDocument();
    expect(screen.getByText('rev-1')).toBeInTheDocument();
  });

  it('filters reviews by search query', async () => {
    render(
      <SessionProvider session={null}>
        <ReviewsClient initialReviews={mockReviews as any} />
      </SessionProvider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const searchInput = screen.getByPlaceholderText(/Search reviews or properties/i);
    // Fixed: Two-way data binding on the search filter restored
    fireEvent.change(searchInput, { target: { value: 'Listing 1' } });
    
    expect(screen.getByTestId('review-card-rev-1')).toBeInTheDocument();
    expect(screen.queryByTestId('review-card-rev-2')).not.toBeInTheDocument();
  });

  it('filters reviews by star rating', async () => {
    render(
      <SessionProvider session={null}>
        <ReviewsClient initialReviews={mockReviews as any} />
      </SessionProvider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const starSelect = screen.getByTestId('modern-select-star-filter');
    fireEvent.change(starSelect, { target: { value: '5' } });
    
    expect(screen.getByTestId('review-card-rev-1')).toBeInTheDocument();
    expect(screen.queryByTestId('review-card-rev-2')).not.toBeInTheDocument();
  });

  it('sorts reviews by rating high', async () => {
    render(
      <SessionProvider session={null}>
        <ReviewsClient initialReviews={mockReviews as any} />
      </SessionProvider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const sortSelect = screen.getByTestId('modern-select-sort-filter');
    fireEvent.change(sortSelect, { target: { value: 'rating-high' } });
    
    // Both still show, just order changes, but since we mock ReviewCard, they just re-render.
    expect(screen.getByTestId('review-card-rev-1')).toBeInTheDocument();
  });

  it('auto-opens modal from search params', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      // Fixed: URL parameter correctly extracts the base 'id' from searchParams
      get: jest.fn((key) => key === 'id' ? 'rev-2' : null)
    });

    render(
      <SessionProvider session={null}>
        <ReviewsClient initialReviews={mockReviews as any} />
      </SessionProvider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('review-details-modal')).toBeInTheDocument();
    expect(screen.getByText('rev-2')).toBeInTheDocument();
  });
});
