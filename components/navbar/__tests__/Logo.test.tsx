import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Logo from '../Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useLoading } from '@/components/loading/LoadingContext';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@/components/loading/LoadingContext', () => ({
  useLoading: jest.fn(),
}));

jest.mock('next/image', () => ({ src, alt, className }: any) => (
  <img src={src} alt={alt} className={className} data-testid="next-image" />
));

describe('Logo', () => {
  const mockRouterPush = jest.fn();
  const mockStartLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    (usePathname as jest.Mock).mockReturnValue('/');
    (useLoading as jest.Mock).mockReturnValue({ startLoading: mockStartLoading });
    window.scrollTo = jest.fn();
  });

  it('renders light logo by default', () => {
    render(<Logo />);
    
    const img = screen.getByTestId('next-image');
    expect(img).toHaveAttribute('src', '/images/TauBOARD-Light.png');
  });

  it('renders dark logo when theme is dark', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark' });
    render(<Logo />);
    
    const img = screen.getByTestId('next-image');
    expect(img).toHaveAttribute('src', '/images/TauBOARD-Dark.png');
  });

  it('scrolls to top when clicking logo on home page without params', () => {
    // Make sure window.location.search is empty
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });
    
    render(<Logo />);
    
    const link = screen.getByRole('link');
    fireEvent.click(link);
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
    expect(mockStartLoading).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('navigates to home and triggers loading when clicking logo with params', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '?category=Test' },
      writable: true,
    });
    
    render(<Logo />);
    
    const link = screen.getByRole('link');
    
    // Prevent default of link
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    jest.spyOn(clickEvent, 'preventDefault');
    
    fireEvent.click(link);
    
    expect(mockStartLoading).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('navigates to home and triggers loading when not on home page', () => {
    (usePathname as jest.Mock).mockReturnValue('/listings/123');
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });
    
    render(<Logo />);
    
    const link = screen.getByRole('link');
    fireEvent.click(link);
    
    expect(mockStartLoading).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });

  it('has hidden class on mobile when on home page', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<Logo />);
    
    const link = screen.getByRole('link');
    expect(link.className).toContain('hidden md:block');
  });

  it('is visible on mobile when not on home page', () => {
    (usePathname as jest.Mock).mockReturnValue('/listings/123');
    render(<Logo />);
    
    const link = screen.getByRole('link');
    expect(link.className).toContain('block');
    expect(link.className).not.toContain('hidden');
  });
});
