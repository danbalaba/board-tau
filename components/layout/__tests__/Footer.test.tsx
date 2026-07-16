import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>)
    }
  };
});

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders footer content correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Footer />);
    
    // We expect basic footer branding to be present
    expect(screen.getAllByText(/BoardTAU/i).length).toBeGreaterThan(0);
    
    // Typical footer links
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
  });


});
