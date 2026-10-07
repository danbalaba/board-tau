import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WalkInPaymentStep from '../steps/walk-in-payment-step';
import { format } from 'date-fns';

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockListings = [
  {
    id: 'list-1',
    rooms: [
      { id: 'room-1', capacity: 4, availableSlots: 4, price: 1000, reservationFee: 1000, roomType: 'BEDSPACE' }
    ]
  }
];

describe('WalkInPaymentStep', () => {
  const mockSetValue = jest.fn();
  const mockSetDateRange = jest.fn();
  const mockSetShowCalendar = jest.fn();

  const createProps = (overrides = {}) => {
    const formState: Record<string, any> = {
      listingId: 'list-1',
      roomId: 'room-1',
      paymentType: 'DIRECT_RENT',
      isSoloBuyout: false,
      occupantsCount: 1,
    };

    const mockWatch = jest.fn((key: string) => formState[key]);
    const mockGetValues = jest.fn((key: string) => formState[key]);
    const customSetValue = jest.fn((key: string, val: any, opts?: any) => {
      formState[key] = val;
      mockSetValue(key, val, opts);
    });

    return {
      setValue: customSetValue as any,
      watch: mockWatch as any,
      getValues: mockGetValues as any,
      errors: {},
      listings: mockListings,
      dateRange: { from: new Date('2023-01-01'), to: new Date('2023-01-05') },
      setDateRange: mockSetDateRange,
      showCalendar: false,
      setShowCalendar: mockSetShowCalendar,
      ...overrides
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<WalkInPaymentStep {...createProps()} />);
    expect(screen.getByText('Step 3: Stay & Payment Setup')).toBeInTheDocument();
    expect(screen.getByText('Rent Entire Room (Solo Occupancy Buyout)')).toBeInTheDocument();
  });

  it('toggles calendar when stay range is clicked', () => {
    render(<WalkInPaymentStep {...createProps()} />);
    const stayRangeDiv = screen.getByText(/Jan 01, 2023/i).closest('div.group');
    fireEvent.click(stayRangeDiv!);
    expect(mockSetShowCalendar).toHaveBeenCalledWith(true);
  });

  it('clears dates when close button is clicked', () => {
    render(<WalkInPaymentStep {...createProps()} />);
    const clearBtn = screen.getByTitle('Clear dates');
    fireEvent.click(clearBtn);
    expect(mockSetDateRange).toHaveBeenCalledWith({ from: undefined, to: undefined });
    expect(mockSetValue).toHaveBeenCalledWith('moveInDate', '', { shouldValidate: true });
  });

  it('handles solo buyout toggle', () => {
    const props = createProps({
      watch: (key: string) => {
        if (key === 'listingId') return 'list-1';
        if (key === 'roomId') return 'room-1';
        if (key === 'paymentType') return 'DIRECT_RENT';
        if (key === 'isSoloBuyout') return true;
        return null;
      }
    });
    render(<WalkInPaymentStep {...props} />);
    expect(mockSetValue).toHaveBeenCalledWith('totalPrice', 4000, { shouldValidate: true });
  });
});
