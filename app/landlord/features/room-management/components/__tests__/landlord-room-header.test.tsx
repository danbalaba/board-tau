import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordRoomHeader } from '../landlord-room-header';

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'displayName') return 'LucideIcon';
      return () => <span data-testid={`icon-${String(prop)}`} />;
    }
  });
});

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: new Proxy({}, {
      get: (_, tag) => {
        const FakeMotionComponent = React.forwardRef(({ children, ...props }: any, ref: any) => {
          const { initial, animate, exit, transition, whileHover, whileTap, layoutId, ...validProps } = props;
          return React.createElement(tag, { ...validProps, ref }, children);
        });
        FakeMotionComponent.displayName = `MotionComponent`;
        return FakeMotionComponent;
      }
    }),
  };
});

jest.mock('@/components/common/GenerateReportButton', () => {
  return function MockGenerateReportButton({ onGeneratePDF }: any) {
    return <button onClick={onGeneratePDF}>Generate Report</button>;
  };
});

describe('LandlordRoomHeader', () => {
  const mockProps = {
    sortBy: 'newest',
    setSortBy: jest.fn(),
    viewMode: 'grid' as const,
    setViewMode: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    rooms: [],
    onGenerateReport: jest.fn(),
    propertyFilter: 'all',
    setPropertyFilter: jest.fn(),
    typeFilter: 'all',
    setTypeFilter: jest.fn(),
    capacityFilter: 'all',
    setCapacityFilter: jest.fn(),
    uniqueProperties: [],
    uniqueCapacities: [],
    onClear: jest.fn(),
    isArchived: false,
    onToggleArchived: jest.fn(),
    onAddRoom: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LandlordRoomHeader {...mockProps} />);
    expect(screen.getByText(/Rooms/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Inventory & Occupancy/i)).toBeInTheDocument();
  });

  it('calls onAdd when Add Room is clicked', () => {
    render(<LandlordRoomHeader {...mockProps} />);
    const addBtn = screen.getByText(/Add Unit/i);
    fireEvent.click(addBtn);
    expect(mockProps.onAddRoom).toHaveBeenCalled();
  });

  it('calls onGenerateReport when Generate Report is clicked', () => {
    render(<LandlordRoomHeader {...mockProps} />);
    const reportBtn = screen.getByText(/Generate Report/i);
    fireEvent.click(reportBtn);
    expect(mockProps.onGenerateReport).toHaveBeenCalled();
  });
});
