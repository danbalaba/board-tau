import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListingDetailsClient from '../ListingDetailsClient';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

// Mock dynamic imports (Map)
jest.mock('next/dynamic', () => () => {
  return function MockMap() {
    return <div data-testid="map-mock" />;
  };
});

jest.mock('@/components/common/Avatar', () => () => <div data-testid="avatar-mock" />);
jest.mock('@/components/common/SafeImage', () => () => <div data-testid="safe-image-mock" />);
jest.mock('@/components/ui/border-beam', () => ({ BorderBeam: () => <div data-testid="border-beam-mock" /> }));
jest.mock('@/components/ui/3d-hover-gallery', () => () => <div data-testid="3d-hover-gallery-mock" />);
jest.mock('@/components/ui/angled-slider', () => () => <div data-testid="angled-slider-mock" />);
jest.mock('../ListingReviews', () => () => <div data-testid="listing-reviews-mock" />);
jest.mock('../ListingRecommendations', () => ({ ListingRecommendations: () => <div data-testid="listing-recommendations-mock" /> }));
jest.mock('../AvailableRoomsSection', () => () => <div data-testid="available-rooms-section-mock" />);
jest.mock('../ListingCategory', () => () => <div data-testid="listing-category-mock" />);

jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(null),
  })
) as jest.Mock;

describe('ListingDetailsClient Component', () => {
  const mockProps = {
    id: 'listing-1',
    price: 10000,
    user: { id: 'user-1', name: 'Test User', email: 'test@test.com' } as any,
    title: 'Test Listing',
    owner: { id: 'owner-1', name: 'Landlord', image: null },
    categories: [{ label: 'Apartment', value: 'apartment', description: 'desc' }],
    description: 'A great place',
    roomCount: 2,
    bathroomCount: 1,
    latlng: [14.5, 121],
    amenities: ['WiFi', 'Air conditioning'],
    rooms: [
      { id: 'room-1', name: 'Room 1', status: 'AVAILABLE', availableSlots: 1, images: [{ url: 'r1.jpg' }] },
    ],
    features: { cctv: true, security24h: false } as any,
    rules: { petsAllowed: true, customRules: ['Quiet hours'] } as any,
  };

  const mockToast = {
    success: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useResponsiveToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('renders property overview correctly', () => {
    render(<ListingDetailsClient {...mockProps} />);
    expect(screen.getByText('Hosted by Landlord')).toBeInTheDocument();
    
    // Check counts (Total Rooms, Bathrooms, Available Units should all be 1 based on mockProps)
    const countElements = screen.getAllByText('1');
    expect(countElements.length).toBeGreaterThanOrEqual(3);
  });

  it('renders categories and description', () => {
    render(<ListingDetailsClient {...mockProps} />);
    expect(screen.getByText('Listing Categories')).toBeInTheDocument();
    expect(screen.getByText('About this place')).toBeInTheDocument();
    expect(screen.getByText('A great place')).toBeInTheDocument();
  });

  it('renders amenities correctly', () => {
    render(<ListingDetailsClient {...mockProps} />);
    expect(screen.getByText('What this place offers')).toBeInTheDocument();
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Air conditioning')).toBeInTheDocument();
  });

  it('renders features and rules', () => {
    render(<ListingDetailsClient {...mockProps} />);
    expect(screen.getByText('Safety & Reassurance')).toBeInTheDocument();
    expect(screen.getByText('CCTV Monitoring')).toBeInTheDocument();

    expect(screen.getByText('Policies & Rules')).toBeInTheDocument();
    expect(screen.getByText('Pets are allowed')).toBeInTheDocument();
    expect(screen.getByText('Quiet hours')).toBeInTheDocument();
  });

  it('scrolls to available rooms when clicking "Available Rooms" text', () => {
    render(<ListingDetailsClient {...mockProps} />);
    const scrollFn = jest.fn();
    document.getElementById = jest.fn().mockReturnValue({ scrollIntoView: scrollFn });
    
    const exploreBtn = screen.getByText('Available Rooms');
    fireEvent.click(exploreBtn);
    
    expect(document.getElementById).toHaveBeenCalledWith('available-rooms');
    expect(scrollFn).toHaveBeenCalled();
  });

  it('fetches active stay on mount', async () => {
    render(<ListingDetailsClient {...mockProps} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reservations/active-stay');
    });
  });
});
