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

jest.mock('@/services/taxonomy', () => ({
  getActiveAttributes: jest.fn().mockResolvedValue([]),
  getActiveSubGroups: jest.fn().mockResolvedValue([]),
  getActiveRoomTypes: jest.fn().mockResolvedValue([]),
}));

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
    expect(screen.getByText('Bulk Unit Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Apply consistent settings to all 5 units/)).toBeInTheDocument();
  });

  it('validates empty submission on next step click', async () => {
    const onApply = jest.fn();
    render(
      <BulkConfigureModal
        onClose={jest.fn()}
        onApply={onApply}
        roomCount={5}
        commonBathroomCount={2}
      />
    );
    
    fireEvent.click(screen.getByText('Next Step'));
    
    await waitFor(() => {
      expect(screen.getByText('Please select a unit layout / category')).toBeInTheDocument();
      expect(onApply).not.toHaveBeenCalled();
    });
  });

  it('can complete wizard steps and apply', async () => {
    const onApply = jest.fn();
    render(
      <BulkConfigureModal
        onClose={jest.fn()}
        onApply={onApply}
        roomCount={5}
        commonBathroomCount={2}
      />
    );
    
    // Step 1: Select room type
    const selects = screen.getAllByTestId('react-select');
    fireEvent.change(selects[0], { target: { value: 'SOLO' } }); // Room Type
    
    // Fill inputs
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '5000' } }); // Price
    fireEvent.change(inputs[1], { target: { value: '1000' } }); // Reservation Fee
    fireEvent.change(inputs[2], { target: { value: '20' } }); // Size

    // Next -> Step 2
    fireEvent.click(screen.getByText('Next Step'));

    // Step 2: Bedding
    await waitFor(() => {
      expect(screen.getByText(/Configure bedding details/i)).toBeInTheDocument();
    });
    const step2Inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(step2Inputs[0], { target: { value: '1' } }); // Bed Count

    // Next -> Step 3
    fireEvent.click(screen.getByText('Next Step'));

    // Step 3: Bathroom
    await waitFor(() => {
      expect(screen.getByText(/Own Private Bathroom/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Own Private Bathroom'));

    // Next -> Step 4
    fireEvent.click(screen.getByText('Next Step'));

    // Next -> Step 5
    await waitFor(() => {
      expect(screen.getByText('Next Step')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next Step'));

    // Step 5: Apply
    await waitFor(() => {
      expect(screen.getByText('Apply to All 5 Units')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Apply to All 5 Units'));

    expect(onApply).toHaveBeenCalled();
  });
});
