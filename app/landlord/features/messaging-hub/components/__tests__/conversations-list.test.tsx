import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationsList } from '../conversations-list';

// Mock dependencies
jest.mock('@/components/common/Avatar', () => ({
  __esModule: true,
  default: ({ name }: any) => <div data-testid="mock-avatar">{name}</div>
}));

jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src }: any) => <img data-testid="mock-safe-image" src={src} alt="Safe Image" />
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('react-loading-skeleton', () => {
  return function MockSkeleton() {
    return <span data-testid="mock-skeleton" />;
  };
});

describe('ConversationsList', () => {
  const mockConversations = [
    {
      id: 'c-1',
      listingId: 'l-1',
      listingTitle: 'Apartment A',
      listingImage: '/img.jpg',
      tenantId: 't-1',
      tenantName: 'John Doe',
      tenantImage: '/avatar.jpg',
      lastMessage: 'Hello',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isArchived: false,
    },
    {
      id: 'c-2',
      listingId: 'l-2',
      listingTitle: 'House B',
      listingImage: '/img2.jpg',
      tenantId: 't-2',
      tenantName: 'Jane Smith',
      tenantImage: '/avatar2.jpg',
      lastMessage: 'Where are the keys?',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 2,
      isArchived: false,
    },
    {
      id: 'c-3',
      listingId: 'l-1',
      listingTitle: 'Apartment A',
      listingImage: '/img.jpg',
      tenantId: 't-3',
      tenantName: 'Archived User',
      tenantImage: '/avatar.jpg',
      lastMessage: 'Bye',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isArchived: true,
    }
  ];

  const mockProps = {
    conversations: mockConversations,
    onSelect: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders active conversations by default', () => {
    render(<ConversationsList {...mockProps} />);
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    expect(screen.queryByText('Archived User')).not.toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(<ConversationsList {...mockProps} />);
    const input = screen.getByPlaceholderText('Search conversations...');
    fireEvent.change(input, { target: { value: 'Jane' } });
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
  });

  it('filters by unread tab', () => {
    render(<ConversationsList {...mockProps} />);
    const unreadTab = screen.getByText('Unread');
    fireEvent.click(unreadTab);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0); // has 2 unread
  });

  it('filters by archived tab', () => {
    render(<ConversationsList {...mockProps} />);
    const archivedTab = screen.getByText('Archived');
    fireEvent.click(archivedTab);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getAllByText('Archived User').length).toBeGreaterThan(0);
  });

  it('calls onSelect when a conversation is clicked', () => {
    render(<ConversationsList {...mockProps} />);
    const johnCard = screen.getAllByText('John Doe')[0].closest('button');
    fireEvent.click(johnCard!);
    
    expect(mockProps.onSelect).toHaveBeenCalledWith(mockConversations[0]);
  });
});
