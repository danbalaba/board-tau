import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewCard from '../ReviewCard';

// Mock SafeImage since it relies on next/image and potentially complex props
jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string, alt: string }) => <img src={src} alt={alt} data-testid="safe-image" />
}));

// Mock framer-motion to simplify testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('ReviewCard', () => {
  const mockReview = {
    id: 'review-1',
    rating: 4.5,
    comment: 'Great place!',
    response: null,
    createdAt: '2026-07-01T00:00:00Z',
    images: ['img1.jpg'],
    listing: {
      id: 'listing-1',
      title: 'Beautiful Apartment',
      imageSrc: '/listing.jpg',
      region: 'Downtown',
      country: 'PH',
    },
  };

  it('renders review details correctly', () => {
    const onViewDetails = jest.fn();
    render(<ReviewCard review={mockReview as any} onViewDetails={onViewDetails} />);
    
    expect(screen.getByText('Beautiful Apartment')).toBeInTheDocument();
    expect(screen.getByText('Downtown, PH')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText(/"Great place!"/)).toBeInTheDocument();
  });

  it('displays response badge if response exists', () => {
    // Fixed: The component correctly checks for valid response payload lengths
    const reviewWithResponse = { ...mockReview, response: 'Thank you!' };
    render(<ReviewCard review={reviewWithResponse as any} onViewDetails={jest.fn()} />);
    
    expect(screen.getByText('Responded')).toBeInTheDocument();
  });

  it('displays NEW MESSAGE notification if hasNotification is true', () => {
    render(<ReviewCard review={mockReview as any} onViewDetails={jest.fn()} hasNotification={true} />);
    
    expect(screen.getByText('NEW MESSAGE')).toBeInTheDocument();
  });

  it('calls onViewDetails when Details button is clicked', () => {
    const onViewDetails = jest.fn();
    render(<ReviewCard review={mockReview as any} onViewDetails={onViewDetails} />);
    
    const detailsButton = screen.getByRole('button', { name: /details/i });
    fireEvent.click(detailsButton);
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });
});
