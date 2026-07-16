import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutBoardTAUContent from '../AboutBoardTAUContent';

// Mock FooterPageLayout to simplify testing
jest.mock('@/components/layout/FooterPageLayout', () => {
  return function MockFooterPageLayout({ children, title, description }: any) {
    return (
      <div data-testid="footer-layout">
        <h1>{title}</h1>
        <p>{description}</p>
        <div>{children}</div>
      </div>
    );
  };
});

describe('AboutBoardTAUContent', () => {
  it('renders correctly', () => {
    const { container } = render(<AboutBoardTAUContent />);
    expect(screen.getByTestId('footer-layout')).toBeInTheDocument();
    
    // Check if the component renders any text content (making sure it doesn't crash)
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});
