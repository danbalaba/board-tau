import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoomAddModernSelect from '../RoomAddModernSelect';

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'displayName') return 'LucideIcon';
      return () => <span data-testid={`icon-${String(prop)}`} />;
    }
  });
});

jest.mock('react-select', () => {
  const React = require('react');
  const Select = ({ options, value, onChange, placeholder }: any) => (
    <div data-testid="react-select-mock">
      <span>{placeholder}</span>
      <select 
        value={value ? value.value : ''} 
        onChange={(e) => onChange(options.find((o: any) => o.value === e.target.value))}
      >
        <option value="">{placeholder}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return {
    __esModule: true,
    default: Select,
    components: {
      Option: ({ children }: any) => <div>{children}</div>,
      SingleValue: ({ children }: any) => <div>{children}</div>,
      DropdownIndicator: ({ children }: any) => <div>{children}</div>,
      Menu: ({ children }: any) => <div>{children}</div>,
      MenuList: ({ children }: any) => <div>{children}</div>,
    }
  };
});

describe('RoomAddModernSelect', () => {
  const mockOnChange = jest.fn();
  const options = [
    { value: 'OPT1', label: 'Option 1' },
    { value: 'OPT2', label: 'Option 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with placeholder', () => {
    render(
      <RoomAddModernSelect
        label="Test Select"
        value=""
        onChange={mockOnChange}
        options={options}
        placeholder="Select an option"
      />
    );
    expect(screen.getByText(/Test Select/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Select an option/i).length).toBeGreaterThan(0);
  });

  it('calls onChange when an option is selected', () => {
    render(
      <RoomAddModernSelect
        label="Test Select"
        value=""
        onChange={mockOnChange}
        options={options}
      />
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'OPT1' } });
    expect(mockOnChange).toHaveBeenCalledWith('OPT1');
  });
});
