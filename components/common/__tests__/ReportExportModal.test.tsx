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

  it('calls onClose when close button is clicked', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    // Header close button
    const closeButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    fireEvent.click(closeButtons[0]);
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

  it('selects PDF format by default and generates', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Generate Report'));
    expect(mockOnGenerate).toHaveBeenCalledWith('PDF', undefined);
  });

  it('can select CSV format and generate', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('CSV Data'));
    fireEvent.click(screen.getByText('Generate Report'));
    
    expect(mockOnGenerate).toHaveBeenCalledWith('CSV', undefined);
  });

  it('can select EXCEL format and generate', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Excel Spreadsheet'));
    fireEvent.click(screen.getByText('Generate Report'));
    
    expect(mockOnGenerate).toHaveBeenCalledWith('EXCEL', undefined);
  });

  it('handles preset selection', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Today'));
    fireEvent.click(screen.getByText('Generate Report'));
    
    expect(mockOnGenerate).toHaveBeenCalledWith('PDF', expect.objectContaining({
      from: expect.any(Date),
      to: expect.any(Date)
    }));
  });

  it('handles preset "Last Month"', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    fireEvent.click(screen.getByText('Last Month'));
    fireEvent.click(screen.getByText('Generate Report'));
    
    expect(mockOnGenerate).toHaveBeenCalledWith('PDF', expect.objectContaining({
      from: expect.any(Date),
      to: expect.any(Date)
    }));
  });

  it('handles custom date range selection from DayPicker', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
      />
    );
    
    // Simulate selecting a custom range from the DayPicker mock
    fireEvent.click(screen.getByText('Select Range'));
    
    fireEvent.click(screen.getByText('Generate Report'));
    
    expect(mockOnGenerate).toHaveBeenCalledWith('PDF', expect.objectContaining({
      from: new Date('2023-01-01'),
      to: new Date('2023-01-31')
    }));
  });

  it('shows generating state when isGenerating is true', () => {
    render(
      <ReportExportModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onGenerate={mockOnGenerate} 
        isGenerating={true}
      />
    );
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    
    // Generate button should be disabled
    const generateBtn = screen.getByRole('button', { name: /generating/i });
    expect(generateBtn).toBeDisabled();
    
    // Cancel button should be disabled
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeDisabled();
  });
});
