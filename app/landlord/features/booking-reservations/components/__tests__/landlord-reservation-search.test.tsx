import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordReservationSearch } from '../landlord-reservation-search';
import { ReservationRequest } from '../../hooks/use-reservation-logic';

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

const mockReservation: ReservationRequest = {
  id: 'res-1',
  listing: { id: 'list-1', title: 'Test Listing', imageSrc: '/img.jpg' },
  user: { id: 'user-1', name: 'Alice Smith', email: 'alice@example.com' },
  status: 'RESERVED',
  moveInDate: new Date('2023-01-01'),
  stayDuration: 30,
  isArchived: false,
  createdAt: new Date('2023-01-01')
};

describe('LandlordReservationSearch', () => {
  const mockSetSearchQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates input value on typing', () => {
    render(<LandlordReservationSearch searchQuery="" setSearchQuery={mockSetSearchQuery} reservations={[mockReservation]} />);
    
    const input = screen.getByPlaceholderText('Search tenant or property...');
    fireEvent.change(input, { target: { value: 'Alice' } });
    
    expect(input).toHaveValue('Alice');
  });

  it('shows clear button and clears query when clicked', () => {
    render(<LandlordReservationSearch searchQuery="Alice" setSearchQuery={mockSetSearchQuery} reservations={[mockReservation]} />);
    
    const clearBtn = screen.getByTestId('icon-iconx').parentElement;
    expect(clearBtn).toBeInTheDocument();
    
    fireEvent.click(clearBtn!);
    const input = screen.getByPlaceholderText('Search tenant or property...');
    expect(input).toHaveValue('');
    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
  });

  it('shows suggestions on focus when query matches', async () => {
    render(<LandlordReservationSearch searchQuery="Ali" setSearchQuery={mockSetSearchQuery} reservations={[mockReservation]} />);
    
    const input = screen.getByPlaceholderText('Search tenant or property...');
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
  });
});
