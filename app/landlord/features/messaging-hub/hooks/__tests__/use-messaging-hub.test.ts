import { renderHook, act } from '@testing-library/react';
import { useMessagingHub } from '../use-messaging-hub';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { pusherClient } from '@/lib/pusher-client';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn()
}));

jest.mock('@/lib/pusher-client', () => ({
  pusherClient: {
    subscribe: jest.fn(() => ({
      bind: jest.fn(),
      unbind_all: jest.fn(),
    })),
    unsubscribe: jest.fn(),
  }
}));

const mockSession = {
  user: {
    id: 'u-1',
    name: 'Test Landlord'
  }
};

describe('useMessagingHub', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ data: mockSession });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn()
    });
    (axios.get as jest.Mock).mockResolvedValue({ data: { success: true, data: [mockConversation] } });
  });

  it('fetches initial conversations', async () => {
    const { result } = renderHook(() => useMessagingHub([]));
    
    // Initial state before fetch completes
    expect(result.current.isLoadingConversations).toBe(true);
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(axios.get).toHaveBeenCalledWith('/api/landlord/messages');
    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.isLoadingConversations).toBe(false);
  });

  it('can set active conversation', async () => {
    const { result } = renderHook(() => useMessagingHub([mockConversation]));
    
    act(() => {
      result.current.setActiveConversation(mockConversation);
    });

    expect(result.current.activeConversation).toEqual(mockConversation);
  });

  it('sends a message', async () => {
    const { result } = renderHook(() => useMessagingHub([mockConversation]));
    
    const mockSentMessage = {
      id: 'm-1',
      content: 'Hello there',
      senderId: 'u-1',
      receiverId: 't-1',
      listingId: 'l-1',
      read: false,
      createdAt: new Date().toISOString(),
    };

    (axios.post as jest.Mock).mockResolvedValue({
      data: { success: true, data: mockSentMessage }
    });

    act(() => {
      result.current.setActiveConversation(mockConversation);
    });

    await act(async () => {
      await result.current.sendMessage('Hello there');
    });

    expect(axios.post).toHaveBeenCalledWith('/api/landlord/messages', {
      listingId: 'l-1',
      receiverId: 't-1',
      content: 'Hello there'
    });

    expect(result.current.messages).toContainEqual(mockSentMessage);
  });

  it('archives a conversation with pending state', async () => {
    const { result } = renderHook(() => useMessagingHub([mockConversation]));
    
    (axios.patch as jest.Mock).mockResolvedValue({ data: { success: true } });

    act(() => {
      result.current.setActiveConversation(mockConversation);
    });

    await act(async () => {
      await result.current.archiveConversation();
    });

    expect(axios.patch).toHaveBeenCalledWith('/api/landlord/messages', {
      listingId: 'l-1',
      tenantId: 't-1',
      archive: true
    });

    // Check if the UI reflects pending archive
    expect(result.current.activeConversation?.isPendingArchive).toBe(true);
    expect(result.current.activeConversation?.isArchived).toBe(false);
  });
});
