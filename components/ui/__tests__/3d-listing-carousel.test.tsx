import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ThreeDListingCarousel from '../3d-listing-carousel';

// Mock ListingCard since it has complex dependencies (next/image, links, etc)
jest.mock('@/components/listings/ListingCard', () => ({ data }: any) => (
  <div data-testid={`listing-card-${data.id}`}>{data.title}</div>
));

describe('ThreeDListingCarousel', () => {
  const mockListings = [
    { id: '1', title: 'Listing 1' },
    { id: '2', title: 'Listing 2' },
    { id: '3', title: 'Listing 3' },
  ] as any[];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders nothing when listings are empty', () => {
    const { container } = render(<ThreeDListingCarousel listings={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders listings correctly', () => {
    render(<ThreeDListingCarousel listings={mockListings} itemCount={3} />);
    
    expect(screen.getByTestId('listing-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('listing-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('listing-card-3')).toBeInTheDocument();
  });

  it('handles navigation arrows', () => {
    const { container } = render(<ThreeDListingCarousel listings={mockListings} itemCount={3} />);
    
    const items = container.querySelectorAll('.cascade-slider_item');
    // Initially item 0 is active ("now")
    expect(items[0]).toHaveClass('now');
    
    // Find next arrow
    const nextArrow = container.querySelector('.cascade-slider_arrow-right') as HTMLElement;
    fireEvent.click(nextArrow);
    
    // Now item 1 is active
    expect(items[1]).toHaveClass('now');
    expect(items[0]).toHaveClass('prev'); // Since it moved to next
    
    // Find prev arrow
    const prevArrow = container.querySelector('.cascade-slider_arrow-left') as HTMLElement;
    fireEvent.click(prevArrow);
    
    // Now item 0 is active again
    expect(items[0]).toHaveClass('now');
  });

  it('handles mouse events for dragging', () => {
    const { container } = render(<ThreeDListingCarousel listings={mockListings} itemCount={3} />);
    
    const slider = container.querySelector('.cascade-slider_container') as HTMLElement;
    
    // Simulate drag right (prev)
    fireEvent.mouseDown(slider, { clientX: 100 });
    fireEvent.mouseUp(slider, { clientX: 200 }); // distance > 50
    
    const items = container.querySelectorAll('.cascade-slider_item');
    // We navigated prev, so item 2 (last item) should be active
    expect(items[2]).toHaveClass('now');
  });

  it('starts and stops autoplay', () => {
    const { container } = render(<ThreeDListingCarousel listings={mockListings} itemCount={3} autoplay={true} delay={5} />);
    
    const items = container.querySelectorAll('.cascade-slider_item');
    expect(items[0]).toHaveClass('now');
    
    act(() => {
      jest.advanceTimersByTime(5100);
    });
    
    expect(items[1]).toHaveClass('now');
    
    // Hover to stop autoplay
    const slider = container.querySelector('.cascade-slider_container') as HTMLElement;
    fireEvent.mouseEnter(slider);
    
    act(() => {
      jest.advanceTimersByTime(5100);
    });
    
    // Should still be 1 since we hovered
    expect(items[1]).toHaveClass('now');
  });
});
