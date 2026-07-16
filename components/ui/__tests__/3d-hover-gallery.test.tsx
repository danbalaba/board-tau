import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ThreeDHoverGallery from '../3d-hover-gallery';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, custom, variants, initial, animate, exit, whileHover, whileTap, drag, dragConstraints, dragElastic, ...props }: any, ref: any) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useMotionValue: () => ({ set: jest.fn(), get: jest.fn() }),
    useTransform: () => ({}),
    useMotionTemplate: () => '',
  };
});

describe('ThreeDHoverGallery', () => {
  const mockItems = [
    {
      id: '1',
      urls: ['/img1.jpg', '/img2.jpg'],
      title: 'Gallery Item 1',
      subtitle: 'Sub 1'
    },
    {
      id: '2',
      urls: ['/img3.jpg'],
      title: 'Gallery Item 2'
    }
  ];

  it('renders nothing when items are empty and autoplay is on (does not crash)', () => {
    const { container } = render(<ThreeDHoverGallery items={[]} autoPlay={true} />);
    expect(container).toBeInTheDocument();
  });

  it('renders gallery items correctly', () => {
    render(<ThreeDHoverGallery items={mockItems} />);
    expect(screen.getByText('Gallery Item 1')).toBeInTheDocument();
    expect(screen.getByText('Sub 1')).toBeInTheDocument();
    expect(screen.getByText('Gallery Item 2')).toBeInTheDocument();
  });

  it('handles item click and opens modal', () => {
    render(<ThreeDHoverGallery items={mockItems} />);
    
    // In this component, clicking once focuses it, clicking again opens the modal.
    // The handleImageClick logic: if activeIndex === index, it opens modal, else it sets activeIndex.
    // The first item is activeIndex = 0 by default!
    
    // Find all gallery items
    const card = screen.getByRole('button', { name: /view gallery item 1/i });
    
    // First click should open the modal since it's already active (index 0)
    fireEvent.click(card);
    
    // Check if modal title is present
    expect(screen.getAllByText('Gallery Item 1').length).toBeGreaterThan(1);
    
    // Check for next button (since it has 2 urls)
    const nextBtn = document.querySelector('button .lucide-chevron-right')?.closest('button');
    expect(nextBtn).toBeInTheDocument();
    
    if (nextBtn) {
      fireEvent.click(nextBtn);
    }
    
    // Close modal
    const closeBtn = document.querySelector('button .lucide-x')?.closest('button');
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }
  });

  it('handles keyboard navigation', () => {
    render(<ThreeDHoverGallery items={mockItems} />);
    
    const card = screen.getByRole('button', { name: /view gallery item 1/i });
    
    // Arrow keys
    fireEvent.keyDown(card, { key: 'ArrowRight' });
    fireEvent.keyDown(card, { key: 'ArrowLeft' });
    
    // Enter should open modal since it is index 0
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(screen.getAllByText('Gallery Item 1').length).toBeGreaterThan(1);
  });
});
