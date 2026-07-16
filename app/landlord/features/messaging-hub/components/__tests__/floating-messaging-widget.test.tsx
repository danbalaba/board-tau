import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingMessagingWidget from '../floating-messaging-widget';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useMessagingHub } from '../../hooks/use-messaging-hub';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({ replace: jest.fn() }))
}));

jest.mock('../../hooks/use-messaging-hub', () => ({
  useMessagingHub: jest.fn()
}));

jest.mock('../conversations-list', () => ({
  ConversationsList: () => <div data-testid="mock-conversations-list" />
}));

jest.mock('../chat-view', () => ({
  ChatView: () => <div data-testid="mock-chat-view" />
}));

jest.mock('../../index', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-messaging-hub" />
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
    button: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
      return <button ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('FloatingMessagingWidget', () => {
  const mockSession = { user: { id: 'u-1' } };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ data: mockSession });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(),
      toString: jest.fn(() => '')
    });
    
    (useMessagingHub as jest.Mock).mockReturnValue({
      conversations: [],
      activeConversation: null,
      setActiveConversation: jest.fn(),
      messages: [],
      isLoadingConversations: false,
      isLoadingMessages: false,
    });
  });

  it('renders floating button initially', () => {
    render(<FloatingMessagingWidget />);
    // The button should be present
    expect(screen.getByRole('button')).toBeInTheDocument();
    // Widget body shouldn't be visible yet
    expect(screen.queryByTestId('mock-conversations-list')).not.toBeInTheDocument();
  });

  it('opens widget when clicking floating button', () => {
    render(<FloatingMessagingWidget />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    
    // Now the list should be visible
    expect(screen.getByTestId('mock-conversations-list')).toBeInTheDocument();
  });

  it('expands to full view when maximize button clicked', () => {
    render(<FloatingMessagingWidget />);
    // Open widget
    fireEvent.click(screen.getByRole('button'));
    
    // Click maximize
    const maximizeBtn = screen.getByTitle('Expand to full view');
    fireEvent.click(maximizeBtn);

    // Full view (MessagingHub) should render
    expect(screen.getByTestId('mock-messaging-hub')).toBeInTheDocument();
    // Inline list should be hidden
    expect(screen.queryByTestId('mock-conversations-list')).not.toBeInTheDocument();
  });
});
