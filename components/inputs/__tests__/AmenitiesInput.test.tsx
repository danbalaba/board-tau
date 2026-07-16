import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AmenitiesInput from '../AmenitiesInput';

describe('AmenitiesInput', () => {
  const MockIcon = () => <div data-testid="mock-icon" />;

  it('renders correctly', () => {
    render(<AmenitiesInput icon={MockIcon} label="Wifi" selected={false} onClick={jest.fn()} />);
    expect(screen.getByText('Wifi')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = jest.fn();
    render(<AmenitiesInput icon={MockIcon} label="Wifi" selected={false} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByText('Wifi'));
    expect(mockOnClick).toHaveBeenCalledWith('Wifi');
  });
});
