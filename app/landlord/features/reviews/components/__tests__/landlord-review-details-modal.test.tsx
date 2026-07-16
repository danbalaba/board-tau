import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LandlordReviewDetailsModal } from '../landlord-review-details-modal';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/modals/Modal', () => ({
  __esModule: true,
  default: ({ children, isOpen }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null),
}));

jest.mock('@/components/common/Avatar', () => ({
  __esModule: true,
  default: ({ name }: any) => <div data-testid="avatar">{name}</div>,
}));

jest.mock('@/components/common/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">{children}</button>
  ),
}));

jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />,
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

global.fetch = jest.fn() as jest.Mock;

describe('LandlordReviewDetailsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    render(<LandlordReviewDetailsModal isOpen={false} onClose={mockOnClose} reviewId={null} />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('shows loading state initially when open', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    
    render(<LandlordReviewDetailsModal isOpen={true} onClose={mockOnClose} reviewId="review-1" />);
    expect(screen.getByText('Loading Photos & Videos...')).toBeInTheDocument();
  });

  it('renders review details after fetching', async () => {
    const mockReview = {
      id: 'review-1',
      listing: { id: 'l1', title: 'Test Listing', imageSrc: 'l1.jpg' },
      user: { id: 'u1', name: 'Test User', email: 'test@test.com' },
      rating: 5,
      comment: 'Awesome place!',
      images: [],
      status: 'approved',
      createdAt: '2023-01-01T00:00:00Z',
      response: null,
      respondedAt: null,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReview }),
    });

    render(<LandlordReviewDetailsModal isOpen={true} onClose={mockOnClose} reviewId="review-1" onSuccess={mockOnSuccess} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Test User')[0]).toBeInTheDocument();
    });

    expect(screen.getByText('"Awesome place!"')).toBeInTheDocument();
  });
});
