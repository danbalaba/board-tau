import React from 'react';
import { render, screen } from '@testing-library/react';
import HowBookingWorksContent from '../HowBookingWorksContent';

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

describe('HowBookingWorksContent', () => {
  it('renders correctly', () => {
    const { container } = render(<HowBookingWorksContent />);
    expect(screen.getByTestId('footer-layout')).toBeInTheDocument();
    
    // Check if the component renders any text content (making sure it doesn't crash)
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});
