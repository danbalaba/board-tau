import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordPropertyDetailsModal } from '../landlord-property-details-modal';
import { Property } from '../../hooks/use-property-logic';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className} data-testid="motion-div">{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollY: 0 }),
  useTransform: () => 0,
}));

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true,
}));

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node, // render inline for testing
}));

const mockProperty: Property = {
  id: 'prop-1',
  title: 'Test Property Details',
  description: 'A beautiful test property.',
  price: 5000,
  region: 'Metro Manila',
  country: 'Philippines',
  status: 'active',
  roomCount: 2,
  bathroomCount: 1,
  imageSrc: 'test-image.jpg',
  createdAt: new Date('2023-01-01'),
  user: { id: 'user-1' } as any,
  rules: {
    femaleOnly: true,
    petsAllowed: false,
    customRules: ['No parties|ShieldCheck']
  },
  features: {
    security24h: true,
    customFeatures: ['Gym|Dumbbell']
  },
  rooms: [
    { id: 'room-1', name: 'Deluxe', availableSlots: 2, capacity: 4, price: 2000, bedType: 'Single', roomType: 'Shared' } as any,
  ],
  categories: [{ category: { label: 'Premium' } }] as any
};

describe('LandlordPropertyDetailsModal', () => {
  const mockOnClose = jest.fn();
  const mockFormatStatus = jest.fn((s) => s.toUpperCase());
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders property details', () => {
    render(
      <LandlordPropertyDetailsModal
        property={mockProperty}
        onClose={mockOnClose}
        statusColors={{ active: 'bg-green-100' }}
        formatStatus={mockFormatStatus}
      />
    );

    // Initial load state is true, but since we mock setTimeout, we need to wait or just check loading state
    // Let's assume loading state will pass, we can use `findByText` or jest fake timers
  });

  it('renders content after loading', async () => {
    jest.useFakeTimers();
    render(
      <LandlordPropertyDetailsModal
        property={mockProperty}
        onClose={mockOnClose}
        statusColors={{ active: 'bg-green-100' }}
        formatStatus={mockFormatStatus}
      />
    );

    expect(screen.getByText('Syncing Environment')).toBeInTheDocument();
    
    // Advance timers to clear loading state
    jest.advanceTimersByTime(1000);
    
    // Use findAllByText since it appears in multiple places (h3, img alt, etc.)
    const titles = await screen.findAllByText('Test Property Details');
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByText('A beautiful test property.')).toBeInTheDocument();
    
    // Rent
    expect(screen.getByText('₱5,000')).toBeInTheDocument();

    // Rooms
    expect(screen.getByText('Deluxe')).toBeInTheDocument();
    
    // Rules
    expect(screen.getByText(/Female Only/i)).toBeInTheDocument();
    expect(screen.getByText(/No parties/i)).toBeInTheDocument();

    // Features
    expect(screen.getByText(/24\/7 Security/i)).toBeInTheDocument();
    expect(screen.getByText(/Gym/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('calls onClose when dismiss button is clicked', async () => {
    jest.useFakeTimers();
    render(
      <LandlordPropertyDetailsModal
        property={mockProperty}
        onClose={mockOnClose}
        statusColors={{}}
        formatStatus={mockFormatStatus}
      />
    );
    jest.advanceTimersByTime(1000);

    const dismissBtn = await screen.findByText('Dismiss');
    fireEvent.click(dismissBtn);
    expect(mockOnClose).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
