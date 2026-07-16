import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordReservationHeader } from '../landlord-reservation-header';
import { ReservationRequest } from '../../hooks/use-reservation-logic';

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function (target, prop) {
      if (typeof prop === 'string' && prop.startsWith('Icon')) {
        return ({ "data-testid": testId, ...props }: any) => (
          <div data-testid={testId || `icon-${prop.toLowerCase()}`} {...props} />
        );
      }
      return target[prop as keyof typeof target];
    }
  });
});

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/common/GenerateReportButton', () => {
  return {
    __esModule: true,
    default: ({ onGeneratePDF }: any) => (
      <button onClick={() => onGeneratePDF()} data-testid="generate-report-btn">Generate Report</button>
    )
  };
});

const mockReservation: ReservationRequest = {
  id: 'res-1',
  listing: { id: 'list-1', title: 'Test Listing', imageSrc: '/img.jpg' },
  user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  status: 'RESERVED',
  moveInDate: new Date('2023-01-01'),
  stayDuration: 30,
  isArchived: false,
  createdAt: new Date('2023-01-01')
};

describe('LandlordReservationHeader', () => {
  const mockProps = {
    sortBy: 'newest',
    setSortBy: jest.fn(),
    selectedStatus: 'all',
    setSelectedStatus: jest.fn(),
    viewMode: 'grid' as 'grid' | 'list',
    setViewMode: jest.fn(),
    handleGenerateReport: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    rawReservations: [mockReservation],
    isArchived: false,
    onToggleArchived: jest.fn(),
    onCreateWalkIn: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header text and actions', () => {
    render(<LandlordReservationHeader {...mockProps} />);
    expect(screen.getByText('Reservations')).toBeInTheDocument();
    expect(screen.getByText('View Archived')).toBeInTheDocument();
  });

  it('calls setViewMode when view toggles are clicked', () => {
    render(<LandlordReservationHeader {...mockProps} />);
    const gridBtn = screen.getByTestId('icon-iconlayoutgrid').parentElement;
    const listBtn = screen.getByTestId('icon-iconlist').parentElement;
    
    fireEvent.click(listBtn!);
    expect(mockProps.setViewMode).toHaveBeenCalledWith('list');
  });

  it('calls onCreateWalkIn when Create Walk-In is clicked', () => {
    render(<LandlordReservationHeader {...mockProps} />);
    const walkInBtn = screen.getByText('Create Walk-In');
    fireEvent.click(walkInBtn);
    expect(mockProps.onCreateWalkIn).toHaveBeenCalled();
  });
});
