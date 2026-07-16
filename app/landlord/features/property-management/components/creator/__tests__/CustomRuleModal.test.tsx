import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomRuleModal from '../CustomRuleModal';

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
    AlertCircle: () => <div />,
    Sparkles: () => <div />,
  };
});

jest.mock('@/components/inputs/Input', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <input data-testid="rule-input" value={value} onChange={onChange} placeholder={placeholder} />
  )
}));

jest.mock('@/components/modals/Modal', () => ({
  __esModule: true,
  default: {
    WindowHeader: ({ title }: any) => <div>{title}</div>,
  },
  ModalContext: React.createContext({ close: jest.fn() }),
}));

describe('CustomRuleModal', () => {
  const mockSetValue = jest.fn();
  const mockGetValues = jest.fn().mockReturnValue([]);
  const mockClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <CustomRuleModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        onClose={mockClose}
      />
    );
    expect(screen.getByText('Custom House Rule')).toBeInTheDocument();
  });

  it('can submit custom rule', () => {
    render(
      <CustomRuleModal
        setValue={mockSetValue}
        getValues={mockGetValues}
        onClose={mockClose}
      />
    );
    
    const input = screen.getByTestId('rule-input');
    fireEvent.change(input, { target: { value: 'No loud music after 10PM' } });
    
    fireEvent.click(screen.getByText('Add Rule'));
    
    expect(mockSetValue).toHaveBeenCalledWith('propertyConfig.rules', [
      'No loud music after 10PM|AlertCircle'
    ]);
    expect(mockClose).toHaveBeenCalled();
  });
});
