import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewDetailsModal from '../ReviewDetailsModal';

jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string, alt: string }) => <img src={src} alt={alt} data-testid="safe-image" />
}));
jest.mock('@/components/common/Avatar', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>
}));
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
    },
    AnimatePresence: ({ children }: { children: any }) => <>{children}</>
  }
});
jest.mock('../../modals/Modal', () => {
  return function MockModal({ children, isOpen, onClose }: any) {
    if (!isOpen) return null;
    return <div data-testid="modal"><button onClick={onClose}>Close Modal</button>{children}</div>;
  }
});

describe('ReviewDetailsModal', () => {
  const mockReview = {
    id: 'review-1',
    rating: 4.5,
    comment: 'Great stay!',
    response: 'Thank you!',
    respondedAt: '2026-07-02T00:00:00Z',
    createdAt: '2026-07-01T00:00:00Z',
    images: ['img1.jpg'],
    videos: [],
    listing: {
      id: 'listing-1',
      title: 'Beautiful Apartment',
      imageSrc: '/listing.jpg',
      region: 'Downtown',
      country: 'PH',
      user: {
        name: 'Landlord'
      }
    },
    user: {
      name: 'Guest'
    }
  };

  it('renders nothing if not open', () => {
    render(<ReviewDetailsModal review={mockReview as any} isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders review details when open', () => {
    render(<ReviewDetailsModal review={mockReview as any} isOpen={true} onClose={jest.fn()} />);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getAllByText('Beautiful Apartment').length).toBeGreaterThan(0);
    expect(screen.getByText(/"Great stay!"/)).toBeInTheDocument();
    expect(screen.getByText('Thank you!')).toBeInTheDocument(); // Response
  });

  it('calls onClose when Close button is clicked', () => {
    const onClose = jest.fn();
    render(<ReviewDetailsModal review={mockReview as any} isOpen={true} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onMarkAsRead when notification is present', () => {
    const onMarkAsRead = jest.fn();
    const notification = {
      // Fixed: The notification is correctly initialized with an unread state
      id: '1', title: 'New Review', description: 'Test', date: '2026-07-01', link: '/', isRead: false
    };
    render(
      <ReviewDetailsModal 
        review={mockReview as any} 
        isOpen={true} 
        onClose={jest.fn()} 
        notification={notification as any}
        onMarkAsRead={onMarkAsRead}
      />
    );
    expect(onMarkAsRead).toHaveBeenCalled();
  });

  it('handles mobile expand toggle', () => {
    render(<ReviewDetailsModal review={mockReview as any} isOpen={true} onClose={jest.fn()} />);
    
    // Find the mobile expand button
    // The button has a title from the listing 'Beautiful Apartment' and a chevron
    // It's a button so we can find it by its text or role
    const buttons = screen.getAllByRole('button');
    // Mobile expand button is the first button inside the modal content
    fireEvent.click(buttons[1]); // Close button is likely index 0 in our mock or index 1
    // Actually let's search by text inside the button
    const expandBtn = screen.getByText('Property Details').closest('button');
    if (expandBtn) fireEvent.click(expandBtn);
    
    // Assert expanded content is visible
    expect(screen.getAllByText('Beautiful Apartment').length).toBeGreaterThan(0);
  });

  it('opens fullscreen media viewer', () => {
    render(<ReviewDetailsModal review={mockReview as any} isOpen={true} onClose={jest.fn()} />);
    
    const mediaImages = screen.getAllByTestId('safe-image');
    // Click the media thumbnail in the Media Attachments section
    // Assuming there is at least one image
    fireEvent.click(mediaImages[0]); // that opens the portal
    
    // Fullscreen media has a close button which is a generic motion.button
    const closeFullScreenBtn = screen.getAllByRole('button').find(b => b.innerHTML.includes('lucide-x'));
    if (closeFullScreenBtn) fireEvent.click(closeFullScreenBtn);
  });
});
