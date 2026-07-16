import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoomTooltip from '../RoomTooltip';

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

describe('RoomTooltip', () => {
  const mockRoom = {
    id: '1',
    name: 'Test Room',
    price: 1000,
    capacity: 2,
    availableSlots: 2,
    images: [],
    roomType: 'SOLO',
    status: 'AVAILABLE',
    size: 15,
    amenities: ['Wifi', 'AC', 'Bed', 'Cabinet'],
  };

  it('renders correctly when visible', () => {
    const onViewDetails = jest.fn();
    render(<RoomTooltip room={mockRoom} isVisible={true} onViewDetails={onViewDetails} />);
    
    expect(screen.getByText('Room Sneak Peek')).toBeInTheDocument();
    expect(screen.getByText('SOLO')).toBeInTheDocument();
    expect(screen.getByText('2 Full Capacity')).toBeInTheDocument();
    expect(screen.getByText('15 sq.m.')).toBeInTheDocument();
    
    expect(screen.getByText('Wifi')).toBeInTheDocument();
    expect(screen.getByText('AC')).toBeInTheDocument();
    expect(screen.getByText('Bed')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument(); // 4th amenity
  });

  it('renders nothing when not visible', () => {
    const { container } = render(<RoomTooltip room={mockRoom} isVisible={false} onViewDetails={jest.fn()} />);
    
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onViewDetails when clicking View Details', () => {
    const onViewDetails = jest.fn();
    render(<RoomTooltip room={mockRoom} isVisible={true} onViewDetails={onViewDetails} />);
    
    fireEvent.click(screen.getByText(/View Details/));
    expect(onViewDetails).toHaveBeenCalled();
  });
});
