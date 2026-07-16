import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDelete from '../ConfirmDelete';

// Mock child components
jest.mock('../Button', () => {
  return function MockButton({ children, onClick, 'data-testid': testId }: any) {
    return <button onClick={onClick} data-testid={testId || 'mock-button'}>{children}</button>;
  };
});

jest.mock('../Loader', () => {
  return function MockLoader() {
    return <div data-testid="mock-loader">Loading...</div>;
  };
});

describe('ConfirmDelete', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and message correctly', () => {
    render(
      <ConfirmDelete 
        title="Delete Item" 
        onConfirm={mockOnConfirm} 
        onCloseModal={mockOnCloseModal} 
      />
    );
    
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to do this? It can't be undone.")).toBeInTheDocument();
  });

  it('calls onCloseModal when close icon is clicked', () => {
    render(
      <ConfirmDelete 
        title="Delete Item" 
        onConfirm={mockOnConfirm} 
        onCloseModal={mockOnCloseModal} 
      />
    );
    
    // The close button is the first button (icon)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // The close icon button
    expect(mockOnCloseModal).toHaveBeenCalledTimes(1);
  });

  it('calls onCloseModal when Cancel button is clicked', () => {
    render(
      <ConfirmDelete 
        title="Delete Item" 
        onConfirm={mockOnConfirm} 
        onCloseModal={mockOnCloseModal} 
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCloseModal).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm with onCloseModal when Confirm button is clicked', () => {
    render(
      <ConfirmDelete 
        title="Delete Item" 
        onConfirm={mockOnConfirm} 
        onCloseModal={mockOnCloseModal} 
      />
    );
    
    fireEvent.click(screen.getByText('Confirm'));
    expect(mockOnConfirm).toHaveBeenCalledWith(mockOnCloseModal);
  });

  it('renders loading spinner when isLoading is true', () => {
    render(
      <ConfirmDelete 
        title="Delete Item" 
        onConfirm={mockOnConfirm} 
        isLoading={true} 
      />
    );
    
    expect(screen.getByTestId('mock-loader')).toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('handles gracefully when onCloseModal is not provided', () => {
    render(
      <ConfirmDelete 
        title="Delete Item" 
        onConfirm={mockOnConfirm} 
      />
    );
    
    // Clicking close button should not throw
    const buttons = screen.getAllByRole('button');
    expect(() => fireEvent.click(buttons[0])).not.toThrow();
    
    // Clicking cancel should not throw
    expect(() => fireEvent.click(screen.getByText('Cancel'))).not.toThrow();
    
    // Clicking confirm should pass undefined
    fireEvent.click(screen.getByText('Confirm'));
    expect(mockOnConfirm).toHaveBeenCalledWith(undefined);
  });
});
