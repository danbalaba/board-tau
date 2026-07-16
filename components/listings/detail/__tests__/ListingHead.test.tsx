import React from 'react';
import { render, screen } from '@testing-library/react';
import ListingHead from '../ListingHead';
import { getFavorites } from '@/services/user/favorites';

// Mock dependencies
jest.mock('@/services/user/favorites', () => ({
  getFavorites: jest.fn(),
}));

jest.mock('@/components/common/Heading', () => {
  return function MockHeading({ title, subtitle }: any) {
    return (
      <div data-testid="heading">
        <span>{title}</span>
        <span>{subtitle}</span>
      </div>
    );
  };
});

jest.mock('@/components/common/Image', () => {
  return function MockImage({ imageSrc, alt }: any) {
    return <img src={imageSrc} alt={alt} data-testid="image" />;
  };
});

jest.mock('@/components/favorites/HeartButton', () => {
  return function MockHeartButton({ hasFavorited }: any) {
    return <div data-testid="heart-button">Favorited: {hasFavorited ? 'Yes' : 'No'}</div>;
  };
});

describe('ListingHead Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when favorited', async () => {
    (getFavorites as jest.Mock).mockResolvedValueOnce(['123', '456']);

    const jsx = await ListingHead({
      title: 'Test Listing',
      country: 'Philippines',
      region: 'Tarlac',
      image: '/test-image.jpg',
      id: '123',
    });
    
    render(jsx);

    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getByText('Tarlac, Philippines')).toBeInTheDocument();
    expect(screen.getByTestId('image')).toHaveAttribute('src', '/test-image.jpg');
    expect(screen.getByTestId('heart-button')).toHaveTextContent('Favorited: Yes');
  });

  it('renders correctly when not favorited', async () => {
    (getFavorites as jest.Mock).mockResolvedValueOnce(['456']);

    const jsx = await ListingHead({
      title: 'Another Listing',
      country: 'PH',
      region: 'NCR',
      image: '/test-image-2.jpg',
      id: '123',
    });
    
    render(jsx);

    expect(screen.getByTestId('heart-button')).toHaveTextContent('Favorited: No');
  });
});
