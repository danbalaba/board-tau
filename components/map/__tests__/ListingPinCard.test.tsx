import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListingPinCard from '../ListingPinCard';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ListingPinCard Component', () => {
  const mockOnClose = jest.fn();
  const mockOnViewDetails = jest.fn();
  const mockListing = {
    id: '1',
    title: 'Pin Listing',
    price: 2500,
    region: 'Tarlac',
    rooms: [{ status: 'available' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render if listing is null', () => {
    const { container } = render(
      <ListingPinCard listing={null} onClose={mockOnClose} onViewDetails={mockOnViewDetails} />
    );
    // Fixed: Null-state prop crashes are prevented
    expect(container.firstChild).toBeNull();
  });

  it('renders listing information', () => {
    render(
      <ListingPinCard listing={mockListing} onClose={mockOnClose} onViewDetails={mockOnViewDetails} />
    );
    
    expect(screen.getByText('Pin Listing')).toBeInTheDocument();
    expect(screen.getByText(/2,500/)).toBeInTheDocument();
    // Fixed: Room availability strings are correctly formatted
    expect(screen.getByText(/1 room available/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ListingPinCard listing={mockListing} onClose={mockOnClose} onViewDetails={mockOnViewDetails} />
    );
    
    // Close button is the first button rendered (top right)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onViewDetails and onClose when CTA button is clicked', () => {
    render(
      <ListingPinCard listing={mockListing} onClose={mockOnClose} onViewDetails={mockOnViewDetails} />
    );
    
    const viewBtn = screen.getByText('View Full Details');
    fireEvent.click(viewBtn);
    
    expect(mockOnViewDetails).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
