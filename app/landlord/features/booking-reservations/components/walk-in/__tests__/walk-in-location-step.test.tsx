import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WalkInLocationStep from '../steps/walk-in-location-step';

jest.mock('@/components/common/SafeImage', () => {
  return {
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="mock-safe-image" />
  };
});

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
    button: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
      return <button ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockListings = [
  {
    id: 'list-1',
    title: 'Sunny Apartment',
    imageSrc: '/img.jpg',
    rooms: [
      { id: 'room-1', name: 'Room A', status: 'AVAILABLE', availableSlots: 2, roomType: 'BEDSPACE', reservationFee: 1000 },
      { id: 'room-2', name: 'Room B', status: 'FULL', availableSlots: 0, roomType: 'PRIVATE', reservationFee: 5000 }
    ]
  }
];

describe('WalkInLocationStep', () => {
  const mockRegister = jest.fn();
  const mockSetValue = jest.fn();
  const mockWatch = jest.fn((key: string) => {
    if (key === 'listingId') return 'list-1';
    if (key === 'roomId') return 'room-1';
    return null;
  });

  const mockProps = {
    listings: mockListings,
    register: mockRegister as any,
    errors: {},
    setValue: mockSetValue as any,
    watch: mockWatch as any
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders listings and rooms based on selection', () => {
    render(<WalkInLocationStep {...mockProps} />);
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument();
    expect(screen.getByText('Room A')).toBeInTheDocument();
    
    // FULL rooms should not be shown
    expect(screen.queryByText('Room B')).not.toBeInTheDocument();
  });

  it('filters listings on search', () => {
    render(<WalkInLocationStep {...mockProps} />);
    const propertySearch = screen.getByPlaceholderText('Search properties...');
    fireEvent.change(propertySearch, { target: { value: 'None' } });
    
    expect(screen.queryByText('Sunny Apartment')).not.toBeInTheDocument();
    expect(screen.getByText(/No properties found matching/i)).toBeInTheDocument();
  });

  it('calls setValue when listing is clicked', () => {
    render(<WalkInLocationStep {...mockProps} />);
    const listingDiv = screen.getByText('Sunny Apartment').closest('div');
    fireEvent.click(listingDiv!);
    expect(mockSetValue).toHaveBeenCalledWith('listingId', 'list-1', { shouldValidate: true });
    expect(mockSetValue).toHaveBeenCalledWith('roomId', '', { shouldValidate: true });
  });

  it('calls setValue when room is clicked', () => {
    render(<WalkInLocationStep {...mockProps} />);
    const roomDiv = screen.getByText('Room A').closest('div');
    fireEvent.click(roomDiv!);
    expect(mockSetValue).toHaveBeenCalledWith('roomId', 'room-1', { shouldValidate: true });
  });
});
