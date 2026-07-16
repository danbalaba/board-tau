import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LandlordRoomDetailsModal } from '../landlord-room-details-modal';

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'displayName') return 'LucideIcon';
      return () => <span data-testid={`icon-${String(prop)}`} />;
    }
  });
});

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true
}));

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

describe('LandlordRoomDetailsModal', () => {
  const mockOnClose = jest.fn();
  const mockRoom = {
    id: 'room-1',
    name: 'Sample Room 101',
    description: 'This is a lovely sample room',
    roomType: 'SOLO',
    price: 5000,
    capacity: 2,
    availableSlots: 1,
    size: 20,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    status: 'AVAILABLE'
  } as any;

  const mockStatusColors = { AVAILABLE: 'bg-green-100 text-green-800' };
  const mockFormatStatus = (status: string) => status;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders room details', async () => {
    render(
      <LandlordRoomDetailsModal
        onClose={mockOnClose}
        room={mockRoom}
        statusColors={mockStatusColors}
        formatStatus={mockFormatStatus}
      />
    );
    
    // Fast-forward 800ms to bypass the loader
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(await screen.findByText(/Sample Room 101/i)).toBeInTheDocument();
    expect(screen.getByText(/This is a lovely sample room/i)).toBeInTheDocument();
    expect(screen.getByText(/SOLO/i)).toBeInTheDocument();
    expect(screen.getByText(/5,000/i)).toBeInTheDocument();
  });

  it('calls onClose when dismiss button is clicked', async () => {
    render(
      <LandlordRoomDetailsModal
        onClose={mockOnClose}
        room={mockRoom}
        statusColors={mockStatusColors}
        formatStatus={mockFormatStatus}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const closeBtn = await screen.findByText(/Dismiss/i);
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
