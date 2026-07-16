import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordReviewRespondModal } from '../landlord-review-respond-modal';

// Mock dependencies
jest.mock('@/components/modals/Modal', () => ({
  __esModule: true,
  default: ({ children, isOpen }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null),
}));

jest.mock('@/components/common/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">{children}</button>
  ),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

global.fetch = jest.fn() as jest.Mock;

describe('LandlordReviewRespondModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    render(
      <LandlordReviewRespondModal 
        isOpen={false} 
        onClose={mockOnClose} 
        reviewId="" 
        reviewTitle=""
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.queryByText('Respond to Review')).not.toBeInTheDocument();
  });

  it('renders the modal when open with review title', () => {
    render(
      <LandlordReviewRespondModal 
        isOpen={true} 
        onClose={mockOnClose} 
        reviewId="review-1" 
        reviewTitle="Awesome Listing"
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByText('Respond to Review')).toBeInTheDocument();
    expect(screen.getByText('Awesome Listing')).toBeInTheDocument();
  });

  it('updates textarea and enables submit button', () => {
    render(
      <LandlordReviewRespondModal 
        isOpen={true} 
        onClose={mockOnClose} 
        reviewId="review-1" 
        reviewTitle="Awesome Listing"
        onSuccess={mockOnSuccess}
      />
    );
    
    const textarea = screen.getByPlaceholderText(/Write your response clearly and professionally/i);
    fireEvent.change(textarea, { target: { value: 'Thank you for staying!' } });
    
    expect(textarea).toHaveValue('Thank you for staying!');
    const submitBtn = screen.getByText(/Submit Response/i).closest('button');
    expect(submitBtn).not.toBeDisabled();
  });
});
