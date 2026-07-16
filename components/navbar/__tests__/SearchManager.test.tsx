import React from 'react';
import { render, screen, act } from '@testing-library/react';
import SearchManager from '../SearchManager';
import { useSearchSummary } from '@/hooks/useSearchSummary';

jest.mock('@/hooks/useSearchSummary', () => ({
  useSearchSummary: jest.fn(),
}));

jest.mock('../../modals/Modal', () => {
  const Modal = ({ children }: any) => <div data-testid="modal">{children}</div>;
  Modal.Trigger = ({ children }: any) => <div data-testid="modal-trigger">{children}</div>;
  Modal.Window = ({ children }: any) => <div data-testid="modal-window">{children}</div>;
  return Modal;
});

// Next.js dynamic mock is somewhat tricky, we can mock the component itself since we mocked Modal
jest.mock('next/dynamic', () => () => {
  return function MockSearchModal() {
    return <div data-testid="search-modal">SearchModal Component</div>;
  };
});

describe('SearchManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchSummary as jest.Mock).mockReturnValue({
      locationLabel: 'Anywhere',
      priceLabel: 'Any week',
      roomTypeLabel: 'Add Guests',
    });
  });

  it('renders search bar by default', () => {
    render(<SearchManager />);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-trigger')).toBeInTheDocument();
    
    // Desktop labels (rendered multiple times due to mobile/desktop layouts)
    expect(screen.getAllByText('Anywhere').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Any week').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Add Guests').length).toBeGreaterThan(0);
  });

  it('hides search bar when isScrolled is true', () => {
    render(<SearchManager isScrolled={true} />);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.queryByTestId('modal-trigger')).not.toBeInTheDocument();
  });

  it('renders custom labels from hook', () => {
    (useSearchSummary as jest.Mock).mockReturnValue({
      locationLabel: 'Tarlac',
      priceLabel: '₱1000',
      roomTypeLabel: 'Single',
    });

    render(<SearchManager />);
    
    expect(screen.getAllByText('Tarlac').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₱1000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Single').length).toBeGreaterThan(0);
  });
});
