import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomFeatureModal from '../CustomFeatureModal';

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
    Shield: () => <div />,
  };
});

jest.mock('@/components/inputs/Input', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <input data-testid="feature-input" value={value} onChange={onChange} placeholder={placeholder} />
  )
}));

jest.mock('@/components/modals/Modal', () => ({
  __esModule: true,
  default: {
    WindowHeader: ({ title }: any) => <div>{title}</div>,
  },
  ModalContext: React.createContext({ close: jest.fn() }),
}));

describe('CustomFeatureModal', () => {
  const mockSetValue = jest.fn();
  const mockGetValues = jest.fn().mockReturnValue([]);
  const mockClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <CustomFeatureModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        onClose={mockClose}
      />
    );
    expect(screen.getByText('Custom Property Feature')).toBeInTheDocument();
  });

  it('can submit custom feature', () => {
    render(
      <CustomFeatureModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        onClose={mockClose}
      />
    );
    
    const input = screen.getByTestId('feature-input');
    fireEvent.change(input, { target: { value: 'High Speed WiFi' } });
    
    fireEvent.click(screen.getByText('Add Feature'));
    
    expect(mockSetValue).toHaveBeenCalledWith('propertyConfig.features', [
      'High Speed WiFi|Shield'
    ]);
    expect(mockClose).toHaveBeenCalled();
  });
});
