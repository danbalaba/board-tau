import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenerateReportButton from '../GenerateReportButton';

// Mock child components
jest.mock('../Button', () => {
  return function MockButton({ children, onClick, disabled, 'data-testid': testId }: any) {
    return <button onClick={onClick} disabled={disabled} data-testid={testId || 'mock-button'}>{children}</button>;
  };
});

jest.mock('../ReportExportModal', () => {
  return function MockReportExportModal({ isOpen, onClose, onGenerate, isGenerating }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-report-export-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onGenerate('PDF')} disabled={isGenerating}>Generate PDF</button>
        <button onClick={() => onGenerate('CSV')} disabled={isGenerating}>Generate CSV</button>
        <button onClick={() => onGenerate('EXCEL')} disabled={isGenerating}>Generate EXCEL</button>
      </div>
    );
  };
});

describe('GenerateReportButton', () => {
  const mockOnGeneratePDF = jest.fn();
  const mockOnGenerateCSV = jest.fn();
  const mockOnGenerateExcel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default label', () => {
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
  });

  it('opens modal on click', () => {
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    
    fireEvent.click(screen.getByTestId('mock-button'));
    expect(screen.getByTestId('mock-report-export-modal')).toBeInTheDocument();
  });

  it('handles PDF generation', async () => {
    mockOnGeneratePDF.mockResolvedValueOnce(undefined);
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    
    // Open modal
    fireEvent.click(screen.getByTestId('mock-button'));
    
    // Trigger generation inside modal
    fireEvent.click(screen.getByText('Generate PDF'));
    
    await waitFor(() => {
      expect(mockOnGeneratePDF).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Modal should close after successful generation
    await waitFor(() => {
      expect(screen.queryByTestId('mock-report-export-modal')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles CSV generation', async () => {
    mockOnGenerateCSV.mockResolvedValueOnce(undefined);
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} onGenerateCSV={mockOnGenerateCSV} />);
    
    fireEvent.click(screen.getByTestId('mock-button'));
    fireEvent.click(screen.getByText('Generate CSV'));
    
    await waitFor(() => {
      expect(mockOnGenerateCSV).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('handles EXCEL generation', async () => {
    mockOnGenerateExcel.mockResolvedValueOnce(undefined);
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} onGenerateExcel={mockOnGenerateExcel} />);
    
    fireEvent.click(screen.getByTestId('mock-button'));
    fireEvent.click(screen.getByText('Generate EXCEL'));
    
    await waitFor(() => {
      expect(mockOnGenerateExcel).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('handles errors during generation without crashing', async () => {
    mockOnGeneratePDF.mockRejectedValueOnce(new Error('Generation failed'));
    
    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    
    fireEvent.click(screen.getByTestId('mock-button'));
    fireEvent.click(screen.getByText('Generate PDF'));
    
    await waitFor(() => {
      expect(mockOnGeneratePDF).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error generating PDF report:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('disables button while generating', async () => {
    // Return a promise that doesn't resolve immediately
    let resolvePromise: any;
    mockOnGeneratePDF.mockReturnValue(new Promise(resolve => {
      resolvePromise = resolve;
    }));
    
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    
    fireEvent.click(screen.getByTestId('mock-button'));
    fireEvent.click(screen.getByText('Generate PDF'));
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('mock-button')).toBeDisabled();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
    
    // Resolve the promise to clean up
    resolvePromise();
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-button')).not.toBeDisabled();
      expect(screen.getByText('Generate Report')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
