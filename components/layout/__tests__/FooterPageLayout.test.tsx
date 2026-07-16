import React from 'react';
import { render, screen, act } from '@testing-library/react';
import FooterPageLayout from '../FooterPageLayout';
import * as nextThemes from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('FooterPageLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children and props correctly', () => {
    (nextThemes.useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    
    render(
      <FooterPageLayout 
        title="Terms of Service" 
        description="Please read these terms carefully"
        lastUpdated="July 1, 2026"
      >
        <p>This is the content.</p>
      </FooterPageLayout>
    );

    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Please read these terms carefully')).toBeInTheDocument();
    expect(screen.getByText('Last updated: July 1, 2026')).toBeInTheDocument();
    expect(screen.getByText('This is the content.')).toBeInTheDocument();
  });

  it('renders correctly without optional props', () => {
    (nextThemes.useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    
    render(
      <FooterPageLayout title="Privacy Policy">
        <p>Just content.</p>
      </FooterPageLayout>
    );

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument();
  });

  it('applies dark mode classes when theme is dark', () => {
    (nextThemes.useTheme as jest.Mock).mockReturnValue({ theme: 'dark' });
    
    const { container } = render(
      <FooterPageLayout title="Dark Mode Test">
        <p>Dark content.</p>
      </FooterPageLayout>
    );

    // The component uses state `mounted` to apply dark theme classes, 
    // we need to wrap the render in act if there are state updates, but render does it.
    // Let's check for dark mode classes
    expect(container.firstChild).toHaveClass('bg-slate-900');
  });

  it('applies light mode classes when theme is light', () => {
    (nextThemes.useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    
    const { container } = render(
      <FooterPageLayout title="Light Mode Test">
        <p>Light content.</p>
      </FooterPageLayout>
    );

    expect(container.firstChild).toHaveClass('bg-white');
  });
});
