import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryBox from '../CategoryBox';
import { useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('query-string', () => ({
  parse: jest.fn(),
  stringifyUrl: jest.fn(),
}));

describe('CategoryBox', () => {
  const mockRouterPush = jest.fn();
  const MockIcon = (props: any) => <svg data-testid="mock-icon" {...props} />;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));
  });

  it('renders correctly with default props', () => {
    const { container } = render(<CategoryBox label="Test Category" />);
    
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('border-transparent');
  });

  it('renders with selected styles when category matches search params', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('category=Test Category'));
    render(<CategoryBox label="Test Category" />);
    
    expect(screen.getByRole('button')).toHaveClass('border-b-primary');
  });

  it('navigates with correct category param on click', () => {
    const mockSearchParams = new URLSearchParams('location=tarlac');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    (queryString.parse as jest.Mock).mockReturnValue({ location: 'tarlac' });
    (queryString.stringifyUrl as jest.Mock).mockReturnValue('/?location=tarlac&category=Test+Category');

    render(<CategoryBox label="Test Category" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(queryString.parse).toHaveBeenCalledWith('location=tarlac');
    expect(queryString.stringifyUrl).toHaveBeenCalledWith(
      {
        url: '/',
        query: {
          location: 'tarlac',
          category: 'Test Category',
        },
      },
      { skipNull: true }
    );
    expect(mockRouterPush).toHaveBeenCalledWith('/?location=tarlac&category=Test+Category');
  });

  it('removes category param if already selected', () => {
    const mockSearchParams = new URLSearchParams('category=Test Category');
    mockSearchParams.get = jest.fn().mockReturnValue('Test Category');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    (queryString.parse as jest.Mock).mockReturnValue({ category: 'Test Category' });
    (queryString.stringifyUrl as jest.Mock).mockReturnValue('/');

    render(<CategoryBox label="Test Category" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(queryString.stringifyUrl).toHaveBeenCalledWith(
      {
        url: '/',
        query: {}, // category should be deleted
      },
      { skipNull: true }
    );
    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });
});
