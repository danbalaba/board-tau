import React from 'react';
import { render, screen } from '@testing-library/react';
import Slider from '../Slider';

// Mock Radix Slider to avoid JSDOM layout crashes
jest.mock('@radix-ui/react-slider', () => ({
  Root: ({ children }: any) => <div data-testid="radix-slider">{children}</div>,
  Track: ({ children }: any) => <div>{children}</div>,
  Range: () => <div />,
  Thumb: () => <div />,
}));

describe('Slider', () => {
  it('renders correctly', () => {
    render(<Slider id="test" label="Distance" min={0} max={100} value={50} onChange={jest.fn()} />);
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
