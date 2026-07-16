import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordRoomAddModal } from '../landlord-room-add-modal';
import { useAddRoomModal } from '../../hooks/use-add-room-modal';

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

jest.mock('../../hooks/use-add-room-modal');

describe('LandlordRoomAddModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAddRoomModal as jest.Mock).mockReturnValue({
      currentStep: 1,
      loading: false,
      uploadingImages: false,
      errors: {},
      files: [],
      formData: {
        listingId: '',
        name: '',
        roomType: '',
        capacity: '',
        price: '',
      },
      setFormData: jest.fn(),
      handleChange: jest.fn(),
      handleCategoryToggle: jest.fn(),
      handleFileChange: jest.fn(),
      removeFile: jest.fn(),
      handleNext: jest.fn(),
      handleBack: jest.fn(),
      handleSubmit: jest.fn(),
      submitted: false
    });
  });

  it('renders the add modal content step 1', () => {
    render(<LandlordRoomAddModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} uniqueProperties={[{ id: 'p1', title: 'Property 1' }]} />);
    expect(screen.getByText(/Next Step/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(<LandlordRoomAddModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} uniqueProperties={[{ id: 'p1', title: 'Property 1' }]} />);
    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
