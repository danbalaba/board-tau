import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordPropertyCard } from '../landlord-property-card';
import { Property } from '../../hooks/use-property-logic';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">{children}</a>
  );
});

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return true;
      return () => <div data-testid={`icon-${String(prop)}`} />;
    }
  });
});
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/app/admin/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="button">{children}</button>
  )
}));

const mockProperty: Property = {
  id: 'prop-1',
  title: 'Test Property',
  description: 'Test Description',
  price: 5000,
  region: 'Metro Manila',
  status: 'active',
  roomCount: 2,
  bathroomCount: 1,
  imageSrc: 'test-image.jpg',
  createdAt: new Date(),
  user: { id: 'user-1' } as any,
  rules: [],
  features: [],
  rooms: [
    { availableSlots: 2 } as any,
    { availableSlots: 1 } as any
  ],
  categories: [{ category: { label: 'Premium' } }] as any
};

describe('LandlordPropertyCard', () => {
  const mockOnView = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnArchive = jest.fn();
  const mockFormatStatus = jest.fn((status) => status.toUpperCase());
  const statusColors = { active: 'bg-green-100' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Grid View', () => {
    it('renders property details in grid mode', () => {
      render(
        <LandlordPropertyCard
          property={mockProperty}
          idx={0}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onArchive={mockOnArchive}
          statusColors={statusColors}
          formatStatus={mockFormatStatus}
        />
      );

      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('Metro Manila')).toBeInTheDocument();
      expect(screen.getByText('₱5,000')).toBeInTheDocument();
      expect(screen.getByText('3 Slots')).toBeInTheDocument(); // 2 + 1 slots
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('triggers onView when Preview button is clicked', () => {
      render(
        <LandlordPropertyCard
          property={mockProperty}
          idx={0}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onArchive={mockOnArchive}
          statusColors={statusColors}
          formatStatus={mockFormatStatus}
        />
      );

      const previewBtn = screen.getByText('Preview').closest('button');
      fireEvent.click(previewBtn!);
      expect(mockOnView).toHaveBeenCalledWith(mockProperty);
    });

    it('triggers onArchive when Archive button is clicked', () => {
      render(
        <LandlordPropertyCard
          property={mockProperty}
          idx={0}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onArchive={mockOnArchive}
          statusColors={statusColors}
          formatStatus={mockFormatStatus}
        />
      );

      const archiveBtn = screen.getByTitle('Archive Property');
      fireEvent.click(archiveBtn);
      expect(mockOnArchive).toHaveBeenCalledWith(mockProperty);
    });

    it('renders Delete Permanent when property is archived', () => {
      render(
        <LandlordPropertyCard
          property={{ ...mockProperty, isArchived: true } as any}
          idx={0}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onArchive={mockOnArchive}
          statusColors={statusColors}
          formatStatus={mockFormatStatus}
        />
      );

      const deleteBtn = screen.getByText('Delete Permanent').closest('button');
      expect(deleteBtn).toBeInTheDocument();
      
      fireEvent.click(deleteBtn!);
      expect(mockOnDelete).toHaveBeenCalled();
    });
  });

  describe('List View', () => {
    it('renders property details in list mode', () => {
      render(
        <LandlordPropertyCard
          property={mockProperty}
          idx={0}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onArchive={mockOnArchive}
          statusColors={statusColors}
          formatStatus={mockFormatStatus}
        />
      );

      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('Metro Manila')).toBeInTheDocument();
      expect(screen.getByText('₱5,000')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('2 Rooms')).toBeInTheDocument();
      expect(screen.getByText('1 Baths')).toBeInTheDocument();
    });

    it('triggers actions from list view buttons', () => {
      render(
        <LandlordPropertyCard
          property={mockProperty}
          idx={0}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onArchive={mockOnArchive}
          statusColors={statusColors}
          formatStatus={mockFormatStatus}
        />
      );

      const quickViewBtn = screen.getByTitle('Quick View');
      fireEvent.click(quickViewBtn);
      expect(mockOnView).toHaveBeenCalledWith(mockProperty);

      const archiveBtn = screen.getByTitle('Archive Property');
      fireEvent.click(archiveBtn);
      expect(mockOnArchive).toHaveBeenCalledWith(mockProperty);
    });
  });
});
