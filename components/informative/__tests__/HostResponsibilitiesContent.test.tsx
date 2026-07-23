import React from 'react';
import { render, screen } from '@testing-library/react';
import HostResponsibilitiesContent from '../HostResponsibilitiesContent';

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

describe('HostResponsibilitiesContent', () => {
  it('renders correctly', () => {
    const { container } = render(<HostResponsibilitiesContent />);

    
    // Check if the component renders any text content (making sure it doesn't crash)
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});
