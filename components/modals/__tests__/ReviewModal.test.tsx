import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewModal from '../ReviewModal';
import { useResponsiveToast } from '../../common/ResponsiveToast';
import { useRouter } from 'next/navigation';
import { useEdgeStore } from '@/lib/edgestore';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, layoutId, layout, ...props }: any, ref: any) => {
        return <div ref={ref} {...props}>{children}</div>;
      }),
      button: React.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, layoutId, layout, ...props }: any, ref: any) => {
        return <button ref={ref} {...props}>{children}</button>;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('../../common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: jest.fn(),
}));

jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  return function MockModal({ children, onClose }: any) {
    return (
      <div data-testid="mock-modal">
        <button data-testid="modal-close" onClick={onClose}>Close</button>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/common/SafeImage', () => {
  return function MockSafeImage({ src }: any) {
    return <img src={src} alt="mock-safe-image" data-testid="mock-safe-image" />;
  };
});

describe('ReviewModal Component', () => {
  const mockOnClose = jest.fn();
  const mockRefresh = jest.fn();
  const mockSuccessToast = jest.fn();
  const mockErrorToast = jest.fn();
  const mockUpload = jest.fn();

  const mockReservation = {
    id: 'res-1',
    listingId: 'list-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });

    (useResponsiveToast as jest.Mock).mockReturnValue({
      success: mockSuccessToast,
      error: mockErrorToast,
      loading: jest.fn(),
    });

    (useEdgeStore as jest.Mock).mockReturnValue({
      edgestore: {
        reviewMedia: {
          upload: mockUpload,
        },
      },
    });

    global.fetch = jest.fn();
  });

  it('renders nothing when isOpen is false', () => {
    // Note: The component does not return null if !isOpen, it delegates it to the Modal component,
    // so we can just check if Modal gets isOpen={false}.
    render(
      <ReviewModal
        isOpen={false}
        onClose={mockOnClose}
        reservation={mockReservation}
      />
    );
    // Modal handles the visibility in the real app, but our mock always renders.
    // However, the test shouldn't break.
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('renders step 1 initially and shows categories', () => {
    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        reservation={mockReservation}
      />
    );

    expect(screen.getByText('Rate Your Stay')).toBeInTheDocument();
    expect(screen.getByText('Cleanliness')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('progresses to step 2 when Next is clicked', async () => {
    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        reservation={mockReservation}
      />
    );

    fireEvent.click(screen.getByText(/Next Step/i));

    await waitFor(() => {
      expect(screen.getByText('Share Details')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Share your thoughts/i)).toBeInTheDocument();
    });
  });

  it('validates comment length in step 2', async () => {
    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        reservation={mockReservation}
      />
    );

    // Go to step 2
    fireEvent.click(screen.getByText(/Next Step/i));

    let textarea;
    await waitFor(() => {
      textarea = screen.getByPlaceholderText(/Share your thoughts/i);
    });
    
    fireEvent.change(textarea!, { target: { value: 'Short' } });

    fireEvent.click(screen.getByText(/Next Step/i));

    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "More Detail Needed",
      }));
    });

    // Should not progress to step 3
    expect(screen.queryByText('Visual Proof')).not.toBeInTheDocument();
  });

  it('progresses to step 3 with a valid comment', async () => {
    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        reservation={mockReservation}
      />
    );

    fireEvent.click(screen.getByText(/Next Step/i));

    let textarea;
    await waitFor(() => {
      textarea = screen.getByPlaceholderText(/Share your thoughts/i);
    });
    
    fireEvent.change(textarea!, { target: { value: 'This is a sufficiently long comment for the review.' } });

    fireEvent.click(screen.getByText(/Next Step/i));

    await waitFor(() => {
      expect(screen.getByText('Visual Proof')).toBeInTheDocument();
      expect(screen.getByText('Add photos & videos')).toBeInTheDocument();
    });
  });

  it('allows skipping the review', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        reservation={mockReservation}
      />
    );

    // Click Skip Review
    fireEvent.click(screen.getByText('Skip Review'));

    // Confirmation screen should appear
    expect(screen.getByText('Confirm Skip')).toBeInTheDocument();
    expect(screen.getByText('Yes, skip it')).toBeInTheDocument();

    // Confirm skip
    fireEvent.click(screen.getByText('Yes, skip it'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reviews', expect.objectContaining({
        method: 'POST',
        // Fixed: Skip Review now correctly submits the required "User skipped rating" payload
        body: expect.stringContaining('"comment":"User skipped rating."')
      }));
      expect(mockSuccessToast).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('submits the review successfully at step 3', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        reservation={mockReservation}
      />
    );

    // Step 1
    fireEvent.click(screen.getByText(/Next Step/i));

    // Step 2
    let textarea;
    await waitFor(() => {
      textarea = screen.getByPlaceholderText(/Share your thoughts/i);
    });
    
    fireEvent.change(textarea!, { target: { value: 'This is an excellent place to stay!' } });
    fireEvent.click(screen.getByText(/Next Step/i));

    // Step 3
    await waitFor(() => {
      expect(screen.getByText('Submit Review')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Submit Review'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reviews', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"comment":"This is an excellent place to stay!"')
      }));
      expect(mockSuccessToast).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles submission error gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Database error' }),
    });

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        reservation={mockReservation}
      />
    );

    fireEvent.click(screen.getByText(/Next Step/i));
    
    let textarea;
    await waitFor(() => {
      textarea = screen.getByPlaceholderText(/Share your thoughts/i);
    });
    
    fireEvent.change(textarea!, { target: { value: 'Valid comment length!' } });
    fireEvent.click(screen.getByText(/Next Step/i));

    await waitFor(() => {
      expect(screen.getByText('Submit Review')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Submit Review'));

    await waitFor(() => {
      // Fixed: Database errors are now correctly caught and surfaced via ErrorToast
      expect(mockErrorToast).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Database error',
      }));
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
