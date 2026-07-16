import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ImageUpload from '../ImageUpload';
import { useEdgeStore } from '@/lib/edgestore';
import { compressImage } from '@/utils/image-compression';

// Mock child components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, sizes, unoptimized, className }: any) {
    return <img src={src} alt={alt} data-fill={fill} data-sizes={sizes} data-unoptimized={unoptimized} className={className} data-testid="mock-next-image" />;
  };
});

jest.mock('../Loader', () => {
  return function MockLoader() {
    return <div data-testid="mock-loader">Loading...</div>;
  };
});

jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: jest.fn(),
}));

jest.mock('@/utils/image-compression', () => ({
  compressImage: jest.fn(),
}));

describe('ImageUpload', () => {
  const mockOnChange = jest.fn();
  const mockUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useEdgeStore as jest.Mock).mockReturnValue({
      edgestore: {
        publicFiles: {
          upload: mockUpload,
        },
      },
    });
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:http://localhost/test-blob');
    
    // Mock compressImage to just return the file
    (compressImage as jest.Mock).mockImplementation((file) => Promise.resolve(file));
  });

  it('renders initial state correctly', () => {
    render(<ImageUpload onChange={mockOnChange} />);
    
    expect(screen.getByText('Upload image')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-next-image')).not.toBeInTheDocument();
  });

  it('renders initial image if provided', () => {
    render(<ImageUpload onChange={mockOnChange} initialImage="http://example.com/image.jpg" />);
    
    const img = screen.getByTestId('mock-next-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/image.jpg');
  });

  it('handles image upload via input', async () => {
    mockUpload.mockResolvedValueOnce({ url: 'https://edgestore.dev/test-image.jpg' });
    
    render(<ImageUpload onChange={mockOnChange} />);
    
    const input = screen.getByLabelText('Upload image') as HTMLInputElement;
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    
    // Wait for the upload process to complete
    await waitFor(() => {
      expect(compressImage).toHaveBeenCalledWith(file);
      expect(mockUpload).toHaveBeenCalledWith({
        file,
        options: { replaceTargetUrl: '' }
      });
      expect(mockOnChange).toHaveBeenCalledWith('image', 'https://edgestore.dev/test-image.jpg');
    });
  });

  it('ignores non-image files', async () => {
    render(<ImageUpload onChange={mockOnChange} />);
    
    const input = screen.getByLabelText('Upload image') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    
    expect(compressImage).not.toHaveBeenCalled();
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('handles drag events', () => {
    render(<ImageUpload onChange={mockOnChange} />);
    
    const label = screen.getByText('Upload image').closest('label')!;
    
    fireEvent.dragOver(label);
    expect(label.className).toContain('border-red-500'); // isDragging is true
    
    fireEvent.dragLeave(label);
    expect(label.className).not.toContain('border-red-500'); // isDragging is false
  });

  it('handles drop event', async () => {
    mockUpload.mockResolvedValueOnce({ url: 'https://edgestore.dev/test-image.jpg' });
    
    render(<ImageUpload onChange={mockOnChange} />);
    
    const label = screen.getByText('Upload image').closest('label')!;
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    
    await act(async () => {
      fireEvent.drop(label, {
        dataTransfer: {
          files: [file]
        }
      });
    });
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('sanitizes unsafe image URLs', async () => {
    render(<ImageUpload onChange={mockOnChange} initialImage="javascript:alert(1)" />);
    
    // getSafeImageSrc returns '' for unsafe URLs, so it falls back to empty state
    expect(screen.queryByTestId('mock-next-image')).not.toBeInTheDocument();
    expect(screen.getByText('Upload image')).toBeInTheDocument();
  });
});
