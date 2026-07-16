import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomAmenityModal from '../CustomAmenityModal';
import { ModalContext } from '@/components/modals/Modal';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    __esModule: true,
    Search: () => <div />,
    HelpCircle: () => <div />,
    Sparkles: () => <div />,
    Wifi: () => <div />,
    Tv: () => <div />,
  };
});

jest.mock('@/components/inputs/Input', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <input data-testid="amenity-input" value={value} onChange={onChange} placeholder={placeholder} />
  )
}));

jest.mock('@/components/modals/Modal', () => ({
  __esModule: true,
  default: {
    WindowHeader: ({ title }: any) => <div>{title}</div>,
  },
  ModalContext: React.createContext({ close: jest.fn() }),
}));

describe('CustomAmenityModal', () => {
  const mockSetValue = jest.fn();
  const mockGetValues = jest.fn().mockReturnValue([{ amenities: [] }]);
  const mockClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <CustomAmenityModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        selectedRoomIndex={0}
        onClose={mockClose}
      />
    );
    expect(screen.getByText('Add Custom Feature')).toBeInTheDocument();
    expect(screen.getByTestId('amenity-input')).toBeInTheDocument();
  });

  it('can type custom amenity name', () => {
    render(
      <CustomAmenityModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        selectedRoomIndex={0}
        onClose={mockClose}
      />
    );
    
    const input = screen.getByTestId('amenity-input');
    fireEvent.change(input, { target: { value: 'Balcony' } });
    expect((input as HTMLInputElement).value).toBe('Balcony');
  });

  it('can submit custom amenity', () => {
    render(
      <CustomAmenityModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        selectedRoomIndex={0}
        onClose={mockClose}
      />
    );
    
    const input = screen.getByTestId('amenity-input');
    fireEvent.change(input, { target: { value: 'Balcony' } });
    
    fireEvent.click(screen.getByText('Confirm & Add'));
    
    expect(mockSetValue).toHaveBeenCalledWith('propertyConfig.rooms', [
      { amenities: ['Balcony|HelpCircle'] }
    ], { shouldDirty: true, shouldValidate: true });
    expect(mockClose).toHaveBeenCalled();
  });
});
