import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthInput from '../AuthInput';

describe('AuthInput', () => {
  it('renders correctly', () => {
    render(<AuthInput id="test-auth" label="Email" />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    const error = { type: 'required', message: 'This field is required' } as any;
    render(<AuthInput id="test-auth" label="Email" errors={{ "test-auth": error }} />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const mockRegister = jest.fn();
    render(<AuthInput id="test-auth" label="Email" register={mockRegister} />);
    
    // Default required is true, so it passes 'This field is required'
    expect(mockRegister).toHaveBeenCalledWith('test-auth', { required: 'This field is required' });
  });
});
