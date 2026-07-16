import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordPropertyLocationForm } from '../landlord-property-location-form';
import { reverseGeocode } from '@/services/geocoding';

jest.mock('lucide-react', () => ({
  Globe: () => <div />,
  Navigation: () => <div />,
  MapPin: () => <div />,
  Sparkles: () => <div />,
}));

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

jest.mock('@/components/inputs/Switch', () => ({ checked, onChange }: any) => (
  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid="switch" />
));

jest.mock('next/dynamic', () => () => {
  return function MockMap({ onClick }: any) {
    return (
      <div data-testid="mock-map" onClick={() => onClick(15, 120)}>
        Map
      </div>
    );
  };
});

jest.mock('@/services/geocoding', () => ({
  reverseGeocode: jest.fn().mockResolvedValue({
    address: '123 Mock St',
    city: 'Mock City',
    province: 'Mock Province',
    zipCode: '1234',
  }),
}));

describe('LandlordPropertyLocationForm', () => {
  const defaultFormData = {
    address: '',
    city: '',
    region: '',
    zipCode: '',
    latlng: [120, 15],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <LandlordPropertyLocationForm
        formData={defaultFormData}
        setFormData={jest.fn()}
        errors={{}}
        setActiveSection={jest.fn()}
        saveHistory={jest.fn()}
      />
    );
    expect(screen.getByText('Geographical Data')).toBeInTheDocument();
    expect(screen.getByLabelText('Precise Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City / Municipality')).toBeInTheDocument();
  });

  it('handles manual mode toggle', () => {
    render(
      <LandlordPropertyLocationForm
        formData={defaultFormData}
        setFormData={jest.fn()}
        errors={{}}
        setActiveSection={jest.fn()}
        saveHistory={jest.fn()}
      />
    );
    
    const switchToggle = screen.getByTestId('switch');
    fireEvent.click(switchToggle);
    expect((switchToggle as HTMLInputElement).checked).toBe(true);
  });

  it('triggers geocode on map click', async () => {
    const setFormData = jest.fn();
    const saveHistory = jest.fn();
    
    render(
      <LandlordPropertyLocationForm
        formData={defaultFormData}
        setFormData={setFormData}
        errors={{}}
        setActiveSection={jest.fn()}
        saveHistory={saveHistory}
      />
    );

    const map = screen.getByTestId('mock-map');
    fireEvent.click(map);
    
    expect(saveHistory).toHaveBeenCalled();
    expect(setFormData).toHaveBeenCalled(); // first call with latlng
    
    await waitFor(() => {
      expect(reverseGeocode).toHaveBeenCalledWith(15, 120);
      expect(setFormData).toHaveBeenCalled(); // second call with address
    });
  });
});
