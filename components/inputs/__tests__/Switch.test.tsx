import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Switch from '../Switch';

describe('Switch', () => {
  it('renders correctly', () => {
    render(<Switch checked={false} onChange={jest.fn()} label="Enable" />);
    expect(screen.getByRole('switch', { name: "Enable" })).toBeInTheDocument();
  });

  it('handles change', () => {
    const mockOnChange = jest.fn();
    render(<Switch checked={false} onChange={mockOnChange} label="Enable" />);
    
    fireEvent.click(screen.getByRole('switch'));
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });
});
