import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandlordArchiveModal from '../landlord-inquiry-archive-modal';
import { useIsClient } from '@/hooks/useIsClient';

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: jest.fn()
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, ...rest } = props;
        return <div ref={ref} {...rest}>{children}</div>;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('lucide-react', () => ({
  Archive: () => <div data-testid="icon-archive" />,
  RotateCcw: () => <div data-testid="icon-rotate" />,
  AlertCircle: () => <div data-testid="icon-alert" />
}));

describe('LandlordArchiveModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Archive Inquiry',
    description: 'Are you sure you want to archive this?',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useIsClient as jest.Mock).mockReturnValue(true);
  });

  it('renders correctly when open', () => {
    render(<LandlordArchiveModal {...defaultProps} />);
    expect(screen.getByText('Archive Inquiry')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to archive this?')).toBeInTheDocument();
    expect(screen.getByText('Archive Now')).toBeInTheDocument();
  });

  it('renders restore variant when isRestore is true', () => {
    render(<LandlordArchiveModal {...defaultProps} isRestore={true} title="Restore Inquiry" />);
    expect(screen.getByText('Restore Inquiry')).toBeInTheDocument();
    expect(screen.getByText('Restore Now')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<LandlordArchiveModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Archive Inquiry')).not.toBeInTheDocument();
  });

  it('calls onClose when Go Back button is clicked', () => {
    render(<LandlordArchiveModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Go Back'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<LandlordArchiveModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Archive Now'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isArchiving is true', () => {
    render(<LandlordArchiveModal {...defaultProps} isArchiving={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
