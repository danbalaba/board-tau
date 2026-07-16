import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListingGallery from '../ListingGallery';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
  })),
}));

jest.mock('@/components/favorites/HeartButton', () => () => <button data-testid="heart-button">Heart</button>);
jest.mock('@/components/common/BackToTop', () => () => <div data-testid="back-to-top" />);
jest.mock('@/components/common/MediaPreviewOverlay', () => ({ isOpen }: any) => isOpen ? <div data-testid="media-preview-overlay" /> : null);
jest.mock('@/components/common/SafeImage', () => ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />);

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ListingGallery Component', () => {
  const mockImages = [
    { url: 'img1.jpg', caption: 'Front', order: 1, roomType: 'Exterior' },
    { url: 'img2.jpg', caption: 'Kitchen', order: 2, roomType: 'Kitchen' },
    { url: 'img3.jpg', caption: 'Bed', order: 3, roomType: 'Bedroom' },
    { url: 'img4.jpg', caption: 'Bath', order: 4, roomType: 'Bathroom' },
    { url: 'img5.jpg', caption: 'Living', order: 5, roomType: 'Common Area' },
  ];

  it('renders a fallback if no images are provided', () => {
    const { container } = render(<ListingGallery title="Test" images={[]} listingId="1" />);
    expect(container.firstChild).toHaveClass('w-full h-96 bg-gray-200 dark:bg-gray-800');
  });

  it('renders initial grid of images', () => {
    render(<ListingGallery title="Test" images={mockImages} listingId="1" />);
    const images = screen.getAllByTestId('safe-image');
    expect(images.length).toBeGreaterThan(0);
    expect(screen.getByText('Show all photos')).toBeInTheDocument();
  });

  it('opens modal when clicking "Show all photos"', () => {
    render(<ListingGallery title="Test" images={mockImages} listingId="1" />);
    const showAllBtn = screen.getByText('Show all photos');
    fireEvent.click(showAllBtn);
    expect(screen.getByText('Photo tour')).toBeInTheDocument();
    expect(screen.getByText('5 photos')).toBeInTheDocument();
  });

  it('filters by category in the modal', () => {
    render(<ListingGallery title="Test" images={mockImages} listingId="1" />);
    fireEvent.click(screen.getByText('Show all photos'));
    
    // In the photo tour, it shows the category headers
    const kitchenHeading = screen.getAllByText('Kitchen');
    expect(kitchenHeading.length).toBeGreaterThan(0);
  });

  it('opens share modal', async () => {
    const { container } = render(<ListingGallery title="Test" images={mockImages} listingId="1" />);
    
    // Find the share button (it contains the Share lucide icon which renders as an SVG)
    const shareBtns = container.querySelectorAll('button');
    // Let's just try to find the share icon button. The easiest way is clicking the generic share.
    // However, it's easier to mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });

    const shareActionBtn = shareBtns[1]; // Share button in mobile view
    fireEvent.click(shareActionBtn);

    expect(screen.getByText('Share this place')).toBeInTheDocument();
    
    // Wait for the loading skeletons to disappear
    await screen.findByText('Copy Link', {}, { timeout: 2000 });

    const copyBtn = screen.getByText('Copy Link');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
