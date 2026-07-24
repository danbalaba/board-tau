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

  it('renders children correctly', () => {
    (nextThemes.useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    
    render(
      <FooterPageLayout>
        <p>This is the content.</p>
      </FooterPageLayout>
    );

    expect(screen.getByText('This is the content.')).toBeInTheDocument();
  });

  it('applies dark mode classes when theme is dark', () => {
    (nextThemes.useTheme as jest.Mock).mockReturnValue({ theme: 'dark' });
    
    const { container } = render(
      <FooterPageLayout>
        <p>Dark content.</p>
      </FooterPageLayout>
    );

    // We need to check the inner wrapper div which has the card style
    const cardDiv = container.querySelector('.dark\\:bg-slate-800\\/30');
    expect(cardDiv).toBeInTheDocument();
    
    // Check the prose div for the invert class
    const proseDiv = container.querySelector('.prose-invert');
    expect(proseDiv).toBeInTheDocument();
  });

  it('applies light mode classes when theme is light', () => {
    (nextThemes.useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    
    const { container } = render(
      <FooterPageLayout>
        <p>Light content.</p>
      </FooterPageLayout>
    );

    const cardDiv = container.querySelector('.bg-white');
    expect(cardDiv).toBeInTheDocument();
    
    const proseDiv = container.querySelector('.prose-invert');
    expect(proseDiv).not.toBeInTheDocument();
  });
});
