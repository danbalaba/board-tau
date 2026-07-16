import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input id="test-input" label="Test Label" />);
    // The label text will have a `*` because it's required by default
    expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    const error = { type: 'required', message: 'This field is required' } as any;
    render(<Input id="test-input" label="Test Label" errors={{ "test-input": error }} />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const mockRegister = jest.fn();
    render(<Input id="test-input" label="Test Label" register={mockRegister} />);
    
    // Default required is true, so it passes 'This field is required'
    expect(mockRegister).toHaveBeenCalledWith('test-input', { required: 'This field is required' });
  });
});
