import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenerateReportButton from '../GenerateReportButton';

// Mock child components
jest.mock('../ReportExportModal', () => {
  return function MockReportExportModal({ isOpen, onClose, onGenerate, isGenerating }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-report-export-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onGenerate({ format: 'pdf', scope: 'filtered', includeSummary: true, includeGlossary: true })} disabled={isGenerating}>Generate PDF</button>
        <button onClick={() => onGenerate({ format: 'csv', scope: 'filtered', includeSummary: true, includeGlossary: true })} disabled={isGenerating}>Generate CSV</button>
        <button onClick={() => onGenerate({ format: 'excel', scope: 'filtered', includeSummary: true, includeGlossary: true })} disabled={isGenerating}>Generate EXCEL</button>
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
    expect(screen.getByText('Export Report')).toBeInTheDocument();
  });

  it('opens modal on click', () => {
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    
    fireEvent.click(screen.getByText('Export Report'));
    expect(screen.getByTestId('mock-report-export-modal')).toBeInTheDocument();
  });

  it('handles PDF generation', async () => {
    mockOnGeneratePDF.mockResolvedValueOnce(undefined);
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    
    // Open modal
    fireEvent.click(screen.getByText('Export Report'));
    
    // Trigger generation inside modal
    fireEvent.click(screen.getByText('Generate PDF'));
    
    await waitFor(() => {
      expect(mockOnGeneratePDF).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    // Modal should close after successful generation
    await waitFor(() => {
      expect(screen.queryByTestId('mock-report-export-modal')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('handles CSV generation', async () => {
    mockOnGenerateCSV.mockResolvedValueOnce(undefined);
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} onGenerateCSV={mockOnGenerateCSV} />);
    
    fireEvent.click(screen.getByText('Export Report'));
    fireEvent.click(screen.getByText('Generate CSV'));
    
    await waitFor(() => {
      expect(mockOnGenerateCSV).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('handles EXCEL generation', async () => {
    mockOnGenerateExcel.mockResolvedValueOnce(undefined);
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} onGenerateExcel={mockOnGenerateExcel} />);
    
    fireEvent.click(screen.getByText('Export Report'));
    fireEvent.click(screen.getByText('Generate EXCEL'));
    
    await waitFor(() => {
      expect(mockOnGenerateExcel).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('handles errors during generation without crashing', async () => {
    mockOnGeneratePDF.mockRejectedValueOnce(new Error('Generation failed'));
    
    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    
    fireEvent.click(screen.getByText('Export Report'));
    fireEvent.click(screen.getByText('Generate PDF'));
    
    await waitFor(() => {
      expect(mockOnGeneratePDF).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    expect(consoleSpy).toHaveBeenCalledWith('Report generation error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('disables button while generating', async () => {
    // Return a promise that doesn't resolve immediately
    let resolvePromise: any;
    mockOnGeneratePDF.mockReturnValue(new Promise(resolve => {
      resolvePromise = resolve;
    }));
    
    render(<GenerateReportButton onGeneratePDF={mockOnGeneratePDF} />);
    
    fireEvent.click(screen.getByText('Export Report'));
    fireEvent.click(screen.getByText('Generate PDF'));
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Exporting.../i })).toBeDisabled();
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });
    
    // Resolve the promise to clean up
    resolvePromise();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export Report/i })).not.toBeDisabled();
      expect(screen.getByText('Export Report')).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000);
});

