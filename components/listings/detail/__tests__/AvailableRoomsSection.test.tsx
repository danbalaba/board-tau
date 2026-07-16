import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AvailableRoomsSection from '../AvailableRoomsSection';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({ error: toast.error }),
}));

jest.mock('@/components/modals/Modal', () => {
  return function MockModal({ children, isOpen }: any) {
    if (!isOpen) return null;
    return <div data-testid="auth-modal">{children}</div>;
  };
});

jest.mock('@/components/modals/InquiryModal', () => {
  return function MockInquiryModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="inquiry-modal">
        <button onClick={onClose}>Close Inquiry</button>
      </div>
    );
  };
});

jest.mock('@/components/modals/AuthModal', () => () => <div data-testid="auth-modal-content">AuthModal Content</div>);

jest.mock('../AllRoomsModal', () => {
  return function MockAllRoomsModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return <div data-testid="all-rooms-modal"><button onClick={onClose}>Close AllRooms</button></div>;
  };
});

jest.mock('../RoomDetailsModal', () => {
  return function MockRoomDetailsModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return <div data-testid="room-details-modal"><button onClick={onClose}>Close Details</button></div>;
  };
});

jest.mock('../RoomTooltip', () => () => <div data-testid="room-tooltip" />);
jest.mock('@/components/common/SafeImage', () => () => <div data-testid="safe-image" />);

describe('AvailableRoomsSection', () => {
  const mockRooms = [
    {
      id: '1',
      name: 'Solo 1',
      price: 1500,
      capacity: 1,
      availableSlots: 1,
      images: [],
      roomType: 'SOLO',
      status: 'AVAILABLE',
      reservationFee: 500,
    },
    {
      id: '2',
      name: 'Bedspace 1',
      price: 1000,
      capacity: 4,
      availableSlots: 4,
      images: [],
      roomType: 'BEDSPACE',
      status: 'AVAILABLE',
      reservationFee: 500,
    },
    {
      id: '3',
      name: 'Solo 2',
      price: 2000,
      capacity: 1,
      availableSlots: 0,
      images: [],
      roomType: 'SOLO',
      status: 'UNAVAILABLE',
      reservationFee: 500,
    },
    { id: '4', name: 'Solo 4', price: 2000, capacity: 1, availableSlots: 1, images: [], roomType: 'SOLO', status: 'AVAILABLE', reservationFee: 500 },
    { id: '5', name: 'Solo 5', price: 2000, capacity: 1, availableSlots: 1, images: [], roomType: 'SOLO', status: 'AVAILABLE', reservationFee: 500 },
    { id: '6', name: 'Solo 6', price: 2000, capacity: 1, availableSlots: 1, images: [], roomType: 'SOLO', status: 'AVAILABLE', reservationFee: 500 },
    { id: '7', name: 'Solo 7', price: 2000, capacity: 1, availableSlots: 1, images: [], roomType: 'SOLO', status: 'AVAILABLE', reservationFee: 500 },
  ];

  const defaultProps = {
    rooms: mockRooms,
    listingId: 'listing1',
    landlordId: 'landlord1',
    listingName: 'Test Listing',
    onSubmit: jest.fn(),
    isLoading: false,
    user: { id: 'user1' },
    activeStay: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));
    // Mock scrollBy for horizontal scrolling
    Element.prototype.scrollBy = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('renders tabs based on available room types', () => {
    render(<AvailableRoomsSection {...defaultProps} />);
    
    expect(screen.getByText('Private Solo Rooms')).toBeInTheDocument();
    expect(screen.getByText('Shared Bedspaces')).toBeInTheDocument();
  });

  it('shows only solo rooms by default (since they exist)', () => {
    render(<AvailableRoomsSection {...defaultProps} />);
    
    expect(screen.getByText('Solo 1')).toBeInTheDocument();
    expect(screen.queryByText('Bedspace 1')).not.toBeInTheDocument();
  });

  it('switches to bedspace tab', () => {
    render(<AvailableRoomsSection {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Shared Bedspaces'));
    
    expect(screen.getByText('Bedspace 1')).toBeInTheDocument();
    expect(screen.queryByText('Solo 1')).not.toBeInTheDocument();
  });

  it('shows View All Rooms button if more than 5 rooms of active tab', () => {
    render(<AvailableRoomsSection {...defaultProps} />);
    
    expect(screen.getByText('View All Rooms')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('View All Rooms'));
    expect(screen.getByTestId('all-rooms-modal')).toBeInTheDocument();
  });

  it('opens details modal when Preview is clicked', () => {
    render(<AvailableRoomsSection {...defaultProps} />);
    
    const previewBtns = screen.getAllByText('Preview');
    fireEvent.click(previewBtns[0]);
    
    expect(screen.getByTestId('room-details-modal')).toBeInTheDocument();
  });

  it('opens inquiry modal when Inquire Now is clicked for authenticated user', () => {
    render(<AvailableRoomsSection {...defaultProps} />);
    
    // The first room is Solo 1 (AVAILABLE)
    const inquireBtns = screen.getAllByText('Inquire Now');
    fireEvent.click(inquireBtns[0]);
    
    expect(screen.getByTestId('inquiry-modal')).toBeInTheDocument();
  });

  it('shows auth modal when Inquire Now is clicked for unauthenticated user', () => {
    render(<AvailableRoomsSection {...defaultProps} user={null} />);
    
    const inquireBtns = screen.getAllByText('Inquire Now');
    fireEvent.click(inquireBtns[0]);
    
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Please sign in to send your inquiry.');
  });
});
