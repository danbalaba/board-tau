import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordPropertyHeader } from '../landlord-property-header';
import * as exportUtils from '@/utils/export-utils';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('../landlord-property-search', () => ({
  LandlordPropertySearch: () => <div data-testid="search-mock">Search</div>,
}));

jest.mock('@/components/common/GenerateReportButton', () => {
  return function MockGenerateReportButton({ onGenerateCSV, onGenerateExcel }: any) {
    return (
      <div data-testid="generate-report-btn">
        <button onClick={() => onGenerateCSV({ from: new Date(), to: new Date() })}>CSV</button>
        <button onClick={() => onGenerateExcel()}>Excel</button>
      </div>
    );
  };
});

jest.mock('@/utils/export-utils', () => ({
  prepareDataForExport: jest.fn(),
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
}));

jest.mock('@/app/admin/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick} data-testid="dropdown-item">{children}</div>,
}));

jest.mock('@/app/admin/components/ui/button', () => ({
  Button: ({ children, className }: any) => <button className={className}>{children}</button>
}));

describe('LandlordPropertyHeader', () => {
  const mockSetSortBy = jest.fn();
  const mockSetViewMode = jest.fn();
  const mockSetSearchQuery = jest.fn();
  const mockOnGenerateReport = jest.fn();
  const mockSetCategoryFilter = jest.fn();
  const mockOnClear = jest.fn();
  const mockOnToggleArchived = jest.fn();

  const defaultProps = {
    sortBy: 'newest',
    setSortBy: mockSetSortBy,
    viewMode: 'grid' as const,
    setViewMode: mockSetViewMode,
    searchQuery: '',
    setSearchQuery: mockSetSearchQuery,
    listings: [{ id: '1', price: 1000, createdAt: new Date().toISOString() }],
    onGenerateReport: mockOnGenerateReport,
    categoryFilter: 'all',
    setCategoryFilter: mockSetCategoryFilter,
    uniqueCategories: ['Apartment', 'House'],
    onClear: mockOnClear,
    isArchived: false,
    onToggleArchived: mockOnToggleArchived
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LandlordPropertyHeader {...defaultProps} />);
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByTestId('search-mock')).toBeInTheDocument();
  });

  it('calls setViewMode when view toggles are clicked', () => {
    render(<LandlordPropertyHeader {...defaultProps} />);
    
    // There are 2 buttons for view mode (Grid and List), identified by their layout icons, 
    // but in tests without icons rendered, we can find them by the button structure.
    const buttons = screen.getAllByRole('button');
    // the layout buttons are the first two buttons inside the toggle container.
    // Button 0 -> grid, Button 1 -> list
    fireEvent.click(buttons[0]); // Grid
    expect(mockSetViewMode).toHaveBeenCalledWith('grid');

    fireEvent.click(buttons[1]); // List
    expect(mockSetViewMode).toHaveBeenCalledWith('list');
  });

  it('generates CSV and Excel reports', async () => {
    render(<LandlordPropertyHeader {...defaultProps} />);
    
    const csvBtn = screen.getByText('CSV');
    const excelBtn = screen.getByText('Excel');

    fireEvent.click(csvBtn);
    expect(exportUtils.prepareDataForExport).toHaveBeenCalled();
    expect(exportUtils.exportToCSV).toHaveBeenCalled();

    fireEvent.click(excelBtn);
    expect(exportUtils.exportToExcel).toHaveBeenCalled();
  });

  it('shows active category and changes it', () => {
    render(<LandlordPropertyHeader {...defaultProps} categoryFilter="Apartment" />);
    
    // Apartment should be displayed in the trigger button and in the list
    expect(screen.getAllByText('Apartment').length).toBeGreaterThan(0);

    const items = screen.getAllByTestId('dropdown-item');
    // Categories dropdown items: All Categories, Apartment, House
    fireEvent.click(items[1]); // Click Apartment
    expect(mockSetCategoryFilter).toHaveBeenCalledWith('Apartment');
  });

  it('shows clear button when filters are active and clears them', () => {
    render(<LandlordPropertyHeader {...defaultProps} searchQuery="Test" />);
    
    const clearBtn = screen.getByText('Clear').closest('button');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn!);
    expect(mockOnClear).toHaveBeenCalled();
  });

  it('toggles archived view', () => {
    render(<LandlordPropertyHeader {...defaultProps} isArchived={true} />);
    
    const toggleBtn = screen.getByText('Viewing Archived').closest('button');
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn!);
    expect(mockOnToggleArchived).toHaveBeenCalled();
  });
});
