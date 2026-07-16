import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoomDetailsModal from '../RoomDetailsModal';

// Mock react-dom's createPortal
jest.mock('react-dom', () => {
  return {
    ...jest.requireActual('react-dom'),
    createPortal: (node: any) => node, // Just render inline for testing
  };
});

jest.mock('@/components/common/SafeImage', () => ({ src, alt }: any) => <img src={src} alt={alt} data-testid="safe-image" />);

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('RoomDetailsModal Component', () => {
  const mockRoom: any = {
    id: 'room-1',
    name: 'Master Bedroom',
    price: 5000,
    capacity: 2,
    availableSlots: 1,
    images: [{ id: 'img-1', url: 'room1.jpg' }],
    roomType: 'Bedroom',
    status: 'AVAILABLE',
    description: 'A spacious bedroom',
    size: 20,
    bedType: 'Queen',
    bedCount: 1,
    bathroomArrangement: 'Ensuite',
    amenities: ['Air Conditioning', 'WiFi'],
    reservationFee: 1000,
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    room: mockRoom,
    listingName: 'Test Listing',
    onInquire: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render if isOpen is false', () => {
    const { container } = render(<RoomDetailsModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders room details correctly when open', () => {
    render(<RoomDetailsModal {...defaultProps} />);
    expect(screen.getByText('Master Bedroom')).toBeInTheDocument();
    expect(screen.getByText('A spacious bedroom')).toBeInTheDocument();
  });

  it('displays pricing and capacity correctly', () => {
    render(<RoomDetailsModal {...defaultProps} />);
    
    // Monthly Rate
    const prices = screen.getAllByText('₱5,000');
    expect(prices.length).toBeGreaterThan(0);
    
    // Slots open
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders the "Send Inquiry" button if user is present and available', () => {
    render(<RoomDetailsModal {...defaultProps} user={{ id: 'user-1' }} />);
    const inquireBtn = screen.getByText(/Send Inquiry/i);
    expect(inquireBtn).toBeInTheDocument();
    
    fireEvent.click(inquireBtn);
    expect(defaultProps.onInquire).toHaveBeenCalled();
  });

  it('renders "Sign in to Inquire" button if user is not present', () => {
    render(<RoomDetailsModal {...defaultProps} user={undefined} />);
    expect(screen.getByText(/Sign in to Inquire/i)).toBeInTheDocument();
  });

  it('renders "No Vacancy" button if room is not available', () => {
    render(
      <RoomDetailsModal 
        {...defaultProps} 
        room={{ ...mockRoom, status: 'FULL' }} 
      />
    );
    expect(screen.getByText(/No Vacancy/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<RoomDetailsModal {...defaultProps} />);
    const closeBtn = screen.getByText(/Close/i);
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
