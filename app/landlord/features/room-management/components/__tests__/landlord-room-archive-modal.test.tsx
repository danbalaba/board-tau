import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordRoomArchiveModal } from '../landlord-room-archive-modal';

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

describe('LandlordRoomArchiveModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockRoom = {
    id: 'room-1',
    name: 'Sample Room 101',
    isArchived: false,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders archive modal content', () => {
    render(
      <LandlordRoomArchiveModal
        isOpen={true}
        onClose={mockOnClose}
        room={mockRoom}
        onConfirm={mockOnConfirm}
        isLoading={false}
      />
    );
    expect(screen.getByRole('heading', { name: /Archive Room Unit\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Sample Room 101/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <LandlordRoomArchiveModal
        isOpen={true}
        onClose={mockOnClose}
        room={mockRoom}
        onConfirm={mockOnConfirm}
        isLoading={false}
      />
    );
    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm is clicked', () => {
    render(
      <LandlordRoomArchiveModal
        isOpen={true}
        onClose={mockOnClose}
        room={mockRoom}
        onConfirm={mockOnConfirm}
        isLoading={false}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: /Confirm Archive/i });
    fireEvent.click(confirmBtn);
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
