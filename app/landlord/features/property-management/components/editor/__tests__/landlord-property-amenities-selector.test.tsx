import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordPropertyAmenitiesSelector } from '../landlord-property-amenities-selector';

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

describe('LandlordPropertyAmenitiesSelector', () => {
  const defaultFormData = {
    amenities: [],
    customAmenities: [],
  };

  it('renders correctly', () => {
    render(
      <LandlordPropertyAmenitiesSelector
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        onAddCustom={jest.fn()}
      />
    );
    expect(screen.getByText('Shared Amenities')).toBeInTheDocument();
    expect(screen.getByText('Connectivity & Security')).toBeInTheDocument();
    expect(screen.getByText('Custom Additions')).toBeInTheDocument();
  });

  it('toggles standard amenity', () => {
    const setFormData = jest.fn();
    render(
      <LandlordPropertyAmenitiesSelector
        formData={defaultFormData}
        setFormData={setFormData}
        setActiveSection={jest.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('WiFi'));
    expect(setFormData).toHaveBeenCalled();
  });

  it('calls onAddCustom', () => {
    const onAddCustom = jest.fn();
    render(
      <LandlordPropertyAmenitiesSelector
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        onAddCustom={onAddCustom}
      />
    );
    
    fireEvent.click(screen.getByText('New Perk'));
    expect(onAddCustom).toHaveBeenCalled();
  });

  it('toggles custom amenity', () => {
    const setFormData = jest.fn();
    render(
      <LandlordPropertyAmenitiesSelector
        formData={{
          ...defaultFormData,
          customAmenities: ['Balcony|HelpCircle'],
        }}
        setFormData={setFormData}
        setActiveSection={jest.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('Balcony'));
    expect(setFormData).toHaveBeenCalled();
  });
});
