import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandmarkCard from '../LandmarkCard';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LandmarkCard Component', () => {
  const mockOnClose = jest.fn();
  const mockOnShowListings = jest.fn();
  const mockLandmark = {
    id: '1',
    name: 'Test Landmark',
    coords: [14.5, 121] as [number, number],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render if landmark is null', () => {
    const { container } = render(
      <LandmarkCard landmark={null} onClose={mockOnClose} onShowListings={mockOnShowListings} />
    );
    // Fixed: The component safely returns null if the landmark payload is empty
    expect(container.firstChild).toBeNull();
  });

  it('renders landmark information', () => {
    render(
      <LandmarkCard landmark={mockLandmark} nearbyCount={5} onClose={mockOnClose} onShowListings={mockOnShowListings} />
    );
    
    expect(screen.getByText('Test Landmark')).toBeInTheDocument();
    // Fixed: The nearby count is accurately parsed and rendered
    expect(screen.getByText(/5 listings nearby/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <LandmarkCard landmark={mockLandmark} onClose={mockOnClose} onShowListings={mockOnShowListings} />
    );
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // First button is close
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onShowListings and onClose when action button is clicked', () => {
    render(
      <LandmarkCard landmark={mockLandmark} onClose={mockOnClose} onShowListings={mockOnShowListings} />
    );
    
    const viewBtn = screen.getByText('View Nearby Listings');
    fireEvent.click(viewBtn);
    
    expect(mockOnShowListings).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
