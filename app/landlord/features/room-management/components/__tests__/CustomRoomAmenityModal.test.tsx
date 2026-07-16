import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomRoomAmenityModal from '../CustomRoomAmenityModal';

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

describe('CustomRoomAmenityModal', () => {
  const mockOnAddAmenity = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal content correctly', () => {
    render(<CustomRoomAmenityModal onClose={mockOnClose} onAddAmenity={mockOnAddAmenity} />);
    expect(screen.getByText(/Advanced Room Feature/i)).toBeInTheDocument();
  });

  it('calls onAddAmenity when submitted', () => {
    render(<CustomRoomAmenityModal onClose={mockOnClose} onAddAmenity={mockOnAddAmenity} />);
    const input = screen.getByPlaceholderText(/e.g. Balcony, Study Corner/i);
    fireEvent.change(input, { target: { value: 'Free Breakfast' } });
    
    const submitBtn = screen.getByText(/Confirm & Add/i);
    fireEvent.click(submitBtn);
    
    // Expects custom amenity format: "name|icon"
    expect(mockOnAddAmenity).toHaveBeenCalledWith('Free Breakfast|HelpCircle');
  });

  it('calls onClose when cancel is clicked', () => {
    render(<CustomRoomAmenityModal onClose={mockOnClose} onAddAmenity={mockOnAddAmenity} />);
    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
