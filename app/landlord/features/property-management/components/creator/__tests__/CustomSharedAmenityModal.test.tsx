import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomSharedAmenityModal from '../CustomSharedAmenityModal';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react', () => {
  return {
    __esModule: true,
    Search: () => <div />,
    HelpCircle: () => <div />,
    Sparkles: () => <div />,
  };
});

jest.mock('@/components/inputs/Input', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <input data-testid="shared-amenity-input" value={value} onChange={onChange} placeholder={placeholder} />
  )
}));

jest.mock('@/components/modals/Modal', () => ({
  __esModule: true,
  default: {
    WindowHeader: ({ title }: any) => <div>{title}</div>,
  },
  ModalContext: React.createContext({ close: jest.fn() }),
}));

describe('CustomSharedAmenityModal', () => {
  const mockSetValue = jest.fn();
  const mockGetValues = jest.fn().mockReturnValue([]);
  const mockClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <CustomSharedAmenityModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        onClose={mockClose}
      />
    );
    expect(screen.getByText('Custom Shared Amenity')).toBeInTheDocument();
  });

  it('can submit custom shared amenity', () => {
    render(
      <CustomSharedAmenityModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        onClose={mockClose}
      />
    );
    
    const input = screen.getByTestId('shared-amenity-input');
    fireEvent.change(input, { target: { value: 'Shared Lounge' } });
    
    fireEvent.click(screen.getByText('Add Amenity'));
    
    expect(mockSetValue).toHaveBeenCalledWith('propertyConfig.amenities', [
      'Shared Lounge|HelpCircle'
    ]);
    expect(mockClose).toHaveBeenCalled();
  });
});
