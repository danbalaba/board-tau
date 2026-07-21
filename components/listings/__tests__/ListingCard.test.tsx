import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListingCard, { ListingSkeleton } from '../ListingCard';
import { usePathname } from 'next/navigation';
import { useCompareStore } from '@/hooks/use-compare-store';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/hooks/use-compare-store', () => ({
  useCompareStore: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

jest.mock('@/components/common/HelpTooltip', () => {
  return function MockHelpTooltip({ children }: any) {
    return <div data-testid="help-tooltip">{children}</div>;
  };
});

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, whileHover, ...props }: any, ref: any) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
  };
});

jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Navigation: jest.fn(),
  Pagination: jest.fn(),
}));

jest.mock('@/components/favorites/HeartButton', () => () => <button data-testid="heart-button">Heart</button>);
jest.mock('@/components/common/SafeImage', () => ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />);

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

jest.mock('swiper/css', () => {});
jest.mock('swiper/css/navigation', () => {});
jest.mock('swiper/css/pagination', () => {});

describe('ListingCard Component', () => {
  const mockListing: any = {
    id: 'list-1',
    title: 'Test Listing',
    price: 1500,
    region: 'Makati',
    category: ['Apartment'],
    imageSrc: 'image.jpg',
    createdAt: new Date().toISOString(),
    reviews: [{ rating: 5 }],
    rooms: [
      { status: 'AVAILABLE', availableSlots: 2, images: ['room.jpg'] }
    ],
    user: { isVerifiedLandlord: true }
  };

  const mockCompareStore = {
    selectedListingIds: [],
    addListing: jest.fn(),
    removeListing: jest.fn(),
  };

  const mockToast = {
    warning: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
    (useCompareStore as unknown as jest.Mock).mockReturnValue(mockCompareStore);
    (useResponsiveToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('renders listing title and region', () => {
    render(<ListingCard data={mockListing} hasFavorited={false} />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getByText('Makati')).toBeInTheDocument();
  });

  it('renders price correctly', () => {
    render(<ListingCard data={mockListing} hasFavorited={false} />);
    expect(screen.getByText('1,500')).toBeInTheDocument(); // assumes formatPrice adds comma
  });

  it('renders reservation details if reservation prop provided', () => {
    const res = { id: 'res-1', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-05'), totalPrice: 4000 };
    render(<ListingCard data={mockListing} hasFavorited={false} reservation={res} />);
    expect(screen.getByText('4,000')).toBeInTheDocument();
  });

  it('displays NEW, TOP RATED, and VERIFIED badges when applicable', () => {
    render(<ListingCard data={mockListing} hasFavorited={false} />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
    expect(screen.getByText('TOP RATED')).toBeInTheDocument();
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
  });

  it('handles compare click correctly in /favorites path', () => {
    (usePathname as jest.Mock).mockReturnValue('/favorites');
    
    const { rerender } = render(<ListingCard data={mockListing} hasFavorited={false} />);
    
    // It's in compare mode
    const compareBtn = screen.getByTitle('Add to compare');
    fireEvent.click(compareBtn);
    expect(mockCompareStore.addListing).toHaveBeenCalledWith('list-1');

    // Simulate selected state
    (useCompareStore as unknown as jest.Mock).mockReturnValue({
      ...mockCompareStore,
      selectedListingIds: ['list-1'],
    });

    rerender(<ListingCard data={mockListing} hasFavorited={false} />);
    
    const removeBtn = screen.getByTitle('Remove from compare');
    fireEvent.click(removeBtn);
    expect(mockCompareStore.removeListing).toHaveBeenCalledWith('list-1');
  });

  it('shows warning when trying to compare more than 3 listings', () => {
    (usePathname as jest.Mock).mockReturnValue('/favorites');
    (useCompareStore as unknown as jest.Mock).mockReturnValue({
      ...mockCompareStore,
      selectedListingIds: ['1', '2', '3'],
    });

    render(<ListingCard data={mockListing} hasFavorited={false} />);
    
    const compareBtn = screen.getByTitle('Add to compare');
    fireEvent.click(compareBtn);
    expect(mockToast.info).toHaveBeenCalled();
  });

  it('renders ListingSkeleton without crashing', () => {
    const { container } = render(<ListingSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
