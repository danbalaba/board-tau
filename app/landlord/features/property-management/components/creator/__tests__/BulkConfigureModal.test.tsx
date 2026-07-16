import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BulkConfigureModal from '../BulkConfigureModal';

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

jest.mock('react-select', () => ({ options, onChange }: any) => (
  <select data-testid="react-select" onChange={(e) => onChange(options.find((o: any) => o.value === e.target.value))}>
    <option value="">Select...</option>
    {options.map((o: any) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({
    error: jest.fn(),
  }),
}));

describe('BulkConfigureModal', () => {
  it('renders correctly', () => {
    render(
      <BulkConfigureModal
        onClose={jest.fn()}
        onApply={jest.fn()}
        roomCount={5}
        commonBathroomCount={2}
      />
    );
    expect(screen.getByText('Group Setup Wizard')).toBeInTheDocument();
    expect(screen.getByText(/Apply settings to all 5 units/)).toBeInTheDocument();
  });

  it('validates empty submission', async () => {
    const onApply = jest.fn();
    render(
      <BulkConfigureModal
        onClose={jest.fn()}
        onApply={onApply}
        roomCount={5}
        commonBathroomCount={2}
      />
    );
    
    // Simulate scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
    
    fireEvent.click(screen.getByText(/Apply to all 5 units/));
    
    await waitFor(() => {
      expect(screen.getByText('Room type is required')).toBeInTheDocument();
      expect(onApply).not.toHaveBeenCalled();
    });
  });

  it('can fill form and apply', async () => {
    const onApply = jest.fn();
    render(
      <BulkConfigureModal
        onClose={jest.fn()}
        onApply={onApply}
        roomCount={5}
        commonBathroomCount={2}
      />
    );
    
    // Select room type
    const selects = screen.getAllByTestId('react-select');
    fireEvent.change(selects[0], { target: { value: 'SOLO' } }); // Room Type
    
    // Fill inputs
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '5000' } }); // Price
    fireEvent.change(inputs[1], { target: { value: '1000' } }); // Reservation Fee
    fireEvent.change(inputs[2], { target: { value: '20' } }); // Size
    
    // Bed type
    fireEvent.change(selects[1], { target: { value: 'SINGLE' } }); // Bed Type
    
    // Bed Count
    fireEvent.change(inputs[3], { target: { value: '1' } }); // Bed Count
    
    // Bathroom Arrangement
    fireEvent.click(screen.getByText('Own Private CR'));
    
    fireEvent.click(screen.getByText(/Apply to all 5 units/));
    
    await waitFor(() => {
      expect(onApply).toHaveBeenCalled();
    });
  });
});
