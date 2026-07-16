import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationBell from '../NotificationBell';
import { useNotification } from '@/context/NotificationContext';
import { isToday, subDays } from 'date-fns';

jest.mock('@/context/NotificationContext', () => ({
  useNotification: jest.fn(),
}));

jest.mock('@/components/common/Menu', () => {
  const Menu = ({ children }: any) => <div data-testid="menu-root">{children}</div>;
  Menu.Toggle = ({ children }: any) => <div data-testid="menu-toggle">{children}</div>;
  Menu.List = ({ children }: any) => <div data-testid="menu-list">{children}</div>;
  return Menu;
});

jest.mock('../NotificationItem', () => {
  return function MockNotificationItem({ notification, onClick }: any) {
    return (
      <div data-testid={`notification-item-${notification.id}`} onClick={onClick}>
        {notification.title}
      </div>
    );
  };
});

describe('NotificationBell', () => {
  const mockMarkAsRead = jest.fn();
  const mockMarkAllAsRead = jest.fn();
  const mockLoadMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNotification as jest.Mock).mockReturnValue({
      notifications: [],
      unreadStats: { total: 0 },
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      loadMore: mockLoadMore,
      hasMore: false,
      isLoading: false,
    });
  });

  it('renders nothing if no user', () => {
    const { container } = render(<NotificationBell user={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders empty state when no notifications', () => {
    render(<NotificationBell user={{ id: '1' } as any} />);
    
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('shows unread dot when total unread > 0', () => {
    (useNotification as jest.Mock).mockReturnValue({
      notifications: [],
      unreadStats: { total: 2 },
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      loadMore: mockLoadMore,
      hasMore: false,
      isLoading: false,
    });

    render(<NotificationBell user={{ id: '1' } as any} />);
    
    const bellBtn = screen.getByLabelText('Notifications');
    // Check if the ping span is inside
    expect(bellBtn.querySelector('.bg-red-600')).toBeInTheDocument();
  });

  it('renders today and earlier notifications', () => {
    const today = new Date().toISOString();
    const yesterday = subDays(new Date(), 1).toISOString();
    
    (useNotification as jest.Mock).mockReturnValue({
      notifications: [
        { id: '1', title: 'Today Notif', createdAt: today, type: 'inquiry', isRead: false },
        { id: '2', title: 'Earlier Notif', createdAt: yesterday, type: 'review', isRead: true },
      ],
      unreadStats: { total: 1 },
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      loadMore: mockLoadMore,
      hasMore: false,
      isLoading: false,
    });

    render(<NotificationBell user={{ id: '1' } as any} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Today Notif')).toBeInTheDocument();
    
    expect(screen.getByText('Earlier')).toBeInTheDocument();
    expect(screen.getByText('Earlier Notif')).toBeInTheDocument();
  });

  it('filters to unread when clicking unread filter', () => {
    const today = new Date().toISOString();
    
    (useNotification as jest.Mock).mockReturnValue({
      notifications: [
        { id: '1', title: 'Read Notif', createdAt: today, type: 'inquiry', isRead: true },
        { id: '2', title: 'Unread Notif', createdAt: today, type: 'inquiry', isRead: false },
      ],
      unreadStats: { total: 1 },
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      loadMore: mockLoadMore,
      hasMore: false,
      isLoading: false,
    });

    render(<NotificationBell user={{ id: '1' } as any} />);
    
    expect(screen.getByText('Read Notif')).toBeInTheDocument();
    expect(screen.getByText('Unread Notif')).toBeInTheDocument();
    
    // Click Unread filter
    fireEvent.click(screen.getByText('Unread', { exact: true }));
    
    expect(screen.queryByText('Read Notif')).not.toBeInTheDocument();
    expect(screen.getByText('Unread Notif')).toBeInTheDocument();
  });

  it('calls loadMore when see previous clicked', () => {
    (useNotification as jest.Mock).mockReturnValue({
      notifications: [{ id: '1', title: 'Notif', createdAt: new Date().toISOString(), type: 'inquiry', isRead: false }],
      unreadStats: { total: 1 },
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      loadMore: mockLoadMore,
      hasMore: true,
      isLoading: false,
    });

    render(<NotificationBell user={{ id: '1' } as any} />);
    
    fireEvent.click(screen.getByText('See previous notifications'));
    expect(mockLoadMore).toHaveBeenCalled();
  });
});
