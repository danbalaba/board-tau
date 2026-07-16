import React from 'react';
import { render, screen } from '@testing-library/react';
import WalkInGuestStep from '../steps/walk-in-guest-step';

describe('WalkInGuestStep', () => {
  const mockRegister = jest.fn();

  const mockProps = {
    register: mockRegister as any,
    errors: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input fields correctly', () => {
    render(<WalkInGuestStep {...mockProps} />);
    expect(screen.getByPlaceholderText('e.g. John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. 09123456789')).toBeInTheDocument();
  });

  it('displays error messages when errors exist', () => {
    const errorProps = {
      ...mockProps,
      errors: {
        guestName: { type: 'required', message: 'Name is required' }
      }
    };
    render(<WalkInGuestStep {...errorProps} />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });
});
