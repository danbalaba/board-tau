import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordPropertyRoomsEditor } from '../landlord-property-rooms-editor';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return true;
      return () => <div data-testid={`icon-${String(prop)}`} />;
    }
  });
});

jest.mock('../shared-ui', () => ({
  PropertyFormSection: ({ children, title }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

jest.mock('@/components/inputs/Input', () => ({ id, label, value, onChange }: any) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} value={value || ''} onChange={onChange} data-testid={`input-${id}`} />
  </div>
));

describe('LandlordPropertyRoomsEditor', () => {
  const defaultFormData = {
    rooms: [
      {
        roomType: 'SOLO',
        bedType: 'SINGLE',
        price: '5000',
        reservationFee: '1000',
        bedCount: '1',
        capacity: '1',
        size: '10',
        bathroomArrangement: 'PRIVATE_CR',
        amenities: [],
      }
    ],
  };

  it('renders correctly', () => {
    render(
      <LandlordPropertyRoomsEditor
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        onAddCustomUnitAmenity={jest.fn()}
        onOpenBulkModal={jest.fn()}
        addRoom={jest.fn()}
        removeRoom={jest.fn()}
        updateRoom={jest.fn()}
      />
    );
    expect(screen.getAllByText('Room Setup').length).toBeGreaterThan(0);
    expect(screen.getByText('Group Setup Wizard')).toBeInTheDocument();
    expect(screen.getByText('Setup All 1 Rooms')).toBeInTheDocument();
  });

  it('calls addRoom when Add Another Room is clicked', () => {
    const addRoom = jest.fn();
    render(
      <LandlordPropertyRoomsEditor
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        onAddCustomUnitAmenity={jest.fn()}
        onOpenBulkModal={jest.fn()}
        addRoom={addRoom}
        removeRoom={jest.fn()}
        updateRoom={jest.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('Add Another Room'));
    expect(addRoom).toHaveBeenCalled();
  });

  it('calls onOpenBulkModal', () => {
    const onOpenBulkModal = jest.fn();
    render(
      <LandlordPropertyRoomsEditor
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        onAddCustomUnitAmenity={jest.fn()}
        onOpenBulkModal={onOpenBulkModal}
        addRoom={jest.fn()}
        removeRoom={jest.fn()}
        updateRoom={jest.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('Setup All 1 Rooms'));
    expect(onOpenBulkModal).toHaveBeenCalled();
  });
});
