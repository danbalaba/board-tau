import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchModal from '../SearchModal';
import { useRouter, useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/utils/searchUrlBuilder', () => ({
  buildSearchUrl: jest.fn(() => '/mock-search-url')
}));

jest.mock('@/components/modals/Modal', () => {
  const MockModal = ({ children }: any) => <div data-testid="mock-modal">{children}</div>;
  MockModal.WindowHeader = ({ title }: any) => <div data-testid="modal-header">{title}</div>;
  return MockModal;
});

jest.mock('@/components/common/Button', () => {
  return function MockButton({ children, onClick, type, disabled }: any) {
    return (
      <button type={type} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  };
});

jest.mock('@/components/common/Heading', () => {
  return function MockHeading({ title, subtitle }: any) {
    return (
      <div data-testid={`heading-${title}`}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    );
  };
});

jest.mock('@/components/inputs/Input', () => {
  return function MockInput({ id, label, type, register, required }: any) {
    const reg = register ? register(id, { required }) : {};
    return (
      <div data-testid={`input-wrapper-${id}`}>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          data-testid={`input-${id}`}
          type={type}
          {...reg}
        />
      </div>
    );
  };
});

jest.mock('@/components/inputs/Select', () => {
  return function MockSelect({ id, label, value, onChange, options }: any) {
    return (
      <div data-testid={`select-wrapper-${id}`}>
        <label htmlFor={id}>{label}</label>
        <select
          id={id}
          data-testid={`select-${id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  };
});

jest.mock('@/components/inputs/Slider', () => {
  return function MockSlider({ id, label, value, onChange }: any) {
    return (
      <div data-testid={`slider-wrapper-${id}`}>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          data-testid={`slider-${id}`}
          type="range"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  };
});

jest.mock('@/components/inputs/Counter', () => {
  return function MockCounter({ title, value, onChange, name }: any) {
    return (
      <div data-testid={`counter-wrapper-${name}`}>
        <span>{title}</span>
        <button type="button" onClick={() => onChange(name, (value || 0) + 1)} data-testid={`counter-inc-${name}`}>+</button>
      </div>
    );
  };
});

jest.mock('@/components/inputs/Checkbox', () => {
  return function MockCheckbox({ id, label, register }: any) {
    const reg = register ? register(id) : {};
    return (
      <div data-testid={`checkbox-wrapper-${id}`}>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          data-testid={`checkbox-${id}`}
          type="checkbox"
          {...reg}
        />
      </div>
    );
  };
});

jest.mock('@/components/inputs/MultiSelectGrid', () => {
  return function MockMultiSelectGrid({ options, selected, onToggle }: any) {
    return (
      <div data-testid="multi-select-grid">
        {options.map((opt: any) => (
          <button
            key={opt.value}
            type="button"
            data-testid={`multiselect-${opt.value}`}
            onClick={() => onToggle(opt.value)}
            className={selected.includes(opt.value) ? 'selected' : ''}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };
});

// Mock dynamic Map import
jest.mock('next/dynamic', () => () => {
  return function MockMap() {
    return <div data-testid="mock-map">Map Component</div>;
  };
});

// Mock framer-motion to avoid animation issues in Jest
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, ...rest } = props;
    return <div ref={ref} {...rest} />;
  });
  return {
    motion: {
      div: Dummy,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('SearchModal Component (Modularized)', () => {
  const mockPush = jest.fn();
  const mockOnCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({ get: jest.fn() });
    
    // Mock the Live Count API fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ count: 12 }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders initial step (COLLEGE) correctly', () => {
    render(<SearchModal onCloseModal={mockOnCloseModal} />);
    expect(screen.getByTestId('modal-header')).toHaveTextContent('Step 1 of 9 · BoardTAU');
    expect(screen.getByTestId('heading-Which college are you affiliated with?')).toBeInTheDocument();
    expect(screen.getByTestId('select-college')).toBeInTheDocument();
    expect(screen.getByText('CONTINUE')).toBeInTheDocument();
  });

  it('navigates through steps correctly', async () => {
    render(<SearchModal onCloseModal={mockOnCloseModal} />);
    
    // Step 0 -> 1 (BUDGET)
    fireEvent.click(screen.getByText('CONTINUE'));
    expect(await screen.findByTestId('heading-What is your monthly budget range?')).toBeInTheDocument();
    
    // Step 1 -> 2 (ROOM_TYPE)
    fireEvent.click(screen.getByText('CONTINUE'));
    expect(await screen.findByTestId('heading-Select Room Type')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Solo Room'));
    
    // Step 2 -> 3 (ROOM_AMENITIES)
    fireEvent.click(screen.getByText('CONTINUE'));
    expect(await screen.findByTestId('heading-Solo Room Amenities')).toBeInTheDocument();
    
    // Step 3 -> 4 (BED_SETUP)
    fireEvent.click(screen.getByText('CONTINUE'));
    expect(await screen.findByTestId('heading-Solo Room Setup')).toBeInTheDocument();
    
    // Step 4 -> 5 (LOCATION)
    fireEvent.click(screen.getByText('CONTINUE'));
    expect(await screen.findByTestId('heading-Where should the boarding house be located?')).toBeInTheDocument();
    
    // Go Back
    fireEvent.click(screen.getByText('BACK'));
    expect(await screen.findByTestId('heading-Solo Room Setup')).toBeInTheDocument();
  });

  it('skips ROOM_CONFIGURATION step if no room type is selected', async () => {
    render(<SearchModal onCloseModal={mockOnCloseModal} />);
    
    // Next to Budget
    fireEvent.click(screen.getByText('CONTINUE'));
    await screen.findByTestId('heading-What is your monthly budget range?');
    // Next to Room Type
    fireEvent.click(screen.getByText('CONTINUE'));
    await screen.findByTestId('heading-Select Room Type');
    
    // Click "Any room type" (value === "")
    fireEvent.click(screen.getByText('Any room type'));
    
    // Next should go directly to LOCATION (Step 4) because ROOM_CONFIGURATION is skipped
    fireEvent.click(screen.getByText('CONTINUE'));
    expect(await screen.findByTestId('heading-Where should the boarding house be located?')).toBeInTheDocument();
  });

  it('validates budget minimum and maximum', async () => {
    const { container } = render(<SearchModal onCloseModal={mockOnCloseModal} />);
    
    // Go to Budget step
    fireEvent.click(screen.getByText('CONTINUE'));
    await screen.findByTestId('heading-What is your monthly budget range?');
    
    const minInput = container.querySelector('input[name="minPrice"]') || screen.getByTestId('input-minPrice');
    const maxInput = container.querySelector('input[name="maxPrice"]') || screen.getByTestId('input-maxPrice');
    
    fireEvent.change(minInput, { target: { value: '5000' } });
    fireEvent.change(maxInput, { target: { value: '2000' } });
    
    await waitFor(() => {
      expect(screen.getByText('Minimum price cannot be greater than maximum price')).toBeInTheDocument();
    });
  });

  it('submits form on SUMMARY step', async () => {
    render(<SearchModal onCloseModal={mockOnCloseModal} />);
    
    fireEvent.click(screen.getByText('CONTINUE')); // Budget
    await screen.findByTestId('heading-What is your monthly budget range?');
    fireEvent.click(screen.getByText('CONTINUE')); // Room Type
    await screen.findByTestId('heading-Select Room Type');
    
    fireEvent.click(screen.getByText('Solo Room'));
    
    fireEvent.click(screen.getByText('CONTINUE')); // Room Amenities
    await screen.findByTestId('heading-Solo Room Amenities');
    fireEvent.click(screen.getByText('CONTINUE')); // Bed Setup
    await screen.findByTestId('heading-Solo Room Setup');
    fireEvent.click(screen.getByText('CONTINUE')); // Location
    await screen.findByTestId('heading-Where should the boarding house be located?');
    fireEvent.click(screen.getByText('CONTINUE')); // Category
    await screen.findByTestId('heading-Listing Categories');
    fireEvent.click(screen.getByText('CONTINUE')); // Amenities
    await screen.findByTestId('heading-Listing Amenities');
    fireEvent.click(screen.getByText('CONTINUE')); // Rules
    await screen.findByTestId('heading-Rules / Preferences');
    fireEvent.click(screen.getByText('CONTINUE')); // Advanced
    await screen.findByTestId('heading-Looking for advanced features?');
    fireEvent.click(screen.getByText('CONTINUE')); // Summary
    
    expect(await screen.findByTestId('heading-Ready to search?')).toBeInTheDocument();
    
    // In summary, button text can be "Show 12 homes" if API mocked correctly, or "Search properties"
    // Wait for debounce and API mock resolution
    await waitFor(() => {
      const btn = screen.queryByText(/Show \d+ homes|Search properties/i);
      expect(btn).toBeInTheDocument();
    });
    
    const submitBtn = screen.getByText(/Show 12 homes|Search properties/i);
    
    // Wait for the 150ms anti-double-click delay to finish and enable the button
    await waitFor(() => {
      expect(submitBtn.closest('button')).not.toBeDisabled();
    });
    
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(mockOnCloseModal).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
