import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomImage from '../Image';

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, className, onLoad, priority, fill, sizes, unoptimized }: any) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={onLoad}
        data-priority={priority}
        data-fill={fill}
        data-sizes={sizes}
        data-unoptimized={unoptimized}
        data-testid="mock-next-image"
      />
    );
  };
});

describe('CustomImage', () => {
  it('renders correctly with default props', () => {
    render(<CustomImage imageSrc="/test.jpg" alt="Test Image" />);
    
    const img = screen.getByTestId('mock-next-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test Image');
    expect(img).toHaveClass('opacity-0'); // Initially not loaded
    expect(img).toHaveAttribute('data-priority', 'false');
    expect(img).toHaveAttribute('data-fill', 'false');
    expect(img).toHaveAttribute('data-unoptimized', 'true');
  });

  it('changes classes when image loads', () => {
    render(<CustomImage imageSrc="/test.jpg" alt="Test Image" />);
    
    const img = screen.getByTestId('mock-next-image');
    expect(img).toHaveClass('opacity-0');
    
    // Trigger load
    fireEvent.load(img);
    
    expect(img).not.toHaveClass('opacity-0');
    expect(img).toHaveClass('opacity-100');
    expect(img).toHaveClass('scale-100');
  });

  it('applies zoom effect class', () => {
    render(<CustomImage imageSrc="/test.jpg" alt="Test Image" effect="zoom" />);
    
    const img = screen.getByTestId('mock-next-image');
    expect(img).toHaveClass('scale-95');
  });

  it('passes additional props like priority and sizes', () => {
    render(
      <CustomImage 
        imageSrc="/test.jpg" 
        alt="Test Image" 
        priority={true} 
        fill={true} 
        sizes="(max-width: 768px) 100vw, 33vw" 
      />
    );
    
    const img = screen.getByTestId('mock-next-image');
    expect(img).toHaveAttribute('data-priority', 'true');
    expect(img).toHaveAttribute('data-fill', 'true');
    expect(img).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, 33vw');
  });

  it('applies custom className', () => {
    render(<CustomImage imageSrc="/test.jpg" alt="Test Image" className="my-custom-class" />);
    
    const img = screen.getByTestId('mock-next-image');
    expect(img).toHaveClass('my-custom-class');
  });
});
