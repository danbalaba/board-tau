import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LandlordInquiryDeclineModal } from '../landlord-inquiry-decline-modal';
import { useIsClient } from '@/hooks/useIsClient';

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: jest.fn()
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, ...rest } = props;
        return <div ref={ref} {...rest}>{children}</div>;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('@tabler/icons-react', () => ({
  IconX: () => <div data-testid="icon-x" />,
  IconLoader2: () => <div data-testid="icon-loader" />
}));

describe('LandlordInquiryDeclineModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn().mockResolvedValue(undefined);
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useIsClient as jest.Mock).mockReturnValue(true);
  });

  it('renders correctly when open', () => {
    render(<LandlordInquiryDeclineModal {...defaultProps} />);
    expect(screen.getByText('Decline Inquiry')).toBeInTheDocument();
    expect(screen.getByText('Room no longer available')).toBeInTheDocument();
    expect(screen.getByText('Write a custom reason...')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<LandlordInquiryDeclineModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Decline Inquiry')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<LandlordInquiryDeclineModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables confirm button initially', () => {
    render(<LandlordInquiryDeclineModal {...defaultProps} />);
    expect(screen.getByText('Confirm Decline')).toBeDisabled();
  });

  it('enables confirm button when a quick reason is selected', () => {
    render(<LandlordInquiryDeclineModal {...defaultProps} />);
    const quickReason = screen.getByText('Room no longer available');
    
    fireEvent.click(quickReason);
    
    expect(screen.getByText('Confirm Decline')).not.toBeDisabled();
  });

  it('calls onConfirm with the selected quick reason', async () => {
    render(<LandlordInquiryDeclineModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Room no longer available'));
    
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Decline'));
    });
    
    expect(mockOnConfirm).toHaveBeenCalledWith('Room no longer available');
  });

  it('enables confirm button when custom reason is typed', async () => {
    render(<LandlordInquiryDeclineModal {...defaultProps} />);
    
    // Toggle custom reason
    fireEvent.click(screen.getByText('Write a custom reason...'));
    
    const textarea = screen.getByPlaceholderText('Describe your reason here...');
    fireEvent.change(textarea, { target: { value: 'This is a custom decline reason' } });
    
    expect(screen.getByText('Confirm Decline')).not.toBeDisabled();
    
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Decline'));
    });
    
    expect(mockOnConfirm).toHaveBeenCalledWith('This is a custom decline reason');
  });

  it('shows loading state on confirm button when isLoading is true', () => {
    render(<LandlordInquiryDeclineModal {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Declining...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /declining/i })).toBeDisabled();
  });
});
