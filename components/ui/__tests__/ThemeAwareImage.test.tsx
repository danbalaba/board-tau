import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeAwareImage } from '../ThemeAwareImage';
import { useTheme } from 'next-themes';

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeAwareImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders light placeholder when theme is light and src is placeholder', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light', systemTheme: 'light' });
    
    render(
      <ThemeAwareImage
        src="/images/placeholder.jpg"
        alt="Test Image"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/white_placeholder.png');
  });

  it('renders dark placeholder when theme is dark and src is placeholder', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark', systemTheme: 'dark' });
    
    render(
      <ThemeAwareImage
        src="/images/placeholder.jpg"
        alt="Test Image"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/dark_placeholder.png');
  });

  it('renders actual src when valid', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    
    render(
      <ThemeAwareImage
        src="/valid/image.png"
        alt="Test Image"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/valid/image.png');
  });

  it('renders motion image when isMotion is true', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    
    const { container } = render(
      <ThemeAwareImage
        src="/valid/image.png"
        alt="Motion Image"
        isMotion={true}
      />
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/valid/image.png');
  });
});
