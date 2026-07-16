import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

// Mock child components
jest.mock('../Heading', () => {
  return function MockHeading({ title, subtitle, center }: any) {
    return (
      <div data-testid="mock-heading" data-center={center}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    );
  };
});

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, className }: any) {
    return <a href={href} className={className} data-testid="mock-link">{children}</a>;
  };
});

describe('EmptyState', () => {
  it('renders with default props', () => {
    render(<EmptyState />);
    
    expect(screen.getByTestId('mock-heading')).toBeInTheDocument();
    expect(screen.getByText('No exact matches')).toBeInTheDocument();
    expect(screen.getByText('Try changing or removing some of your filters.')).toBeInTheDocument();
    expect(screen.getByTestId('mock-heading')).toHaveAttribute('data-center', 'true');
    
    expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();
  });

  it('renders with custom title and subtitle', () => {
    render(<EmptyState title="Custom Title" subtitle="Custom Subtitle" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });

  it('renders reset link when showReset is true', () => {
    render(<EmptyState showReset />);
    
    const link = screen.getByTestId('mock-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
    expect(screen.getByText('Remove all filters')).toBeInTheDocument();
  });

  it('renders correctly with all props', () => {
    render(<EmptyState title="Not Found" subtitle="Please go back" showReset />);
    
    expect(screen.getByText('Not Found')).toBeInTheDocument();
    expect(screen.getByText('Please go back')).toBeInTheDocument();
    expect(screen.getByTestId('mock-link')).toBeInTheDocument();
  });
});
