import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordReviewHeader } from '../landlord-review-header';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  }
}));

jest.mock('@/app/admin/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick} data-testid="dropdown-item">{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

jest.mock('@/components/common/GenerateReportButton', () => ({
  __esModule: true,
  default: ({ onGeneratePDF, onGenerateCSV, onGenerateExcel, label }: any) => (
    <button onClick={onGeneratePDF} data-testid="generate-report">{label}</button>
  ),
}));

jest.mock('../landlord-review-search', () => ({
  LandlordReviewSearch: () => <div data-testid="review-search">Search Component</div>,
}));

describe('LandlordReviewHeader', () => {
  const defaultProps = {
    viewMode: 'grid' as const,
    setViewMode: jest.fn(),
    selectedStatus: 'all',
    setSelectedStatus: jest.fn(),
    selectedRating: 'all',
    setSelectedRating: jest.fn(),
    handleGenerateReport: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    rawReviews: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header correctly', () => {
    render(<LandlordReviewHeader {...defaultProps} />);
    expect(screen.getByText('Guest Reviews')).toBeInTheDocument();
    expect(screen.getByTestId('review-search')).toBeInTheDocument();
  });

  it('calls handleGenerateReport when Generate Report is clicked', () => {
    render(<LandlordReviewHeader {...defaultProps} />);
    const btn = screen.getByTestId('generate-report');
    fireEvent.click(btn);
    expect(defaultProps.handleGenerateReport).toHaveBeenCalled();
  });

  it('calls setViewMode when grid/list toggle is clicked', () => {
    render(<LandlordReviewHeader {...defaultProps} />);
    // The grid and list icons are inside buttons, let's just trigger click on buttons
    // Since tabler icons are used, we can find buttons by clicking all buttons 
    // and check if setViewMode is called.
    const buttons = screen.getAllByRole('button');
    // Find the button that sets view mode to 'list'
    // It is rendered with class transition-all duration-300
    // As a simple test we can just check if any button click triggers setViewMode
    buttons.forEach(btn => fireEvent.click(btn));
    expect(defaultProps.setViewMode).toHaveBeenCalled();
  });
});
