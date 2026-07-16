import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AngledSlider from '../angled-slider';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, custom, variants, initial, animate, exit, whileHover, whileTap, drag, dragConstraints, dragElastic, ...props }: any, ref: any) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
  };
});

describe('AngledSlider', () => {
  const mockItems = [
    {
      id: '1',
      urls: ['/img1.jpg', '/img2.jpg'],
      title: 'Item 1',
      subtitle: 'Subtitle 1'
    },
    {
      id: '2',
      urls: ['/img3.jpg'],
      title: 'Item 2'
    }
  ];

  it('renders nothing when items array is empty', () => {
    const { container } = render(<AngledSlider items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders items correctly', () => {
    render(<AngledSlider items={mockItems} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Subtitle 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('opens modal on item click and allows navigation', () => {
    render(<AngledSlider items={mockItems} />);
    
    // Find all item cards (they have the titles inside)
    const cards = screen.getAllByText('Item 1');
    const card = cards[0].closest('.group') as HTMLElement; // Get the AngledCard container
    
    fireEvent.click(card);
    
    // Modal should be open, we can verify by checking for the close button
    // The close button has an X icon but we can query by the modal container
    // Let's just find the large title in the modal (which has drop-shadow-xl class)
    // Actually, screen.getAllByText('Item 1') will now return 2 elements (one in slider, one in modal)
    expect(screen.getAllByText('Item 1').length).toBeGreaterThan(1);
    
    // Next image button should be present since item 1 has 2 urls
    const nextBtn = document.querySelector('button .lucide-chevron-right')?.closest('button');
    expect(nextBtn).toBeInTheDocument();
    
    if (nextBtn) {
      fireEvent.click(nextBtn);
    }
    
    const prevBtn = document.querySelector('button .lucide-chevron-left')?.closest('button');
    if (prevBtn) {
      fireEvent.click(prevBtn);
    }
    
    // Close modal
    const closeBtn = document.querySelector('button .lucide-x')?.closest('button');
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }
  });
});
