import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyConfigStep from '../PropertyConfigStep';
import { useForm } from 'react-hook-form';

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

jest.mock('@/lib/landlordTaxonomyCache', () => ({
  getSyncAttributes: () => [{ id: 'attr-1', name: 'WiFi', type: 'PROPERTY_AMENITY' }],
  getCachedAttributes: jest.fn().mockResolvedValue([{ id: 'attr-1', name: 'WiFi', type: 'PROPERTY_AMENITY' }]),
  getSyncSubGroups: () => [{ key: 'KITCHEN_APP', type: 'AMENITY', title: 'Shared Kitchen' }],
  getCachedSubGroups: jest.fn().mockResolvedValue([{ key: 'KITCHEN_APP', type: 'AMENITY', title: 'Shared Kitchen' }]),
  getSyncPropertyTypes: () => [{ id: '1', name: 'Boarding House' }],
  getCachedPropertyTypes: jest.fn().mockResolvedValue([{ id: '1', name: 'Boarding House' }]),
  getSyncRoomTypes: () => [{ value: 'SOLO', label: 'Solo Room' }],
  getCachedRoomTypes: jest.fn().mockResolvedValue([{ value: 'SOLO', label: 'Solo Room' }]),
}));

const Wrapper = () => {
  const { register, control, watch, getValues, setValue, formState: { errors } } = useForm({
    defaultValues: {
      propertyConfig: {
        totalRooms: '',
        bathroomCount: '',
        rules: [],
        features: [],
        amenities: []
      }
    }
  });

  return (
    <PropertyConfigStep
      register={register}
      control={control}
      watch={watch}
      errors={errors}
      getValues={getValues}
      setValue={setValue}
    />
  );
};

describe('PropertyConfigStep', () => {
  it('renders setup header', () => {
    render(<Wrapper />);
    expect(screen.getByText('Compound Structure & Setup Options')).toBeInTheDocument();
  });
});
