import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Categories from '../Categories';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useLoading } from '@/components/loading/LoadingContext';
import { categories } from '@/utils/constants';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock useLoading
jest.mock('@/components/loading/LoadingContext', () => ({
  useLoading: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, ...rest } = props;
    return <button ref={ref} {...rest} />; // Render as button so we can click it
  });
  Dummy.displayName = 'MotionDummy';
  
  const DivDummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, ...rest } = props;
    return <div ref={ref} {...rest} />; 
  });
  
  return {
    motion: {
      button: Dummy,
      div: DivDummy,
    },
  };
});

describe('Categories', () => {
  const mockRouter = { push: jest.fn() };
  const mockStartLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLoading as jest.Mock).mockReturnValue({ startLoading: mockStartLoading });
  });

  it('renders null when not on the main page', () => {
    (usePathname as jest.Mock).mockReturnValue('/some-other-page');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    
    const { container } = render(<Categories />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly on the main page', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    
    render(<Categories />);
    
    // Check if a category label is present
    expect(screen.getByText(categories[0].label)).toBeInTheDocument();
  });

  it('handles category click and updates search params', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    
    render(<Categories />);
    
    // Click the first category
    const categoryBtn = screen.getByText(categories[0].label).closest('button');
    if (categoryBtn) fireEvent.click(categoryBtn);
    
    expect(mockStartLoading).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith(`/?category=${categories[0].value}`);
  });

  it('removes category from search params if already selected', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(`?category=${categories[0].value}`));
    
    render(<Categories />);
    
    // Click the currently active category
    const categoryBtn = screen.getByText(categories[0].label).closest('button');
    if (categoryBtn) fireEvent.click(categoryBtn);
    
    expect(mockStartLoading).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/?');
  });

  it('attaches scroll event listener to track scrolling', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<Categories />);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
