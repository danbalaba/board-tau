import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyBasicStep from '../PropertyBasicStep';
import { useForm } from 'react-hook-form';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
}));

jest.mock('lucide-react', () => ({
  Building2: () => <div data-testid="building-icon" />,
  Briefcase: () => <div />,
  LayoutGrid: () => <div />,
  Tag: () => <div />,
  MapPin: () => <div />,
  DollarSign: () => <div />,
  Info: () => <div />,
}));

const Wrapper = () => {
  const { register, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      businessInfo: {
        businessName: '',
        businessType: '',
        yearsExperience: '',
        businessDescription: ''
      },
      propertyInfo: {
        propertyName: '',
        description: '',
        price: ''
      }
    }
  });

  return (
    <PropertyBasicStep
      register={register}
      control={control}
      watch={watch}
      errors={errors}
    />
  );
};

describe('PropertyBasicStep', () => {
  it('renders business identity section', () => {
    render(<Wrapper />);
    expect(screen.getByText('Business Identity')).toBeInTheDocument();
    expect(screen.getByText('Business Details')).toBeInTheDocument();
  });

  it('renders input fields for business info', () => {
    render(<Wrapper />);
    expect(screen.getByLabelText(/Registered Business Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tell us your mission/)).toBeInTheDocument();
    expect(screen.getByText(/Business Type/)).toBeInTheDocument();
    expect(screen.getByText(/Years of Experience/)).toBeInTheDocument();
  });

  it('renders property essentials section', () => {
    render(<Wrapper />);
    expect(screen.getByText('Property Essentials')).toBeInTheDocument();
    expect(screen.getByLabelText(/Listing Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Property Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Main Starting Price/)).toBeInTheDocument();
  });

  it('allows typing into text fields', () => {
    render(<Wrapper />);
    const nameInput = screen.getByLabelText(/Registered Business Name/);
    fireEvent.change(nameInput, { target: { value: 'Test Business' } });
    expect((nameInput as HTMLInputElement).value).toBe('Test Business');
  });
});
