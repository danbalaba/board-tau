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

jest.mock('../CustomSharedAmenityModal', () => () => <div data-testid="custom-amenity-modal" />);
jest.mock('../CustomRuleModal', () => () => <div data-testid="custom-rule-modal" />);
jest.mock('../CustomFeatureModal', () => () => <div data-testid="custom-feature-modal" />);

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
    expect(screen.getByText('Property Setup')).toBeInTheDocument();
  });

  it('renders structure inputs', () => {
    render(<Wrapper />);
    expect(screen.getByLabelText(/Total Rooms Available/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Common Bathrooms/)).toBeInTheDocument();
  });

  it('renders rules and preferences', () => {
    render(<Wrapper />);
    expect(screen.getByText('Rules & Preferences')).toBeInTheDocument();
    expect(screen.getByText(/Tenant Selection/)).toBeInTheDocument();
    // Default rules from RULE_LIST should appear
  });

  it('renders premium features', () => {
    render(<Wrapper />);
    expect(screen.getByText('Premium Features (Search Boosters)')).toBeInTheDocument();
  });

  it('renders shared amenities', () => {
    render(<Wrapper />);
    expect(screen.getByText('Shared Amenities')).toBeInTheDocument();
  });

  it('opens custom rule modal', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Add Custom Rule'));
    expect(screen.getByTestId('custom-rule-modal')).toBeInTheDocument();
  });

  it('opens custom feature modal', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Add Custom Feature'));
    expect(screen.getByTestId('custom-feature-modal')).toBeInTheDocument();
  });

  it('opens custom amenity modal', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Add Property Amenity'));
    expect(screen.getByTestId('custom-amenity-modal')).toBeInTheDocument();
  });
});
