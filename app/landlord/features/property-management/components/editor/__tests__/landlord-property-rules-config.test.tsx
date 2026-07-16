import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordPropertyRulesConfig } from '../landlord-property-rules-config';

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
  LocalCheckbox: ({ id, label, checked, onChange }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} data-testid={`checkbox-${id}`} />
    </div>
  ),
}));

describe('LandlordPropertyRulesConfig', () => {
  const defaultFormData = {
    rules: {
      femaleOnly: false,
      maleOnly: false,
      visitorsAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      noCurfew: true,
      customRules: [],
    },
    features: {
      security24h: false,
      cctv: true,
      fireSafety: true,
      nearTransport: false,
      floodFree: false,
      backupPower: false,
      customFeatures: [],
    }
  };

  it('renders correctly', () => {
    render(
      <LandlordPropertyRulesConfig
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        onAddCustomRule={jest.fn()}
        onAddCustomFeature={jest.fn()}
      />
    );
    expect(screen.getByText('Listing Rules')).toBeInTheDocument();
    expect(screen.getByText('Standard House Rules')).toBeInTheDocument();
    expect(screen.getByText('Security & Resilience')).toBeInTheDocument();
  });

  it('handles checkbox toggle for rules', () => {
    const setFormData = jest.fn();
    render(
      <LandlordPropertyRulesConfig
        formData={defaultFormData}
        setFormData={setFormData}
        setActiveSection={jest.fn()}
      />
    );
    
    fireEvent.click(screen.getByTestId('checkbox-femaleOnly'));
    expect(setFormData).toHaveBeenCalled();
  });

  it('calls onAddCustomRule', () => {
    const onAddCustomRule = jest.fn();
    render(
      <LandlordPropertyRulesConfig
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        onAddCustomRule={onAddCustomRule}
      />
    );
    
    fireEvent.click(screen.getByText('Define Custom Rule'));
    expect(onAddCustomRule).toHaveBeenCalled();
  });

  it('calls onAddCustomFeature', () => {
    const onAddCustomFeature = jest.fn();
    render(
      <LandlordPropertyRulesConfig
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        onAddCustomFeature={onAddCustomFeature}
      />
    );
    
    fireEvent.click(screen.getByText('Specify Security Spec'));
    expect(onAddCustomFeature).toHaveBeenCalled();
  });
});
