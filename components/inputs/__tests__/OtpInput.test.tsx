import React from 'react';
import { render, screen } from '@testing-library/react';
import OtpInput from '../OtpInput';

describe('OtpInput', () => {
  it('renders correctly', () => {
    const mockWatch = jest.fn().mockReturnValue('123');
    const mockRegister = jest.fn().mockReturnValue({ onChange: jest.fn() });
    render(<OtpInput id="test-otp" label="OTP" register={mockRegister} watch={mockWatch} errors={{}} />);
    expect(screen.getByText('OTP')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const mockWatch = jest.fn().mockReturnValue('123');
    const mockRegister = jest.fn().mockReturnValue({ onChange: jest.fn() });
    const error = { type: 'required', message: 'Invalid OTP' } as any;
    render(<OtpInput id="test-otp" label="OTP" register={mockRegister} watch={mockWatch} errors={{ "test-otp": error }} />);
    expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
  });
});
