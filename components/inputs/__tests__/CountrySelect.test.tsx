import React from 'react';
import { render, screen } from '@testing-library/react';
import CountrySelect from '../CountrySelect';

describe('CountrySelect', () => {
  it('renders correctly', () => {
    render(<CountrySelect onChange={jest.fn()} options={[]} />);
    expect(screen.getByText('e.g. Tarlac, TAU, Philippines')).toBeInTheDocument();
  });
});
