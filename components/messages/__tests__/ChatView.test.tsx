import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ChatView from '../ChatView';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/common/Avatar', () => ({
  __esModule: true,
  default: ({ name }: any) => <div data-testid="avatar">{name}</div>,
}));

jest.mock('@/components/modals/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, children }: any) => isOpen ? <div data-testid="modal">{children}</div> : null,
}));

jest.mock('@/components/common/ConfirmModal', () => ({
  __esModule: true,
  default: ({ onConfirm, onClose }: any) => (
    <div data-testid="confirm-modal">
      <button onClick={onConfirm}>Confirm Delete</button>
      <button onClick={onClose}>Cancel Delete</button>
    </div>
  ),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: () => ({ success: jest.fn(), info: jest.fn() })
}));

describe('ChatView', () => {
  const mockConversation = {
    id: 'conv-1',
    landlordId: 'landlord-1',
    landlordName: 'John Doe',
    landlordImage: 'john.jpg',
    listingId: 'listing-1',
    listingTitle: 'Cozy Room',
    listingImage: 'room.jpg',
    unreadCount: 0,
    isArchived: false,
    lastMessage: 'Hello',
    lastMessageTime: new Date().toISOString()
  };

  const mockMessages = [
    { id: 'msg-1', content: 'Hello there!', senderId: 'landlord-1', createdAt: new Date().toISOString() },
    { id: 'msg-2', content: 'Hi, how are you?', senderId: 'user-1', createdAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders empty state if no active conversation', () => {
    render(<ChatView activeConversation={null} messages={[]} currentUserId="user-1" isLoading={false} isSending={false} onSendMessage={jest.fn()} />);
    expect(screen.getByText('Your Inbox')).toBeInTheDocument();
  });

  it('renders conversation and messages', () => {
    render(<ChatView activeConversation={mockConversation as any} messages={mockMessages as any} currentUserId="user-1" isLoading={false} isSending={false} onSendMessage={jest.fn()} />);
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getByText('Host of Cozy Room')).toBeInTheDocument();
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByText('Hi, how are you?')).toBeInTheDocument();
  });

  it('handles sending a message', () => {
    const onSendMessage = jest.fn();
    render(<ChatView activeConversation={mockConversation as any} messages={[]} currentUserId="user-1" isLoading={false} isSending={false} onSendMessage={onSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'New message' } });
    
    // Fixed: Keyboard event correctly processed without modifier keys
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });
    
    expect(onSendMessage).toHaveBeenCalledWith('New message');
  });

  it('opens and closes actions menu, then clicks archive', () => {
    const onArchive = jest.fn();
    render(<ChatView activeConversation={mockConversation as any} messages={[]} currentUserId="user-1" isLoading={false} isSending={false} onSendMessage={jest.fn()} onArchive={onArchive} />);
    
    const buttons = screen.getAllByRole('button');
    // Button index 2 should be dots
    fireEvent.click(buttons[2]);
    
    expect(screen.getByText('Archive Chat')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Archive Chat'));
    expect(onArchive).toHaveBeenCalled();
    
    expect(screen.getByText(/This conversation is archived/i)).toBeInTheDocument();
    
    const onUndoArchive = jest.fn();
    render(<ChatView activeConversation={mockConversation as any} messages={[]} currentUserId="user-1" isLoading={false} isSending={false} onSendMessage={jest.fn()} onArchive={onArchive} onUndoArchive={onUndoArchive} />);
    
    const undoBtn = screen.getByText(/Undo/i);
    fireEvent.click(undoBtn);
  });

  it('shows unarchive state and delete modal', () => {
    const archivedConv = { ...mockConversation, isArchived: true };
    const onDelete = jest.fn();
    render(<ChatView activeConversation={archivedConv as any} messages={[]} currentUserId="user-1" isLoading={false} isSending={false} onSendMessage={jest.fn()} onDelete={onDelete} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]); 
    
    expect(screen.getByText('Delete History')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete History'));
    
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Confirm Delete'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('clears undo timer automatically', () => {
    const onArchive = jest.fn();
    const onCloseChat = jest.fn();
    render(<ChatView activeConversation={mockConversation as any} messages={[]} currentUserId="user-1" isLoading={false} isSending={false} onSendMessage={jest.fn()} onArchive={onArchive} onCloseChat={onCloseChat} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]);
    fireEvent.click(screen.getByText('Archive Chat'));
    
    expect(screen.getByText(/This conversation is archived/i)).toBeInTheDocument();
    
    act(() => {
      // Fixed: The timer advances exactly to the required 5000ms threshold
      jest.advanceTimersByTime(5000);
    });
    
    expect(onCloseChat).toHaveBeenCalled();
  });
});
