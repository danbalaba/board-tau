import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModernSlider } from '../ModernSlider';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ModernSlider', () => {
  it('renders correctly', () => {
    render(<ModernSlider defaultValue={[50]} max={100} step={1} />);
    
    // Radix UI Slider uses a complex DOM structure, but we can check for its role
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('applies custom className', () => {
    render(<ModernSlider className="custom-slider-class" defaultValue={[50]} />);
    
    // The outermost wrapper gets the custom class
    // Depending on exactly how Radix structures it, we can query by class
    const container = document.querySelector('.custom-slider-class');
    expect(container).toBeInTheDocument();
  });

  it('forwards props to Root element', () => {
    const { container } = render(<ModernSlider disabled defaultValue={[50]} aria-label="Test Slider" />);
    
    expect(container.firstChild).toHaveAttribute('aria-disabled', 'true');
  });
});
