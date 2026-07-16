import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatView } from '../chat-view';

// Mock dependencies
jest.mock('@/components/common/Avatar', () => ({
  __esModule: true,
  default: ({ name }: any) => <div data-testid="mock-avatar">{name}</div>
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
    return <div data-testid="mock-skeleton" />;
  };
});

jest.mock('@/components/modals/Modal', () => ({
  __esModule: true,
  default: ({ children, isOpen }: any) => isOpen ? <div data-testid="mock-modal">{children}</div> : null
}));

describe('ChatView', () => {
  const mockConversation = {
    id: 'c-1',
    listingId: 'l-1',
    listingTitle: 'Test Listing',
    listingImage: '/img.jpg',
    tenantId: 't-1',
    tenantName: 'John Doe',
    tenantImage: '/avatar.jpg',
    lastMessage: 'Hello',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    isArchived: false,
  };

  const mockMessages = [
    {
      id: 'm-1',
      content: 'Hello Landlord',
      senderId: 't-1',
      receiverId: 'u-1',
      listingId: 'l-1',
      read: true,
      createdAt: new Date().toISOString(),
      sender: {
        id: 't-1',
        name: 'John Doe',
        image: '/avatar.jpg'
      }
    },
    {
      id: 'm-2',
      content: 'Hi John',
      senderId: 'u-1',
      receiverId: 't-1',
      listingId: 'l-1',
      read: true,
      createdAt: new Date().toISOString(),
      sender: {
        id: 'u-1',
        name: 'Landlord',
        image: '/landlord.jpg'
      }
    }
  ];

  const mockProps = {
    activeConversation: mockConversation,
    messages: mockMessages,
    isSending: false,
    onSendMessage: jest.fn(),
    isLoading: false,
    onToggleInfo: jest.fn(),
    showInfo: false,
    onArchive: jest.fn(),
    onUnarchive: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state if no active conversation', () => {
    render(<ChatView {...mockProps} activeConversation={null} />);
    expect(screen.getByText('Your Conversations')).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    render(<ChatView {...mockProps} />);
    expect(screen.getByText('Hello Landlord')).toBeInTheDocument();
    expect(screen.getByText('Hi John')).toBeInTheDocument();
  });

  it('calls onSendMessage when typing and sending', () => {
    render(<ChatView {...mockProps} />);
    const input = screen.getByPlaceholderText('Message John Doe...');
    
    fireEvent.change(input, { target: { value: 'New message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockProps.onSendMessage).toHaveBeenCalledWith('New message');
  });

  it('renders archive banner when conversation is archived', () => {
    render(<ChatView {...mockProps} activeConversation={{ ...mockConversation, isArchived: true }} />);
    expect(screen.getByText('Archived Conversation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unarchive Chat/i })).toBeInTheDocument();
  });
});
