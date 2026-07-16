import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MediaPreviewOverlay from '../MediaPreviewOverlay';

// Mock react-dom createPortal
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('MediaPreviewOverlay', () => {
  const mockOnClose = jest.fn();
  const mockOnNavigate = jest.fn();
  const sampleImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MediaPreviewOverlay 
        isOpen={false} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
      />
    );
    
    expect(screen.getByText('Media Preview')).toBeInTheDocument();
    expect(screen.getByText('Item 1 of 3')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
        title="Custom Title"
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
      />
    );
    
    // There are a few SVGs, the close button is the one with X
    const closeBtn = screen.getAllByRole('button')[0]; // First button is usually the close button in the header
    fireEvent.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when background is clicked', () => {
    render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
      />
    );
    
    // Get the background overlay (it's the parent div of the content)
    const overlay = screen.getByText('Media Preview').closest('.fixed.inset-0.z-\\[99999\\]');
    fireEvent.click(overlay!);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onClose when image is clicked', () => {
    render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
      />
    );
    
    const img = screen.getByRole('img');
    fireEvent.click(img);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('navigates to next image', () => {
    render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
        onNavigate={mockOnNavigate}
      />
    );
    
    // Find the next button (contains ChevronRight)
    // The previous button is index 1, next button is index 2, close is index 0
    const buttons = screen.getAllByRole('button');
    // We can also find it by class or just trying the 3rd button
    const nextBtn = buttons[2]; 
    
    fireEvent.click(nextBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith(1); // 0 + 1
  });

  it('navigates to prev image with wrap around', () => {
    render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
        onNavigate={mockOnNavigate}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    const prevBtn = buttons[1]; 
    
    fireEvent.click(prevBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith(2); // Wraps around to 2 (last index)
  });

  it('navigates when dots are clicked', () => {
    render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
        onNavigate={mockOnNavigate}
      />
    );
    
    // The dots are the last 3 buttons
    const buttons = screen.getAllByRole('button');
    const dotBtn = buttons[buttons.length - 1]; // The last dot (index 2)
    
    fireEvent.click(dotBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith(2);
  });

  it('disables body scroll when open', () => {
    const originalStyle = document.body.style.overflow;
    
    const { unmount } = render(
      <MediaPreviewOverlay 
        isOpen={true} 
        onClose={mockOnClose} 
        images={sampleImages} 
        currentIndex={0} 
      />
    );
    
    expect(document.body.style.overflow).toBe('hidden');
    
    unmount();
    
    expect(document.body.style.overflow).toBe(originalStyle);
  });
});
