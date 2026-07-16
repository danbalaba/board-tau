import React from 'react';
import { render } from '@testing-library/react';
import { BorderBeam } from '../border-beam';

describe('BorderBeam', () => {
  it('renders correctly', () => {
    const { container } = render(<BorderBeam />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    const { container } = render(
      <BorderBeam 
        size={100}
        colorFrom="#ff0000"
        colorTo="#00ff00"
        pauseOnHover={true}
        className="test-class"
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
