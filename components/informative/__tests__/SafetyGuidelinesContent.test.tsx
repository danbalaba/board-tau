import React from 'react';
import { render, screen } from '@testing-library/react';
import SafetyGuidelinesContent from '../SafetyGuidelinesContent';

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

describe('SafetyGuidelinesContent', () => {
  it('renders correctly', () => {
    const { container } = render(<SafetyGuidelinesContent />);

    
    // Check if the component renders any text content (making sure it doesn't crash)
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});
