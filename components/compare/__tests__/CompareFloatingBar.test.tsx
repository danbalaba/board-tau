import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompareFloatingBar from '../CompareFloatingBar';
import { usePathname } from 'next/navigation';
import { useCompareStore } from '@/hooks/use-compare-store';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

jest.mock('@/hooks/use-compare-store', () => ({
  useCompareStore: jest.fn()
}));

jest.mock('../CompareModal', () => {
  return function MockCompareModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return <div data-testid="compare-modal"><button onClick={onClose}>Close Modal</button></div>;
  };
});

describe('CompareFloatingBar', () => {
  const mockClearListings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCompareStore as unknown as jest.Mock).mockReturnValue({
      selectedListingIds: ['1', '2'],
      clearListings: mockClearListings
    });
    (usePathname as jest.Mock).mockReturnValue('/favorites');
  });

  it('renders nothing if not on /favorites page', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    const { container } = render(<CompareFloatingBar />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if count is 0', () => {
    (useCompareStore as unknown as jest.Mock).mockReturnValue({
      selectedListingIds: [],
      clearListings: mockClearListings
    });
    
    render(<CompareFloatingBar />);
    expect(screen.queryByText(/Listings Selected/i)).not.toBeInTheDocument();
  });

  it('renders compare bar and opens modal on compare click', () => {
    render(<CompareFloatingBar />);
    
    expect(screen.getByText('2')).toBeInTheDocument();
    
    const compareBtn = screen.getByText('Compare');
    fireEvent.click(compareBtn);
    
    expect(screen.getByTestId('compare-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('compare-modal')).not.toBeInTheDocument();
  });

  it('calls clearListings when X is clicked', () => {
    render(<CompareFloatingBar />);
    
    // Find the X button by title or find the first button
    const clearBtn = screen.getByTitle('Clear selection');
    fireEvent.click(clearBtn);
    
    expect(mockClearListings).toHaveBeenCalled();
  });

  it('disables compare button if less than 2 listings', () => {
    (useCompareStore as unknown as jest.Mock).mockReturnValue({
      selectedListingIds: ['1'],
      clearListings: mockClearListings
    });
    
    render(<CompareFloatingBar />);
    
    const compareBtn = screen.getByText('Compare');
    expect(compareBtn).toBeDisabled();
    expect(screen.getByText('Select up to 3 to compare')).toBeInTheDocument();
  });
});
