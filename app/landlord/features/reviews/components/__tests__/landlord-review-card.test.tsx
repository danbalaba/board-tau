import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordReviewCard } from '../landlord-review-card';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
    button: ({ children, className, onClick }: any) => <button className={className} onClick={onClick}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src, alt, className }: any) => <img src={src} alt={alt} className={className} data-testid="safe-image" />,
}));

jest.mock('@/components/common/Avatar', () => ({
  __esModule: true,
  default: ({ src, name, className }: any) => <div className={className} data-testid="avatar">{name}</div>,
}));

jest.mock('@/components/common/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, className }: any) => <button onClick={onClick} className={className} data-testid="button">{children}</button>,
}));

const mockReview = {
  id: 'review-123',
  userId: 'user-123',
  listingId: 'listing-123',
  reservationId: 'res-123',
  rating: 4.5,
  comment: 'Great place, very clean!',
  status: 'approved' as const,
  images: ['image1.jpg'],
  videos: [],
  createdAt: new Date('2023-01-01T10:00:00Z'),
  updatedAt: new Date('2023-01-01T10:00:00Z'),
  response: null,
  respondedAt: null,
  user: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    image: 'avatar.jpg',
  },
  listing: {
    id: 'listing-123',
    title: 'Beautiful Apartment in City Center',
    imageSrc: 'listing.jpg',
    images: [],
  },
  reservation: {
    id: 'res-123',
    room: {
      id: 'room-1',
      name: 'Room 1',
      images: [{ url: 'room1.jpg' }],
    },
  },
};

describe('LandlordReviewCard', () => {
  const mockSetRespondModal = jest.fn();
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given review data', () => {
    render(
      <LandlordReviewCard
        review={mockReview}
        idx={0}
        viewMode="grid"
        setRespondModal={mockSetRespondModal}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Check if listing title is rendered
    expect(screen.getByText('Beautiful Apartment in City Center')).toBeInTheDocument();
    
    // Check if guest name is rendered
    expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    
    // Check if comment is rendered
    expect(screen.getByText(/"Great place, very clean!"/)).toBeInTheDocument();

    // Check if rating is rendered correctly
    expect(screen.getByText(/4.5 \/ 5.0/)).toBeInTheDocument();
  });

  it('calls onViewDetails when Details button is clicked', () => {
    render(
      <LandlordReviewCard
        review={mockReview}
        idx={0}
        viewMode="grid"
        setRespondModal={mockSetRespondModal}
        onViewDetails={mockOnViewDetails}
      />
    );

    const detailsButton = screen.getByText('Details').closest('button');
    expect(detailsButton).toBeInTheDocument();
    
    if (detailsButton) {
      fireEvent.click(detailsButton);
      expect(mockOnViewDetails).toHaveBeenCalledWith('review-123');
    }
  });

  it('calls setRespondModal when Respond button is clicked (if no response yet)', () => {
    render(
      <LandlordReviewCard
        review={{ ...mockReview, response: null }}
        idx={0}
        viewMode="grid"
        setRespondModal={mockSetRespondModal}
        onViewDetails={mockOnViewDetails}
      />
    );

    const respondButton = screen.getByText('Respond').closest('button');
    expect(respondButton).toBeInTheDocument();
    
    if (respondButton) {
      fireEvent.click(respondButton);
      expect(mockSetRespondModal).toHaveBeenCalledWith({
        isOpen: true,
        reviewId: 'review-123',
        reviewTitle: 'Beautiful Apartment in City Center',
      });
    }
  });

  it('shows Responded status if review has a response', () => {
    render(
      <LandlordReviewCard
        review={{ ...mockReview, response: 'Thanks!', respondedAt: '2023-01-02T00:00:00Z' } as any}
        idx={0}
        viewMode="grid"
        setRespondModal={mockSetRespondModal}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Responded')).toBeInTheDocument();
    expect(screen.queryByText('Respond')).not.toBeInTheDocument();
  });
});
