import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessagingHub from '../index';
import { useMessagingHub } from '../hooks/use-messaging-hub';
import { useSearchParams } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({ get: jest.fn() }))
}));

jest.mock('../hooks/use-messaging-hub', () => ({
  useMessagingHub: jest.fn()
}));

jest.mock('../components/conversations-list', () => ({
  ConversationsList: ({ onSelect }: any) => (
    <div data-testid="mock-conversations-list">
      <button onClick={() => onSelect({ id: 'c-1' })}>Select Conv</button>
    </div>
  )
}));

jest.mock('../components/chat-view', () => ({
  ChatView: ({ onToggleInfo, onCloseChat }: any) => (
    <div data-testid="mock-chat-view">
      <button onClick={onToggleInfo}>Toggle Info</button>
      <button onClick={onCloseChat}>Close Chat</button>
    </div>
  )
}));

jest.mock('../components/chat-info-panel', () => ({
  ChatInfoPanel: () => <div data-testid="mock-chat-info-panel" />
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

describe('MessagingHub (Index)', () => {
  const mockSetActiveConversation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMessagingHub as jest.Mock).mockReturnValue({
      conversations: [],
      activeConversation: null,
      setActiveConversation: mockSetActiveConversation,
      messages: [],
      isLoadingConversations: false,
      isLoadingMessages: false,
      commitArchive: jest.fn(),
      commitUnarchive: jest.fn(),
    });
  });

  it('renders layout with list and chat view', () => {
    render(<MessagingHub initialConversations={[]} />);
    expect(screen.getByTestId('mock-conversations-list')).toBeInTheDocument();
    expect(screen.getByTestId('mock-chat-view')).toBeInTheDocument();
  });

  it('toggles info panel when requested by chat view', () => {
    (useMessagingHub as jest.Mock).mockReturnValue({
      conversations: [],
      messages: [],
      activeConversation: { id: 'c-1' },
      setActiveConversation: mockSetActiveConversation,
      commitArchive: jest.fn(),
      commitUnarchive: jest.fn(),
    });
    
    render(<MessagingHub initialConversations={[]} />);
    
    // Initially not showing
    expect(screen.queryByTestId('mock-chat-info-panel')).not.toBeInTheDocument();
    
    // Toggle
    fireEvent.click(screen.getByText('Toggle Info'));
    expect(screen.getByTestId('mock-chat-info-panel')).toBeInTheDocument();
  });
  
  it('calls setActiveConversation when selecting from list', () => {
    render(<MessagingHub initialConversations={[]} />);
    fireEvent.click(screen.getByText('Select Conv'));
    expect(mockSetActiveConversation).toHaveBeenCalledWith({ id: 'c-1' });
  });
});
