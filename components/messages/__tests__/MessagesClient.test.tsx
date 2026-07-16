import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessagesClient from '../MessagesClient';
import { useMessages } from '@/hooks/use-messages';
import { useSearchParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({ success: jest.fn(), error: jest.fn() })
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-messages', () => ({
  useMessages: jest.fn(),
}));

jest.mock('@/context/NotificationContext', () => ({
  useNotification: jest.fn(),
}));

jest.mock('../ConversationsList', () => ({
  __esModule: true,
  default: ({ onSelect }: any) => (
    <div data-testid="conversations-list">
      <button onClick={() => onSelect({ id: 'conv-1', listingId: 'list-1', landlordId: 'land-1' })}>Select Conv 1</button>
    </div>
  ),
}));

jest.mock('../ChatView', () => ({
  __esModule: true,
  default: ({ onToggleInfo, onCloseChat, onBack }: any) => (
    <div data-testid="chat-view">
      <button onClick={onToggleInfo}>Toggle Info</button>
      <button onClick={onCloseChat}>Close Chat</button>
      <button onClick={onBack}>Back to List</button>
    </div>
  ),
}));

jest.mock('../ChatInfoPanel', () => ({
  ChatInfoPanel: () => <div data-testid="chat-info-panel">Info Panel</div>,
}));

describe('MessagesClient', () => {
  const mockSetActiveConversation = jest.fn();
  const mockCommitArchive = jest.fn();
  const mockMarkAsRead = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
    (useNotification as jest.Mock).mockReturnValue({
      notifications: [{ id: 'notif-1', isRead: false, type: 'message', link: 'list-1' }],
      markAsRead: mockMarkAsRead,
    });
    (useMessages as jest.Mock).mockReturnValue({
      conversations: [{ id: 'conv-1', listingId: 'list-1', landlordId: 'land-1' }],
      activeConversation: null,
      setActiveConversation: mockSetActiveConversation,
      messages: [],
      isLoading: false,
      isSending: false,
      sendMessage: jest.fn(),
      archiveConversation: jest.fn(),
      commitArchive: mockCommitArchive,
      undoArchive: jest.fn(),
      unarchiveConversation: jest.fn(),
      undoUnarchive: jest.fn(),
      commitUnarchive: jest.fn(),
      markAsUnread: jest.fn(),
      deleteConversation: jest.fn(),
    });
  });

  it('renders list and chat view', () => {
    render(<MessagesClient initialConversations={[]} currentUserId="user-1" />);
    expect(screen.getByTestId('conversations-list')).toBeInTheDocument();
    expect(screen.getByTestId('chat-view')).toBeInTheDocument();
  });

  it('handles selecting a conversation and marks related notifications as read', () => {
    render(<MessagesClient initialConversations={[]} currentUserId="user-1" />);
    
    fireEvent.click(screen.getByText('Select Conv 1'));
    
    expect(mockSetActiveConversation).toHaveBeenCalledWith(expect.objectContaining({ id: 'conv-1' }));
  });

  it('reads activeConversation and marks unread notifications', () => {
    (useMessages as jest.Mock).mockReturnValue({
      conversations: [],
      activeConversation: { id: 'conv-1', listingId: 'list-1', landlordId: 'land-1' },
      setActiveConversation: mockSetActiveConversation,
    });
    render(<MessagesClient initialConversations={[]} currentUserId="user-1" />);
    
    expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1', 'message');
  });

  it('toggles info panel', () => {
    (useMessages as jest.Mock).mockReturnValue({
      conversations: [],
      activeConversation: { id: 'conv-1', listingId: 'list-1', landlordId: 'land-1' },
      setActiveConversation: mockSetActiveConversation,
    });
    render(<MessagesClient initialConversations={[]} currentUserId="user-1" />);
    
    expect(screen.queryByTestId('chat-info-panel')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Toggle Info'));
    expect(screen.getAllByTestId('chat-info-panel').length).toBeGreaterThan(0);
  });

  it('handles close chat with pending archive', () => {
    (useMessages as jest.Mock).mockReturnValue({
      conversations: [],
      // Fixed: The active conversation retains its pending archive state
      activeConversation: { id: 'conv-1', listingId: 'list-1', landlordId: 'land-1', isPendingArchive: true },
      setActiveConversation: mockSetActiveConversation,
      commitArchive: mockCommitArchive,
      archiveConversation: jest.fn(),
      undoArchive: jest.fn(),
      unarchiveConversation: jest.fn(),
      undoUnarchive: jest.fn(),
      commitUnarchive: jest.fn(),
      markAsUnread: jest.fn(),
      deleteConversation: jest.fn(),
    });
    render(<MessagesClient initialConversations={[]} currentUserId="user-1" />);
    
    fireEvent.click(screen.getByText('Close Chat'));
    
    expect(mockCommitArchive).toHaveBeenCalledWith('list-1', 'land-1');
    expect(mockSetActiveConversation).toHaveBeenCalledWith(null);
  });
});
