import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordPropertyArchiveModal } from '../landlord-property-archive-modal';
import { Property } from '../../hooks/use-property-logic';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true,
}));

describe('LandlordPropertyArchiveModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockProperty = { title: 'Test Property', isArchived: false } as any;
  const mockArchivedProperty = { title: 'Test Property', isArchived: true } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when property is null', () => {
    const { container } = render(
      <LandlordPropertyArchiveModal
        isOpen={true}
        property={null}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <LandlordPropertyArchiveModal
        isOpen={false}
        property={mockProperty}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    // Framer motion AnimatePresence might still render conditionally, but our mock just passes children.
    // In actual implementation it returns nothing.
    expect(container).toBeEmptyDOMElement();
  });

  it('renders Archive content when property is active', () => {
    render(
      <LandlordPropertyArchiveModal
        isOpen={true}
        property={mockProperty}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText('Archive Property?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to archive/)).toBeInTheDocument();
    expect(screen.getByText('Confirm Archive')).toBeInTheDocument();
  });

  it('renders Restore content when property is archived', () => {
    render(
      <LandlordPropertyArchiveModal
        isOpen={true}
        property={mockArchivedProperty}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText('Restore Property?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to restore/)).toBeInTheDocument();
    expect(screen.getByText('Confirm Restore')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <LandlordPropertyArchiveModal
        isOpen={true}
        property={mockProperty}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it('calls onConfirm when confirm is clicked', () => {
    render(
      <LandlordPropertyArchiveModal
        isOpen={true}
        property={mockProperty}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    fireEvent.click(screen.getByText('Confirm Archive'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
