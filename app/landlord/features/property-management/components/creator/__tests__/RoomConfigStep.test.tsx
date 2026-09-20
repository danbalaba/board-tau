import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomConfigStep from '../RoomConfigStep';
import { useForm, useFieldArray } from 'react-hook-form';

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

jest.mock('../BulkConfigureModal', () => ({ onApply, onClose }: any) => (
  <div data-testid="bulk-modal">
    <button onClick={() => onApply({ roomType: 'SOLO', bedCount: '1' })}>Apply</button>
  </div>
));

jest.mock('@/lib/landlordTaxonomyCache', () => ({
  getSyncAttributes: () => [{ id: 'attr-1', name: 'WiFi', type: 'ROOM_AMENITY' }],
  getCachedAttributes: jest.fn().mockResolvedValue([{ id: 'attr-1', name: 'WiFi', type: 'ROOM_AMENITY' }]),
  getSyncSubGroups: () => [{ key: 'KITCHEN_APP', type: 'AMENITY', title: 'Shared Kitchen' }],
  getCachedSubGroups: jest.fn().mockResolvedValue([{ key: 'KITCHEN_APP', type: 'AMENITY', title: 'Shared Kitchen' }]),
  getSyncRoomTypes: () => [{ value: 'SOLO', label: 'Solo Room', isFlatRate: true }],
  getCachedRoomTypes: jest.fn().mockResolvedValue([{ value: 'SOLO', label: 'Solo Room', isFlatRate: true }]),
  getSyncPropertyTypes: () => [{ id: '1', name: 'Boarding House' }],
  getCachedPropertyTypes: jest.fn().mockResolvedValue([{ id: '1', name: 'Boarding House' }]),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
}));

const Wrapper = () => {
  const { register, control, watch, getValues, setValue, formState: { errors } } = useForm({
    defaultValues: {
      propertyConfig: {
        bathroomCount: '1',
        totalRooms: '1',
        rooms: [
          {
            roomType: 'SOLO',
            bathroomArrangement: '',
            price: '',
            bedType: 'SINGLE',
            bedCount: '1',
            capacity: '1',
            size: '',
            availableSlots: '1',
            reservationFee: '',
            description: '',
            amenities: [],
          }
        ]
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'propertyConfig.rooms'
  });

  return (
    <RoomConfigStep
      register={register}
      control={control}
      watch={watch}
      errors={errors}
      getValues={getValues}
      setValue={setValue}
      fields={fields}
      append={append as any}
      remove={remove}
    />
  );
};

describe('RoomConfigStep', () => {
  it('renders correctly with one room', () => {
    render(<Wrapper />);
    expect(screen.getByText('Bulk Configuration')).toBeInTheDocument();
    expect(screen.getByText(/1 Details/)).toBeInTheDocument();
  });
});
