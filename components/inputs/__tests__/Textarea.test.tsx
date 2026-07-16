import React from 'react';
import { render, screen } from '@testing-library/react';
import Textarea from '../Textarea';

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea id="test-textarea" label="Test Label" />);
    expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    const error = { type: 'required', message: 'Text is required' } as any;
    render(<Textarea id="test-textarea" label="Test Label" errors={{ "test-textarea": error }} />);
    expect(screen.getByText('Text is required')).toBeInTheDocument();
  });

  it('handles required props', () => {
    const mockRegister = jest.fn();
    render(<Textarea id="test-textarea" label="Test Label" register={mockRegister} required />);
    
    expect(mockRegister).toHaveBeenCalledWith('test-textarea', { required: 'This field is required' });
  });
});
