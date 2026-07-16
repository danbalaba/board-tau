import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordPropertyBasicsForm } from '../landlord-property-basics-form';

jest.mock('lucide-react', () => ({
  Type: () => <div />,
  DollarSign: () => <div />,
  Bed: () => <div />,
  Bath: () => <div />,
  Tag: () => <div />,
  AlertCircle: () => <div />,
}));

jest.mock('../shared-ui', () => ({
  PropertyFormSection: ({ children, title }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

jest.mock('@/components/inputs/Input', () => ({ id, label, value, onChange, type }: any) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} type={type || 'text'} value={value || ''} onChange={onChange} data-testid={`input-${id}`} />
  </div>
));

jest.mock('@/components/inputs/Textarea', () => ({ id, label, value, onChange }: any) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <textarea id={id} value={value || ''} onChange={onChange} data-testid={`textarea-${id}`} />
  </div>
));

jest.mock('react-select', () => ({ options, onChange, value }: any) => (
  <select
    data-testid="react-select"
    onChange={(e) => onChange(options.find((o: any) => o.value === e.target.value))}
    value={value?.value || ''}
  >
    <option value="">Select...</option>
    {options.map((o: any) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
));

describe('LandlordPropertyBasicsForm', () => {
  const defaultFormData = {
    title: '',
    category: '',
    totalRooms: '',
    bathroomCount: '',
    price: '',
    description: '',
  };

  it('renders correctly', () => {
    render(
      <LandlordPropertyBasicsForm
        formData={defaultFormData}
        setFormData={jest.fn()}
        errors={{}}
        setActiveSection={jest.fn()}
      />
    );
    expect(screen.getByText('Property Basics')).toBeInTheDocument();
    expect(screen.getByLabelText('Property Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Listing Description')).toBeInTheDocument();
  });

  it('calls setFormData on input change', () => {
    const setFormData = jest.fn();
    render(
      <LandlordPropertyBasicsForm
        formData={defaultFormData}
        setFormData={setFormData}
        errors={{}}
        setActiveSection={jest.fn()}
      />
    );

    const titleInput = screen.getByTestId('input-title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(setFormData).toHaveBeenCalled();
  });
});
