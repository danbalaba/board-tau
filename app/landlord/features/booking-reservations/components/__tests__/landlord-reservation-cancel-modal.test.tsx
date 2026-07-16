import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordReservationCancelModal } from '../landlord-reservation-cancel-modal';

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function (target, prop) {
      if (typeof prop === 'string' && prop.startsWith('Icon')) {
        return ({ "data-testid": testId, ...props }: any) => (
          <div data-testid={testId || `icon-${prop.toLowerCase()}`} {...props} />
        );
      }
      return target[prop as keyof typeof target];
    }
  });
});

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/common/Button', () => {
  return {
    __esModule: true,
    default: ({ children, onClick, 'data-testid': testId }: any) => (
      <button onClick={onClick} data-testid={testId || 'mock-button'}>{children}</button>
    )
  };
});

describe('LandlordReservationCancelModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders confirmation step initially', () => {
    render(<LandlordReservationCancelModal {...mockProps} />);
    expect(screen.getByText('Cancel Reservation?')).toBeInTheDocument();
  });

  it('moves to reason step when Confirm Revoke is clicked', async () => {
    render(<LandlordReservationCancelModal {...mockProps} />);
    const revokeBtn = screen.getByText('Confirm Revoke').closest('button');
    fireEvent.click(revokeBtn!);
    
    await waitFor(() => {
      expect(screen.getByText('Reason for Cancellation')).toBeInTheDocument();
    });
  });

  it('calls onConfirm with selected reason', async () => {
    render(<LandlordReservationCancelModal {...mockProps} />);
    
    // Go to reason step
    const revokeBtn = screen.getByText('Confirm Revoke').closest('button');
    fireEvent.click(revokeBtn!);
    
    await waitFor(() => {
      expect(screen.getByText('Reason for Cancellation')).toBeInTheDocument();
    });

    // Select reason
    const reasonBtn = screen.getByText('Double booking / System error').closest('button');
    fireEvent.click(reasonBtn!);

    // Submit
    const submitBtn = screen.getByText('Finish Cancellation').closest('button');
    fireEvent.click(submitBtn!);

    expect(mockProps.onConfirm).toHaveBeenCalledWith('Double booking / System error');
  });
});
