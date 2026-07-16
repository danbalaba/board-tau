import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordRoomSearch } from '../landlord-room-search';

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

describe('LandlordRoomSearch', () => {
  const mockProps = {
    searchQuery: '',
    setSearchQuery: jest.fn(),
    rooms: [
      { id: '1', name: 'Room 101', price: 5000 }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<LandlordRoomSearch {...mockProps} />);
    expect(screen.getByPlaceholderText(/Search rooms.../i)).toBeInTheDocument();
  });

  it('updates local query on input change', () => {
    render(<LandlordRoomSearch {...mockProps} />);
    const input = screen.getByPlaceholderText(/Search rooms.../i);
    fireEvent.change(input, { target: { value: 'Room 101' } });
    expect(input).toHaveValue('Room 101');
  });
});
