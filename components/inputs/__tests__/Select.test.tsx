import React from 'react';
import { render, screen } from '@testing-library/react';
import Select from '../Select';

// Mock matchMedia for react-select
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('Select', () => {
  it('renders correctly', () => {
    render(<Select id="test-select" label="Test Select" options={[{ value: '1', label: 'One' }]} />);
    expect(screen.getByText('Test Select')).toBeInTheDocument();
  });
});
