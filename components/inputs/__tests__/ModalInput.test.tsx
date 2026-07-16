import React from 'react';
import { render, screen } from '@testing-library/react';
import ModalInput from '../ModalInput';

describe('ModalInput', () => {
  it('renders correctly', () => {
    render(<ModalInput id="test-modal-input" label="Test Label" />);
    // Since it's required by default, it will have *
    expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    const error = { type: 'required', message: 'This field is required' } as any;
    render(<ModalInput id="test-modal-input" label="Test Label" errors={{ "test-modal-input": error }} />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const mockRegister = jest.fn();
    render(<ModalInput id="test-modal-input" label="Test Label" register={mockRegister} />);
    
    // Default required is true, so it passes 'This field is required'
    expect(mockRegister).toHaveBeenCalledWith('test-modal-input', { required: 'This field is required' });
  });
});
