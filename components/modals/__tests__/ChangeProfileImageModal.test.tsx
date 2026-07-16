import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangeProfileImageModal from '../ChangeProfileImageModal';
import { useEdgeStore } from '@/lib/edgestore';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

// Mock URL
global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-blob-url');

jest.mock('@/components/modals/Modal', () => {
  return function MockModal({ children, isOpen, title }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/common/Button', () => {
  return function MockButton({ children, onClick, disabled }: any) {
    return <button onClick={onClick} disabled={disabled}>{children}</button>;
  };
});

jest.mock('@/components/common/Avatar', () => {
  return function MockAvatar({ src }: any) {
    return <img data-testid="mock-avatar" src={src} alt="Avatar" />;
  };
});

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, className, ...props }: any, ref: any) => <div ref={ref} className={className} {...props}>{children}</div>),
      circle: ({ ...props }: any) => <circle {...props} />
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

describe('ChangeProfileImageModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockSuccess = jest.fn();
  const mockError = jest.fn();
  const mockUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useResponsiveToast as jest.Mock).mockReturnValue({
      success: mockSuccess,
      error: mockError,
    });
    (useEdgeStore as jest.Mock).mockReturnValue({
      edgestore: {
        publicFiles: {
          upload: mockUpload,
        },
      },
    });
  });

  const createFile = (name: string, size: number, type: string) => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  it('renders with current image', () => {
    render(
      <ChangeProfileImageModal 
        isOpen={true} 
        onClose={mockOnClose} 
        currentImage="https://example.com/avatar.jpg" 
        onUpdate={mockOnUpdate} 
      />
    );
    
    expect(screen.getByTestId('mock-avatar')).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows error when file is too large', () => {
    const { container } = render(
      <ChangeProfileImageModal isOpen={true} onClose={mockOnClose} currentImage={null} onUpdate={mockOnUpdate} />
    );
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = createFile('large.jpg', 3 * 1024 * 1024, 'image/jpeg'); // 3MB
    
    fireEvent.change(input, { target: { files: [largeFile] } });
    
    expect(mockError).toHaveBeenCalledWith(expect.objectContaining({
      title: "File Too Large"
    }));
    expect(input.value).toBe('');
  });

  it('shows error when file is invalid type', () => {
    const { container } = render(
      <ChangeProfileImageModal isOpen={true} onClose={mockOnClose} currentImage={null} onUpdate={mockOnUpdate} />
    );
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const pdfFile = createFile('document.pdf', 1024, 'application/pdf');
    
    fireEvent.change(input, { target: { files: [pdfFile] } });
    
    expect(mockError).toHaveBeenCalledWith(expect.objectContaining({
      title: "Invalid File Type"
    }));
    expect(input.value).toBe('');
  });

  it('preview updates and upload works successfully', async () => {
    mockUpload.mockResolvedValue({ url: 'https://example.com/new-avatar.jpg' });
    mockOnUpdate.mockResolvedValue(undefined);
    
    const { container } = render(
      <ChangeProfileImageModal isOpen={true} onClose={mockOnClose} currentImage={null} onUpdate={mockOnUpdate} />
    );
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = createFile('avatar.jpg', 1024, 'image/jpeg');
    
    fireEvent.change(input, { target: { files: [validFile] } });
    
    // UI should show reset and upload buttons
    expect(screen.getByText('Reset')).toBeInTheDocument();
    
    const uploadBtn = screen.getByText('Set New Avatar');
    fireEvent.click(uploadBtn);
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(expect.objectContaining({
        file: validFile
      }));
      expect(mockOnUpdate).toHaveBeenCalledWith('https://example.com/new-avatar.jpg');
      expect(mockSuccess).toHaveBeenCalledWith('Profile picture updated successfully');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles upload errors properly', async () => {
    mockUpload.mockRejectedValue(new Error('Upload failed'));
    
    const { container } = render(
      <ChangeProfileImageModal isOpen={true} onClose={mockOnClose} currentImage={null} onUpdate={mockOnUpdate} />
    );
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = createFile('avatar.jpg', 1024, 'image/jpeg');
    
    fireEvent.change(input, { target: { files: [validFile] } });
    
    const uploadBtn = screen.getByText('Set New Avatar');
    fireEvent.click(uploadBtn);
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledWith('Failed to upload image. Please try again.');
      expect(mockOnUpdate).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('reset button clears the selected file', () => {
    const { container } = render(
      <ChangeProfileImageModal isOpen={true} onClose={mockOnClose} currentImage="old.jpg" onUpdate={mockOnUpdate} />
    );
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = createFile('avatar.jpg', 1024, 'image/jpeg');
    
    fireEvent.change(input, { target: { files: [validFile] } });
    
    const resetBtn = screen.getByText('Reset');
    fireEvent.click(resetBtn);
    
    // Should go back to Cancel button
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.queryByText('Set New Avatar')).not.toBeInTheDocument();
  });
});
