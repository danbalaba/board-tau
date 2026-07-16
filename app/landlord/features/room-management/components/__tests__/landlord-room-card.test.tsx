import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordRoomCard } from '../landlord-room-card';

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'displayName') return 'LucideIcon';
      return () => <span data-testid={`icon-${String(prop)}`} />;
    }
  });
});

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: new Proxy({}, {
      get: (_, tag) => {
        const FakeMotionComponent = React.forwardRef(({ children, ...props }: any, ref: any) => {
          const { initial, animate, exit, transition, whileHover, whileTap, layoutId, ...validProps } = props;
          return React.createElement(tag, { ...validProps, ref }, children);
        });
        FakeMotionComponent.displayName = `MotionComponent`;
        return FakeMotionComponent;
      }
    }),
  };
});

// Mock Next Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, unoptimized, ...rest } = props;
    return <img {...rest} />;
  },
}));

describe('LandlordRoomCard', () => {
  const mockRoom = {
    id: 'room-1',
    name: 'Luxury Room',
    propertyTitle: 'Sunset Villas',
    price: 15000,
    capacity: 2,
    availableSlots: 1,
    status: 'AVAILABLE',
    roomType: 'SOLO',
    images: ['test.jpg']
  } as any;

  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnArchive = jest.fn();
  const mockOnDelete = jest.fn();

  const mockStatusColors = { AVAILABLE: 'bg-green-100 text-green-800' };
  const mockFormatStatus = (status: string) => status;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in grid mode', () => {
    render(
      <LandlordRoomCard
        idx={0}
        room={mockRoom}
        viewMode="grid"
        onView={mockOnView}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
        statusColors={mockStatusColors}
        formatStatus={mockFormatStatus}
      />
    );
    expect(screen.getByText(/Luxury Room/i)).toBeInTheDocument();
    expect(screen.getByText(/Sunset Villas/i)).toBeInTheDocument();
  });

  it('renders correctly in list mode', () => {
    render(
      <LandlordRoomCard
        idx={0}
        room={mockRoom}
        viewMode="list"
        onView={mockOnView}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
        statusColors={mockStatusColors}
        formatStatus={mockFormatStatus}
      />
    );
    expect(screen.getByText(/Luxury Room/i)).toBeInTheDocument();
    expect(screen.getByText(/15,000/i)).toBeInTheDocument();
  });

  it('calls onView when view button is clicked', () => {
    render(
      <LandlordRoomCard
        idx={0}
        room={mockRoom}
        viewMode="grid"
        onView={mockOnView}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
        statusColors={mockStatusColors}
        formatStatus={mockFormatStatus}
      />
    );
    const viewBtn = screen.getByText(/Manage/i);
    fireEvent.click(viewBtn);
    expect(mockOnView).toHaveBeenCalledWith(mockRoom);
  });
});
