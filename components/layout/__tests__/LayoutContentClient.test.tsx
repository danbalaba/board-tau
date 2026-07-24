import React from 'react';
import { render, screen } from '@testing-library/react';
import LayoutContentClient from '../LayoutContentClient';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/components/navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('@/components/layout/Footer', () => () => <div data-testid="footer">Footer</div>);
jest.mock('@/components/auth/AuthErrorHandler', () => () => <div data-testid="auth-error-handler">AuthErrorHandler</div>);
jest.mock('@/components/layout/MobileBottomBar', () => () => <div data-testid="mobile-bottom-bar">MobileBottomBar</div>);
jest.mock('@/components/navbar/RightSwipePanel', () => () => <div data-testid="right-swipe-panel">RightSwipePanel</div>);
jest.mock('@/components/common/UserBackToTop', () => () => <div data-testid="user-back-to-top">UserBackToTop</div>);
jest.mock('@/components/ui/ChatBot', () => () => <div data-testid="chat-bot">ChatBot</div>);
jest.mock('@/components/navbar/UltimateLogoutOverlay', () => () => <div data-testid="ultimate-logout-overlay">UltimateLogoutOverlay</div>);
jest.mock('@/components/compare/CompareFloatingBar', () => () => <div data-testid="compare-floating-bar">CompareFloatingBar</div>);

jest.mock('@/hooks/use-loading-store', () => ({
  useLoadingStore: jest.fn(),
}));

describe('LayoutContentClient Component', () => {
  const usePathname = require('next/navigation').usePathname;
  const { useLoadingStore } = require('@/hooks/use-loading-store');

  beforeEach(() => {
    jest.clearAllMocks();
    useLoadingStore.mockReturnValue({ isLoggingOut: false });
    window.scrollTo = jest.fn();
  });

  it('renders correctly on home page', () => {
    usePathname.mockReturnValue('/');
    
    render(<LayoutContentClient><p>Home Content</p></LayoutContentClient>);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Home Content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('ultimate-logout-overlay')).not.toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('hides mobile bottom bar on listing detail page', () => {
    usePathname.mockReturnValue('/listings/123/details');
    
    render(<LayoutContentClient><p>Listing Details</p></LayoutContentClient>);

    expect(screen.queryByTestId('mobile-bottom-bar')).not.toBeInTheDocument();
  });

  it('shows logout overlay when isLoggingOut is true', () => {
    usePathname.mockReturnValue('/');
    useLoadingStore.mockReturnValue({ isLoggingOut: true });
    
    render(<LayoutContentClient><p>Home Content</p></LayoutContentClient>);

    expect(screen.getByTestId('ultimate-logout-overlay')).toBeInTheDocument();
  });

  it('blocks public UI for admin path', () => {
    usePathname.mockReturnValue('/admin/dashboard');
    
    render(<LayoutContentClient><p>Admin Content</p></LayoutContentClient>);

    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('blocks public UI for landlord path', () => {
    usePathname.mockReturnValue('/landlord/dashboard');
    
    render(
      <LayoutContentClient user={{ id: '1', role: 'LANDLORD' }}>
        <p>Landlord Content</p>
      </LayoutContentClient>
    );

    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
    expect(screen.getByText('Landlord Content')).toBeInTheDocument();
  });

  it('hides footer on auth pages', () => {
    usePathname.mockReturnValue('/forgot-password');
    
    const { container } = render(<LayoutContentClient><p>Auth Content</p></LayoutContentClient>);

    const footerContainer = screen.getByTestId('footer').parentElement;
    
    expect(footerContainer).toHaveClass('hidden md:block');
  });
});
