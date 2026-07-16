import React from 'react';
import { render, screen } from '@testing-library/react';
import ListingInfo from '../ListingInfo';

// Mock dynamic Map component
jest.mock('next/dynamic', () => () => {
  return function MockMap() {
    return <div data-testid="map">Map</div>;
  };
});

jest.mock('@/components/common/Avatar', () => {
  return function MockAvatar({ src }: any) {
    return <img src={src} alt="Avatar" data-testid="avatar" />;
  };
});

describe('ListingInfo', () => {
  const defaultProps = {
    user: {
      image: '/avatar.png',
      name: 'John Doe',
    },
    description: 'A very nice place.',
    guestCount: 2,
    roomCount: 1,
    bathroomCount: 1,
    category: { label: 'Near School', description: 'Very close to university' },
    latlng: [15.4828, 120.5996],
    amenities: ['Wifi', 'Aircon'],
    roomType: 'Solo',
  };

  it('renders all information correctly', () => {
    render(<ListingInfo {...defaultProps} />);

    // Fixed the intentional error for the final green screenshot!
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveAttribute('src', '/avatar.png');
    
    expect(screen.getByText('2 guests')).toBeInTheDocument();
    expect(screen.getByText('1 rooms')).toBeInTheDocument();
    expect(screen.getByText('1 bathrooms')).toBeInTheDocument();

    expect(screen.getByText('Near School')).toBeInTheDocument();
    expect(screen.getByText('Very close to university')).toBeInTheDocument();

    expect(screen.getByText('A very nice place.')).toBeInTheDocument();

    expect(screen.getByText('Wifi')).toBeInTheDocument();
    expect(screen.getByText('Aircon')).toBeInTheDocument();

    expect(screen.getByText('Room Type')).toBeInTheDocument();
    expect(screen.getByText('Solo')).toBeInTheDocument();

    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('renders correctly without category', () => {
    render(<ListingInfo {...defaultProps} category={null} />);
    
    expect(screen.queryByText('Near School')).not.toBeInTheDocument();
    expect(screen.queryByText('Very close to university')).not.toBeInTheDocument();
  });
});
