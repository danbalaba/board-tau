import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessages, TenantConversation } from '../use-messages';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({ error: toast.error, success: toast.success }),
}));

jest.mock('@/lib/pusher-client', () => ({
  pusherClient: {
    subscribe: jest.fn(() => ({ bind: jest.fn() })),
    unsubscribe: jest.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useMessages', () => {
  const mockConversations: TenantConversation[] = [
    {
      id: 'conv1',
      listingId: 'list1',
      listingTitle: 'Nice Room',
      listingImage: 'img.jpg',
      landlordId: 'land1',
      landlordName: 'John',
      landlordImage: 'j.jpg',
      lastMessage: 'Hi',
      lastMessageTime: '2026-01-01',
      unreadCount: 0,
      isArchived: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('initializes and handles setActiveConversation', () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    
    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    expect(result.current.conversations).toEqual(mockConversations);
    
    act(() => { result.current.setActiveConversation(mockConversations[0]); });
    expect(result.current.activeConversation).toEqual(mockConversations[0]);

    act(() => { result.current.setActiveConversation(null); });
    expect(result.current.activeConversation).toBeNull();
  });

  it('sends a message', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    (axios.post as jest.Mock).mockResolvedValue({ data: { message: { id: 'm1', content: 'hello' } } });

    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    act(() => { result.current.setActiveConversation(mockConversations[0]); });
    await waitFor(() => expect(result.current.activeConversation).toBeTruthy());

    await act(async () => {
      result.current.sendMessage('hello');
      // Wait for mutation to settle
      await new Promise(r => setTimeout(r, 100));
    });
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/messages', {
        listingId: 'list1',
        receiverId: 'land1',
        content: 'hello'
      });
    }, { timeout: 3000 });
  });

  it('archives conversation optimistically', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    await act(async () => { await result.current.archiveConversation('list1', 'land1'); });
    
    expect(result.current.conversations[0].isPendingArchive).toBe(true);
    expect(axios.put).toHaveBeenCalledWith('/api/tenant/conversations/archive', { listingId: 'list1', otherUserId: 'land1', isArchived: true });
  });

  it('undoes archive', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    await act(async () => { await result.current.archiveConversation('list1', 'land1'); });
    await act(async () => { await result.current.undoArchive('list1', 'land1'); });
    
    expect(result.current.conversations[0].isPendingArchive).toBe(false);
    expect(axios.put).toHaveBeenCalledWith('/api/tenant/conversations/archive', { listingId: 'list1', otherUserId: 'land1', isArchived: false });
  });

  it('commits archive', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    await act(async () => { await result.current.archiveConversation('list1', 'land1'); });
    act(() => { result.current.commitArchive('list1', 'land1'); });
    
    expect(result.current.conversations[0].isArchived).toBe(true);
    expect(result.current.conversations[0].isPendingArchive).toBe(false);
  });

  it('unarchives conversation optimistically', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    await act(async () => { await result.current.unarchiveConversation('list1', 'land1'); });
    
    expect(result.current.conversations[0].isPendingUnarchive).toBe(true);
    expect(axios.put).toHaveBeenCalledWith('/api/tenant/conversations/archive', { listingId: 'list1', otherUserId: 'land1', isArchived: false });
  });

  it('undoes unarchive', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    await act(async () => { await result.current.unarchiveConversation('list1', 'land1'); });
    await act(async () => { await result.current.undoUnarchive('list1', 'land1'); });
    
    expect(result.current.conversations[0].isPendingUnarchive).toBe(false);
    expect(result.current.conversations[0].isArchived).toBe(true);
  });

  it('commits unarchive', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    await act(async () => { await result.current.unarchiveConversation('list1', 'land1'); });
    act(() => { result.current.commitUnarchive('list1', 'land1'); });
    
    expect(result.current.conversations[0].isArchived).toBe(false);
    expect(result.current.conversations[0].isPendingUnarchive).toBe(false);
  });

  it('marks as unread', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    await waitFor(() => expect(result.current.conversations.length).toBeGreaterThan(0));
    
    await act(async () => { await result.current.markAsUnread('list1', 'land1'); });
    
    expect(axios.put).toHaveBeenCalledWith('/api/messages/mark-unread', { listingId: 'list1', otherUserId: 'land1' });
    expect(result.current.conversations[0].unreadCount).toBe(1);
    expect(toast.success).toHaveBeenCalledWith('Marked as unread');
  });

  it('deletes conversation', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/tenant/conversations') return Promise.resolve({ data: { data: mockConversations } });
      return Promise.resolve({ data: { messages: [] } });
    });
    (axios.delete as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useMessages(mockConversations, 'u1'), { wrapper });
    
    act(() => { result.current.setActiveConversation(mockConversations[0]); });
    await act(async () => { await result.current.deleteConversation(); });
    
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/messages?listingId=list1&otherUserId=land1');
      expect(toast.success).toHaveBeenCalledWith('Conversation history deleted');
      expect(result.current.activeConversation).toBeNull();
    });
  });
});
