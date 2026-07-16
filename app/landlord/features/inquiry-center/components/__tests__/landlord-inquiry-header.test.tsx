import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordInquiryHeader } from '../landlord-inquiry-header';

jest.mock('@/utils/export-utils', () => ({
  prepareDataForExport: jest.fn(() => []),
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
}));

jest.mock('@/components/common/GenerateReportButton', () => {
  return function MockGenerateReportButton({ onGeneratePDF, onGenerateCSV, onGenerateExcel }: any) {
    return (
      <div data-testid="generate-report">
        <button onClick={() => onGeneratePDF()}>Generate PDF Mock</button>
        <button onClick={() => onGenerateCSV()}>Generate CSV Mock</button>
        <button onClick={() => onGenerateExcel()}>Generate Excel Mock</button>
      </div>
    );
  };
});

jest.mock('../landlord-inquiry-search', () => ({
  LandlordInquirySearch: ({ searchQuery, setSearchQuery }: any) => (
    <input 
      data-testid="search-input" 
      value={searchQuery} 
      onChange={(e) => setSearchQuery(e.target.value)} 
    />
  )
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, variants, ...rest } = props;
        return <div ref={ref} {...rest}>{children}</div>;
      }),
    }
  };
});

jest.mock('@/app/admin/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown">{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuGroup: ({ children }: any) => <div data-testid="dropdown-group">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <button data-testid="dropdown-item" onClick={onClick}>{children}</button>,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  };
});

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      return () => <div data-testid={`icon-${String(prop).toLowerCase()}`} />;
    }
  });
});

describe('LandlordInquiryHeader', () => {
  const mockSetSearchQuery = jest.fn();
  const mockSetSortBy = jest.fn();
  const mockSetSelectedStatus = jest.fn();
  const mockSetViewMode = jest.fn();
  const mockHandleGenerateReport = jest.fn().mockResolvedValue(undefined);
  const mockOnToggleArchived = jest.fn();

  const defaultProps = {
    searchQuery: '',
    setSearchQuery: mockSetSearchQuery,
    sortBy: 'newest',
    setSortBy: mockSetSortBy,
    selectedStatus: 'ALL',
    setSelectedStatus: mockSetSelectedStatus,
    viewMode: 'grid' as const,
    setViewMode: mockSetViewMode,
    handleGenerateReport: mockHandleGenerateReport,
    rawInquiries: [],
    isArchived: false,
    onToggleArchived: mockOnToggleArchived,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LandlordInquiryHeader {...defaultProps} />);
    expect(screen.getByText('Tenant Inquiries')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('calls setSearchQuery on search input change', () => {
    render(<LandlordInquiryHeader {...defaultProps} />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(mockSetSearchQuery).toHaveBeenCalledWith('John');
  });

  it('calls setSortBy when sort option is clicked', () => {
    render(<LandlordInquiryHeader {...defaultProps} />);
    const sortItems = screen.getAllByTestId('dropdown-item');
    // Click oldest
    fireEvent.click(sortItems.find(item => item.textContent?.includes('Oldest First')) as HTMLElement);
    expect(mockSetSortBy).toHaveBeenCalledWith('oldest');
  });

  it('calls setSelectedStatus when status option is clicked', () => {
    render(<LandlordInquiryHeader {...defaultProps} />);
    const statusItems = screen.getAllByTestId('dropdown-item');
    // Click Pending
    fireEvent.click(statusItems.find(item => item.textContent?.includes('Pending')) as HTMLElement);
    expect(mockSetSelectedStatus).toHaveBeenCalledWith('PENDING');
  });

  it('calls onToggleArchived when archive toggle is clicked', () => {
    render(<LandlordInquiryHeader {...defaultProps} />);
    const archiveBtn = screen.getByText('View Archived');
    fireEvent.click(archiveBtn);
    expect(mockOnToggleArchived).toHaveBeenCalledTimes(1);
  });

  it('calls setViewMode when grid/list toggles are clicked', () => {
    render(<LandlordInquiryHeader {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // Second to last is grid, last is list (based on DOM structure minus GenerateReportButton)
    // Actually we can just find the buttons by their parent container which is harder since we mock motion.
    // We'll rely on the fact that setViewMode('grid') and ('list') are bound to specific buttons.
    // Let's just click all buttons and check if mock was called with 'list'
    buttons.forEach(btn => fireEvent.click(btn));
    expect(mockSetViewMode).toHaveBeenCalledWith('list');
    expect(mockSetViewMode).toHaveBeenCalledWith('grid');
  });

  it('handles report generation callbacks', () => {
    render(<LandlordInquiryHeader {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Generate PDF Mock'));
    expect(mockHandleGenerateReport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Generate CSV Mock'));
    // We mocked exportToCSV, so it shouldn't crash
    const { exportToCSV } = require('@/utils/export-utils');
    expect(exportToCSV).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Generate Excel Mock'));
    const { exportToExcel } = require('@/utils/export-utils');
    expect(exportToExcel).toHaveBeenCalledTimes(1);
  });
});
