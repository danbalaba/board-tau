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
      { id: 'room-1', capacity: 4, availableSlots: 4, reservationFee: 1000, roomType: 'BEDSPACE' }
    ]
  }
];

describe('WalkInPaymentStep', () => {
  const mockSetValue = jest.fn();
  const mockSetDateRange = jest.fn();
  const mockSetShowCalendar = jest.fn();
  
  const defaultGetValues = (key: string) => {
    if (key === 'occupantsCount') return 1;
    return null;
  };

  const defaultWatch = (key: string) => {
    if (key === 'listingId') return 'list-1';
    if (key === 'roomId') return 'room-1';
    if (key === 'isSoloBuyout') return false;
    return null;
  };

  const createProps = (overrides = {}) => ({
    setValue: mockSetValue as any,
    watch: defaultWatch as any,
    getValues: defaultGetValues as any,
    errors: {},
    listings: mockListings,
    dateRange: { from: new Date('2023-01-01'), to: new Date('2023-01-05') },
    setDateRange: mockSetDateRange,
    showCalendar: false,
    setShowCalendar: mockSetShowCalendar,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<WalkInPaymentStep {...createProps()} />);
    expect(screen.getByText('Step 5: Stay Details & Payment')).toBeInTheDocument();
    expect(screen.getByText('Rent Entire Room (Solo Occupancy)')).toBeInTheDocument();
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
    render(<WalkInPaymentStep {...createProps()} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // It should update isSoloBuyout, occupantsCount to 1, and total price to capacity * fee
    expect(mockSetValue).toHaveBeenCalledWith('isSoloBuyout', true, { shouldValidate: true });
    expect(mockSetValue).toHaveBeenCalledWith('occupantsCount', 1, { shouldValidate: true });
    expect(mockSetValue).toHaveBeenCalledWith('totalPrice', 4000, { shouldValidate: true }); // 4 * 1000
  });
});
