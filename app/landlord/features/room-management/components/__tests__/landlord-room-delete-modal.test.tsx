import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordRoomDeleteModal } from '../landlord-room-delete-modal';

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

describe('LandlordRoomDeleteModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockRoom = {
    id: 'room-1',
    name: 'Sample Room 101',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders delete modal content', () => {
    render(
      <LandlordRoomDeleteModal
        onClose={mockOnClose}
        room={mockRoom}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );
    expect(screen.getByRole('heading', { name: /Delete Unit\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Sample Room 101/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <LandlordRoomDeleteModal 
        onClose={mockOnClose} 
        room={mockRoom}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );
    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm is clicked', () => {
    render(
      <LandlordRoomDeleteModal 
        onClose={mockOnClose} 
        room={mockRoom}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: /Delete Unit/i });
    fireEvent.click(confirmBtn);
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
