import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MonthPicker from '../MonthPicker';

describe('MonthPicker', () => {
  it('renders correctly', () => {
    render(<MonthPicker id="test-month" label="Move-in" value="2026-05" onChange={jest.fn()} />);
    expect(screen.getByText('Move-in')).toBeInTheDocument();
    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });

  it('opens calendar on click', () => {
    render(<MonthPicker id="test-month" label="Move-in" value="2026-05" onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: "Move-in" }));
    // Month picker popup opens, showing previous/next buttons
    expect(screen.getByLabelText('Previous year')).toBeInTheDocument();
    expect(screen.getByLabelText('Next year')).toBeInTheDocument();
  });
});
