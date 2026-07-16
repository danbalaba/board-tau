import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandlordRoomEditModal from '../landlord-room-edit-modal';
import { useEditRoom } from '../../hooks/use-edit-room';

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

jest.mock('react-select', () => {
  return ({ options, value, onChange, placeholder }: any) => (
    <select 
      value={value ? value.value : ''} 
      onChange={(e) => onChange(options.find((o: any) => o.value === e.target.value))}
    >
      <option value="">{placeholder}</option>
    </select>
  );
});

jest.mock('../../hooks/use-edit-room');

describe('LandlordRoomEditModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockRoom = { id: 'room-1', name: 'Sample Room', amenities: [], images: [] } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (useEditRoom as jest.Mock).mockReturnValue({
      loading: false,
      uploadingImages: false,
      errors: {},
      formData: {
        name: 'Sample Room',
        roomType: 'SOLO',
        capacity: '1',
        price: '1000',
        amenities: [],
        images: []
      },
      handleChange: jest.fn(),
      handleAmenityToggle: jest.fn(),
      files: [],
      setFiles: jest.fn(),
      deletedImages: [],
      setDeletedImages: jest.fn(),
      handleSubmit: jest.fn(),
      submitted: false,
      isDirty: false,
      canUndo: false,
      handleUndo: jest.fn(),
      handleReset: jest.fn()
    });
  });

  it('renders the edit modal content', () => {
    render(
      <LandlordRoomEditModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess}
        initialData={mockRoom}
      />
    );
    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <LandlordRoomEditModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess}
        initialData={mockRoom}
      />
    );
    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
