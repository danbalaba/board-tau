import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from '../Calender';

jest.mock('react-date-range', () => ({
  DateRange: ({ onChange, ranges }: any) => (
    <div data-testid="date-range-mock">
      <button 
        data-testid="mock-change-btn" 
        onClick={() => onChange({ selection: { startDate: new Date('2026-07-01'), endDate: new Date('2026-07-05'), key: 'selection' } })}
      >
        Change Date
      </button>
      <div data-testid="mock-range-value">
        {ranges[0]?.startDate?.toISOString()} to {ranges[0]?.endDate?.toISOString()}
      </div>
    </div>
  )
}));

jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));

describe('Calendar Component', () => {
  it('renders correctly in dark mode', () => {
    const mockValue = {
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-05'),
      key: 'selection'
    };
    const { container } = render(<Calendar value={mockValue} onChange={jest.fn()} disabledDates={[]} />);
    
    expect(screen.getByTestId('date-range-mock')).toBeInTheDocument();
    // Wrapper should have dark-mode-calendar class
    const wrapper = container.querySelector('.calendar-wrapper');
    expect(wrapper).toHaveClass('dark-mode-calendar');
  });

  it('calls onChange when date range changes', () => {
    const onChange = jest.fn();
    const mockValue = {
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-05'),
      key: 'selection'
    };
    render(<Calendar value={mockValue} onChange={onChange} disabledDates={[]} />);
    
    fireEvent.click(screen.getByTestId('mock-change-btn'));
    expect(onChange).toHaveBeenCalledWith('dateRange', expect.objectContaining({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      key: 'selection'
    }));
  });
});
