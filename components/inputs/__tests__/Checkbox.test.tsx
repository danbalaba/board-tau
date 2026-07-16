import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  it('renders correctly', () => {
    const mockRegister = jest.fn().mockReturnValue({ onChange: jest.fn() });
    const mockWatch = jest.fn().mockReturnValue(false);
    
    render(<Checkbox id="test-check" label="Accept terms" register={mockRegister} watch={mockWatch} />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });
});
