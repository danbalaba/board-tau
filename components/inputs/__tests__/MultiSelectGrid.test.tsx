import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MultiSelectGrid from '../MultiSelectGrid';

describe('MultiSelectGrid', () => {
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ];

  it('renders correctly', () => {
    render(<MultiSelectGrid options={options} selected={[]} onToggle={jest.fn()} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles toggle', () => {
    const mockOnToggle = jest.fn();
    render(<MultiSelectGrid options={options} selected={['opt1']} onToggle={mockOnToggle} />);
    
    fireEvent.click(screen.getByText('Option 2'));
    expect(mockOnToggle).toHaveBeenCalledWith('opt2');
  });
});
