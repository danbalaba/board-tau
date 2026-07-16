import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryButton from '../CategoryButton';

describe('CategoryButton', () => {
  const MockIcon = () => <div data-testid="mock-icon" />;

  it('renders correctly', () => {
    const mockWatch = jest.fn().mockReturnValue('Other');
    render(<CategoryButton icon={MockIcon} label="Beach" description="Sandy" value="Beach" onClick={jest.fn()} watch={mockWatch} />);
    expect(screen.getByText('Beach')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = jest.fn();
    const mockWatch = jest.fn().mockReturnValue('Other');
    render(<CategoryButton icon={MockIcon} label="Beach" description="Sandy" value="Beach" onClick={mockOnClick} watch={mockWatch} />);
    
    fireEvent.click(screen.getByText('Beach'));
    expect(mockOnClick).toHaveBeenCalledWith('category', 'Beach');
  });
});
