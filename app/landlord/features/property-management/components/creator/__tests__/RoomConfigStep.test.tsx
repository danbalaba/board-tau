import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomConfigStep from '../RoomConfigStep';
import { useForm, useFieldArray } from 'react-hook-form';
import { ROOM_TYPES } from '@/data/roomTypes';

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

jest.mock('../CustomAmenityModal', () => () => <div data-testid="custom-amenity-modal" />);
jest.mock('../BulkConfigureModal', () => ({ onApply, onClose }: any) => (
  <div data-testid="bulk-modal">
    <button onClick={() => onApply({ roomType: ROOM_TYPES.SOLO, bedCount: '1' })}>Apply</button>
  </div>
));

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
            roomType: ROOM_TYPES.SOLO,
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
    expect(screen.getByText('Individual Room Setup')).toBeInTheDocument();
    expect(screen.getByText('Room Details')).toBeInTheDocument();
    expect(screen.getByLabelText(/Price \(PHP\)/i)).toBeInTheDocument();
  });

  it('adds a new unit', async () => {
    render(<Wrapper />);
    const addBtn = screen.getByText('Add New Unit');
    fireEvent.click(addBtn);
    
    await waitFor(() => {
      // The second room details should appear
      expect(screen.getAllByText('Room Details').length).toBe(2);
    });
  });

  it('can open bulk configure modal', () => {
    render(<Wrapper />);
    const bulkBtn = screen.getByText(/Configure All/);
    fireEvent.click(bulkBtn);
    expect(screen.getByTestId('bulk-modal')).toBeInTheDocument();
  });

  it('applies bulk config', async () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText(/Configure All/));
    fireEvent.click(screen.getByText('Apply'));
    
    // Simulate loading and close
    await waitFor(() => {
      expect(screen.queryByTestId('bulk-modal')).not.toBeInTheDocument();
    }, { timeout: 1500 });
  });

  it('copies and pastes configuration', () => {
    render(<Wrapper />);
    
    // Title attribute identifies the copy button
    const copyBtn = screen.getByTitle('Copy configuration');
    fireEvent.click(copyBtn);
    
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    const pasteBtn = screen.getByTitle('Paste configuration');
    fireEvent.click(pasteBtn);
  });
});
