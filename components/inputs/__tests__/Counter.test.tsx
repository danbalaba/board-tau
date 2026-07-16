import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from '../Counter';

describe('Counter', () => {
  it('renders correctly', () => {
    const mockWatch = jest.fn().mockReturnValue(2);
    render(<Counter name="guests" title="Guests" subtitle="Number of guests" watch={mockWatch} onChange={jest.fn()} />);
    expect(screen.getByText('Guests')).toBeInTheDocument();
    expect(screen.getByText('Number of guests')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('increments value', () => {
    const mockOnChange = jest.fn();
    const mockWatch = jest.fn().mockReturnValue(2);
    render(<Counter name="guests" title="Guests" subtitle="Number of guests" watch={mockWatch} onChange={mockOnChange} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(mockOnChange).toHaveBeenCalledWith('guests', 3);
  });

  it('decrements value if greater than 1', () => {
    const mockOnChange = jest.fn();
    const mockWatch = jest.fn().mockReturnValue(2);
    render(<Counter name="guests" title="Guests" subtitle="Number of guests" watch={mockWatch} onChange={mockOnChange} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // decrement
    expect(mockOnChange).toHaveBeenCalledWith('guests', 1);
  });
});
