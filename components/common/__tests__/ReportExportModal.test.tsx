import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportExportModal from '../ReportExportModal';

// Mock react-dom so we don't have to deal with portals in tests (simplifies finding elements)
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Mock DayPicker
jest.mock('react-day-picker', () => ({
  DayPicker: ({ onSelect }: any) => (
    <div data-testid="mock-day-picker">
      <button 
        onClick={() => onSelect({ from: new Date('2023-01-01'), to: new Date('2023-01-31') })}
      >
        Select Range
      </button>
    </div>
  ),
}));

describe('ReportExportModal', () => {
  const mockOnClose = jest.fn();
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ReportExportModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders when open', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    expect(screen.getByText('Export Business Report')).toBeInTheDocument();
  });

  it('calls onClose when top drag handle bar is clicked', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    // Top drag handle bar
    const dragHandle = screen.getByTitle('Slide down to close');
    fireEvent.click(dragHandle);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows required validation toast and error when downloading with no scope or format selected', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Download Report'));
    expect(mockOnGenerate).not.toHaveBeenCalled();
    expect(screen.getByText('Scope Selection Required')).toBeInTheDocument();
    expect(screen.getByText('Format Selection Required')).toBeInTheDocument();
  });

  it('allows selecting scope and format and then downloading report', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Filtered View'));
    fireEvent.click(screen.getByText('Vector PDF Report'));
    fireEvent.click(screen.getByText('Download PDF Report'));

    expect(mockOnGenerate).toHaveBeenCalledWith({
      scope: 'filtered',
      format: 'pdf',
      includeSummary: true,
      includeGlossary: true
    });
  });

  it('can select CSV format and generate', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Filtered View'));
    fireEvent.click(screen.getByText('CSV Raw Data'));
    fireEvent.click(screen.getByText('Download CSV Report'));
    
    expect(mockOnGenerate).toHaveBeenCalledWith({
      scope: 'filtered',
      format: 'csv',
      includeSummary: true,
      includeGlossary: true
    });
  });

  it('can select EXCEL format and generate', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Complete History'));
    fireEvent.click(screen.getByText('2-Tab Excel (.xlsx)'));
    fireEvent.click(screen.getByText('Download EXCEL Report'));
    
    expect(mockOnGenerate).toHaveBeenCalledWith({
      scope: 'all',
      format: 'excel',
      includeSummary: true,
      includeGlossary: true
    });
  });

  it('shows generating state when isGenerating is true', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
        scope="filtered"
        format="pdf"
        isGenerating={true}
      />
    );
    
    expect(screen.getByText('Generating PDF...')).toBeInTheDocument();
    
    // Cancel button should be disabled
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeDisabled();
  });
});
