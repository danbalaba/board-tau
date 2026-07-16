import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListingHeader from '../ListingHeader';

// Mock dependencies
jest.mock('@/components/favorites/HeartButton', () => {
  return function MockHeartButton() {
    return <div data-testid="heart-button">Heart</div>;
  };
});

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, whileHover, layoutId, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('ListingHeader', () => {
  const defaultProps = {
    title: 'Test Boarding House',
    region: 'Tarlac',
    country: 'Philippines',
    rating: 4.5,
    reviewCount: 10,
    listingId: '123',
    hasFavorited: false,
    categories: [{ label: 'Near University', value: 'university' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(true),
      },
    });
    window.open = jest.fn();
    // mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('renders correctly', () => {
    render(<ListingHeader {...defaultProps} />);
    
    expect(screen.getByText('Test Boarding House')).toBeInTheDocument();
    expect(screen.getByText('Tarlac, Philippines')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(10 Reviews)')).toBeInTheDocument();
    expect(screen.getByText('Near University')).toBeInTheDocument();
  });

  it('shows BoardTAU Choice if rating is 4.9 and 5+ reviews', () => {
    render(<ListingHeader {...defaultProps} rating={4.9} reviewCount={5} />);
    
    expect(screen.getByText('BoardTAU Choice')).toBeInTheDocument();
  });

  it('opens share modal when share button clicked', () => {
    render(<ListingHeader {...defaultProps} />);
    
    const shareBtn = screen.getByText('Share').closest('button');
    fireEvent.click(shareBtn!);
    
    expect(screen.getByText('Share this place')).toBeInTheDocument();
  });

  it('handles copy link action', async () => {
    render(<ListingHeader {...defaultProps} />);
    
    // Open modal
    fireEvent.click(screen.getByText('Share').closest('button')!);
    
    await waitFor(() => {
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    const copyBtn = screen.getByText('Copy Link');
    fireEvent.click(copyBtn);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('handles email share action', async () => {
    render(<ListingHeader {...defaultProps} />);
    
    // Open modal
    fireEvent.click(screen.getByText('Share').closest('button')!);
    
    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    const emailBtn = screen.getByText('Email');
    fireEvent.click(emailBtn);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('mailto:?subject=Test%20Boarding%20House'));
  });

  it('handles reviews click scrolling', () => {
    const scrollIntoViewMock = jest.fn();
    const reviewsDiv = document.createElement('div');
    reviewsDiv.id = 'reviews-section';
    reviewsDiv.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(reviewsDiv);

    render(<ListingHeader {...defaultProps} />);
    
    const reviewBtn = screen.getByText('4.5').closest('button');
    fireEvent.click(reviewBtn!);
    
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    
    document.body.removeChild(reviewsDiv);
  });
});
