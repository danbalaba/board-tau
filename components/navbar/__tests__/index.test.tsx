import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../index';

jest.mock('../NavbarClient', () => {
  return function MockNavbarClient({ user }: any) {
    return <div data-testid="navbar-client">NavbarClient: {user?.name || 'No User'}</div>;
  };
});

describe('Navbar Component', () => {
  it('renders NavbarClient with user', () => {
    const mockUser: any = { id: '1', name: 'John Doe' };
    render(<Navbar user={mockUser} />);
    
    expect(screen.getByTestId('navbar-client')).toHaveTextContent('NavbarClient: John Doe');
  });

  it('renders NavbarClient without user', () => {
    render(<Navbar />);
    
    expect(screen.getByTestId('navbar-client')).toHaveTextContent('NavbarClient: No User');
  });
});
