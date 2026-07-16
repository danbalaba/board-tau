import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUpload from '../FileUpload';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

describe('FileUpload', () => {
  const mockOnFileSelect = jest.fn();
  const mockOnPreview = jest.fn();
  const mockToastError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useResponsiveToast as jest.Mock).mockReturnValue({
      error: mockToastError,
      success: jest.fn(),
    });
    // Mock URL.createObjectURL if necessary
    global.URL.createObjectURL = jest.fn();
  });

  const setupFile = (name: string, type: string, size: number) => {
    return new File(['content'], name, { type });
  };

  it('renders initial upload state correctly', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PDF, JPG, or PNG (max. 5MB)')).toBeInTheDocument();
  });

  it('renders required asterisk if required prop is true', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('handles valid file selection', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} />);
    
    const input = screen.getByLabelText('Upload File') as HTMLInputElement;
    const file = setupFile('test.pdf', 'application/pdf', 1024);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('shows error for invalid file type', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} />);
    
    const input = screen.getByLabelText('Upload File') as HTMLInputElement;
    const file = setupFile('test.txt', 'text/plain', 1024);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnFileSelect).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('invalid file type'), expect.any(Object));
  });

  it('shows error for file that is too large', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} />);
    
    const input = screen.getByLabelText('Upload File') as HTMLInputElement;
    // 6MB file
    const file = setupFile('large.pdf', 'application/pdf', 6 * 1024 * 1024);
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnFileSelect).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('too large'), expect.any(Object));
  });

  it('handles file removal', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} fileName="uploaded.pdf" />);
    
    expect(screen.getByText('uploaded.pdf')).toBeInTheDocument();
    
    const removeButton = screen.getAllByRole('button').find(b => b.querySelector('svg.lucide-x'));
    expect(removeButton).toBeInTheDocument();
    
    fireEvent.click(removeButton!);
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(null);
  });

  it('calls onPreview when preview button is clicked', () => {
    render(
      <FileUpload 
        id="test-upload" 
        label="Upload File" 
        onFileSelect={mockOnFileSelect} 
        fileName="uploaded.pdf"
        onPreview={mockOnPreview}
      />
    );
    
    fireEvent.click(screen.getByText('uploaded.pdf'));
    
    expect(mockOnPreview).toHaveBeenCalled();
  });

  it('opens fileUrl in new tab when no onPreview is provided but fileUrl is present', () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    
    render(
      <FileUpload 
        id="test-upload" 
        label="Upload File" 
        onFileSelect={mockOnFileSelect} 
        fileName="uploaded.pdf"
        fileUrl="https://example.com/uploaded.pdf"
      />
    );
    
    fireEvent.click(screen.getByText('uploaded.pdf'));
    
    expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/uploaded.pdf', '_blank');
    windowOpenSpy.mockRestore();
  });

  it('handles drag and drop events', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} />);
    
    const dropZone = screen.getByText('Click to upload or drag and drop').parentElement!;
    
    fireEvent.dragEnter(dropZone);
    expect(dropZone.className).toContain('border-primary'); // checks if isDragging class is applied
    
    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).not.toContain('border-primary');
    
    fireEvent.dragOver(dropZone);
    expect(dropZone.className).toContain('border-primary');
    
    const file = setupFile('test.pdf', 'application/pdf', 1024);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
      }
    });
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    expect(dropZone.className).not.toContain('border-primary');
  });

  it('renders error messages passed via props', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} errors="File is required" />);
    
    expect(screen.getByText('File is required')).toBeInTheDocument();
  });

  it('handles object errors passed via props', () => {
    render(<FileUpload id="test-upload" label="Upload File" onFileSelect={mockOnFileSelect} errors={{ message: 'Specific object error' }} />);
    
    expect(screen.getByText('Specific object error')).toBeInTheDocument();
  });
});
