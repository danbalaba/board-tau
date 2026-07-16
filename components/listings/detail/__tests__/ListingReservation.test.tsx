import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListingReservation from '../ListingReservation';

describe('ListingReservation', () => {
  const mockProps = {
    price: 1500,
    totalPrice: 4500,
    moveInMonth: '2026-08',
    setMoveInMonth: jest.fn(),
    stayDuration: '3 months',
    setStayDuration: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
  };

  it('renders correctly', () => {
    render(<ListingReservation {...mockProps} />);
    
    expect(screen.getByText('₱ 1,500')).toBeInTheDocument();
    expect(screen.getByText('per month')).toBeInTheDocument();
    expect(screen.getAllByText('₱ 4,500')).toHaveLength(2);
    
    expect(screen.getByDisplayValue('2026-08')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inquire Now/i })).toBeInTheDocument();
  });

  it('calls setMoveInMonth when month input changes', () => {
    render(<ListingReservation {...mockProps} />);
    
    const monthInput = screen.getByDisplayValue('2026-08');
    fireEvent.change(monthInput, { target: { value: '2026-09' } });
    
    expect(mockProps.setMoveInMonth).toHaveBeenCalledWith('2026-09');
  });

  it('calls setStayDuration when duration select changes', () => {
    render(<ListingReservation {...mockProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'long-term' } });
    
    expect(mockProps.setStayDuration).toHaveBeenCalledWith('long-term');
  });

  it('calls onSubmit when button is clicked', () => {
    render(<ListingReservation {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /Inquire Now/i });
    fireEvent.click(button);
    
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<ListingReservation {...mockProps} isLoading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.queryByText('Inquire Now')).not.toBeInTheDocument();
  });
});
