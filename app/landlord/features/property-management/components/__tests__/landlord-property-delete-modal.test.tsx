import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordPropertyDeleteModal } from '../landlord-property-delete-modal';
import { Property } from '../../hooks/use-property-logic';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/app/admin/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  )
}));

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true,
}));

describe('LandlordPropertyDeleteModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockProperty = { title: 'Test Property' } as Property;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <LandlordPropertyDeleteModal
        isOpen={false}
        property={mockProperty}
        isDeleting={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal content when open', () => {
    render(
      <LandlordPropertyDeleteModal
        isOpen={true}
        property={mockProperty}
        isDeleting={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText('Delete Permanently')).toBeInTheDocument();
    expect(screen.getByText(/"Test Property"/)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <LandlordPropertyDeleteModal
        isOpen={true}
        property={mockProperty}
        isDeleting={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <LandlordPropertyDeleteModal
        isOpen={true}
        property={mockProperty}
        isDeleting={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    fireEvent.click(screen.getByText('Confirm Delete'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('shows loading state when isDeleting is true', () => {
    render(
      <LandlordPropertyDeleteModal
        isOpen={true}
        property={mockProperty}
        isDeleting={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument(); // Since 'Confirm Delete' is replaced
  });
});
