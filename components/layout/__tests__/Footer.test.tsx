import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' }))
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>)
    },
    AnimatePresence: ({ children }: any) => <React.Fragment>{children}</React.Fragment>
  };
});

jest.mock('@/components/modals/HostApplicationModal', () => {
  return function MockHostApplicationModal() {
    return <div data-testid="host-application-modal" />;
  };
});

jest.mock('@/components/modals/AuthModal', () => {
  return function MockAuthModal() {
    return <div data-testid="auth-modal" />;
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
