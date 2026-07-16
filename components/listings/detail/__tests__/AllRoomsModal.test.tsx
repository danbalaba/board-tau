import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AllRoomsModal from '../AllRoomsModal';
import { toast } from 'react-hot-toast';

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@/components/modals/Modal', () => {
  return function MockModal({ children, isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        {children}
        <button data-testid="modal-close" onClick={onClose}>Close Mock Modal</button>
      </div>
    );
  };
});

jest.mock('@/components/common/SafeImage', () => ({ src, alt }: any) => (
  <img src={src} alt={alt} data-testid="safe-image" />
));

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock ModernSlider because it might use things not supported in JSDOM or just simpler to mock
jest.mock('@/components/common/ModernSlider', () => ({
  ModernSlider: ({ min, max, value, onValueChange }: any) => (
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value[0]} 
      onChange={(e) => onValueChange([Number(e.target.value)])}
      data-testid="modern-slider"
    />
  ),
}));

describe('AllRoomsModal', () => {
  const mockRooms = [
    {
      id: '1',
      name: 'Room A',
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
      name: 'Room B',
      price: 1000,
      capacity: 4,
      availableSlots: 0,
      images: [],
      roomType: 'BEDSPACE',
      status: 'UNAVAILABLE',
      reservationFee: 500,
    },
  ];

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    rooms: mockRooms,
    listingName: 'Test Listing',
    listingId: '123',
    onSubmit: jest.fn(),
    isLoading: false,
    user: { id: 'u1' },
    onViewDetails: jest.fn(),
    onInquire: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if isOpen is false', () => {
    const { container } = render(<AllRoomsModal {...mockProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders rooms correctly', () => {
    render(<AllRoomsModal {...mockProps} />);
    
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.getByText('Room B')).toBeInTheDocument();
    expect(screen.getByText('₱1,500')).toBeInTheDocument();
    expect(screen.getByText('₱1,000')).toBeInTheDocument();
  });

  it('filters rooms by room type', () => {
    render(<AllRoomsModal {...mockProps} />);
    
    // Toggle filters open
    fireEvent.click(screen.getByRole('button', { name: /Filters/i }));
    
    // Find the dropdown for room type
    // Since we didn't mock the dropdown fully, we can interact with it
    const dropdownBtns = screen.getAllByRole('button');
    // The Room Type dropdown is usually the second dropdown, or we can look for text
    const roomTypeDropdown = screen.getByText('All Types');
    fireEvent.click(roomTypeDropdown);
    
    const soloOption = screen.getByText('Solo Room');
    fireEvent.click(soloOption);
    
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.queryByText('Room B')).not.toBeInTheDocument();
  });

  it('calls onViewDetails when clicking Details button', () => {
    render(<AllRoomsModal {...mockProps} />);
    
    const detailsBtns = screen.getAllByText('Details');
    fireEvent.click(detailsBtns[0]);
    
    expect(mockProps.onViewDetails).toHaveBeenCalledWith(mockRooms[1]);
  });

  it('calls onInquire when clicking Inquire button on available room', () => {
    render(<AllRoomsModal {...mockProps} />);
    
    const inquireBtn = screen.getByText('Inquire');
    fireEvent.click(inquireBtn);
    
    expect(mockProps.onInquire).toHaveBeenCalledWith(mockRooms[0]);
  });

  it('disables inquire button for unavailable room', () => {
    render(<AllRoomsModal {...mockProps} />);
    
    const fullBtn = screen.getByRole('button', { name: 'Full' });
    expect(fullBtn).toBeDisabled();
  });

  it('shows error toast when inquiring without user', () => {
    render(<AllRoomsModal {...mockProps} user={null} />);
    
    const inquireBtn = screen.getByText('Inquire');
    fireEvent.click(inquireBtn);
    
    expect(toast.error).toHaveBeenCalledWith('Please log in to inquire');
    expect(mockProps.onInquire).not.toHaveBeenCalled();
  });
});
