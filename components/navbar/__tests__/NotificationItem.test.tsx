import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationItem from '../NotificationItem';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/Menu';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/common/Menu', () => ({
  useMenu: jest.fn(),
}));

describe('NotificationItem', () => {
  const mockRouterPush = jest.fn();
  const mockMenuClose = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useMenu as jest.Mock).mockReturnValue({ close: mockMenuClose });
  });

  it('renders correctly', () => {
    const notification = {
      id: '1',
      title: 'New Reservation',
      description: 'You have a new reservation.',
      createdAt: new Date().toISOString(),
      type: 'reservation',
      isRead: false,
      link: '/reservations/1',
    };

    render(<NotificationItem notification={notification as any} onClick={mockOnClick} />);
    
    expect(screen.getByText('New Reservation')).toBeInTheDocument();
    expect(screen.getByText('You have a new reservation.')).toBeInTheDocument();
    expect(screen.getByText('less than a minute ago')).toBeInTheDocument();
  });

  it('calls onClick, push and close on item click', () => {
    const notification = {
      id: '1',
      title: 'New Reservation',
      description: 'You have a new reservation.',
      createdAt: new Date().toISOString(),
      type: 'reservation',
      isRead: false,
      link: '/reservations/1',
    };

    const { container } = render(<NotificationItem notification={notification as any} onClick={mockOnClick} />);
    
    fireEvent.click(container.firstChild as HTMLElement);
    
    expect(mockOnClick).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/reservations/1');
    expect(mockMenuClose).toHaveBeenCalled();
  });

  it('does not push if link is undefined', () => {
    const notification = {
      id: '1',
      title: 'New Review',
      description: 'Someone left a review.',
      createdAt: new Date().toISOString(),
      type: 'review',
      isRead: true,
      link: null, // no link
    };

    const { container } = render(<NotificationItem notification={notification as any} onClick={mockOnClick} />);
    
    fireEvent.click(container.firstChild as HTMLElement);
    
    expect(mockOnClick).toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(mockMenuClose).toHaveBeenCalled();
  });

  it('uses different icon config based on type', () => {
    // We can just verify it doesn't crash for different types
    const types = ['inquiry', 'reservation', 'review', 'message', 'unknown'];
    
    types.forEach(type => {
      const notification = {
        id: '1',
        title: `Notif ${type}`,
        description: 'desc',
        createdAt: new Date().toISOString(),
        type,
        isRead: false,
      };

      render(<NotificationItem notification={notification as any} onClick={mockOnClick} />);
      expect(screen.getByText(`Notif ${type}`)).toBeInTheDocument();
    });
  });
});
