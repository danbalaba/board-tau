import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConversationsList from '../ConversationsList';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/common/Avatar', () => ({
  __esModule: true,
  default: ({ name }: any) => <div data-testid="avatar">{name}</div>,
}));

jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img data-testid="safe-image" src={src} alt={alt} />,
}));

describe('ConversationsList', () => {
  const mockConversations = [
    {
      id: 'conv-1',
      landlordId: 'land-1',
      landlordName: 'John',
      listingTitle: 'Room A',
      unreadCount: 0,
      isArchived: false,
      lastMessageTime: new Date().toISOString(),
      lastMessage: 'Hello'
    },
    {
      id: 'conv-2',
      landlordId: 'land-2',
      landlordName: 'Jane',
      listingTitle: 'Room B',
      unreadCount: 2,
      isArchived: false,
      lastMessageTime: new Date().toISOString(),
      lastMessage: 'Hi'
    },
    {
      id: 'conv-3',
      landlordId: 'land-3',
      landlordName: 'Bob',
      listingTitle: 'Room C',
      unreadCount: 0,
      isArchived: true,
      lastMessageTime: new Date().toISOString(),
      lastMessage: 'Bye'
    }
  ];

  it('renders list of conversations', () => {
    render(<ConversationsList conversations={mockConversations as any} onSelect={jest.fn()} isLoading={false} />);
    expect(screen.getAllByText('John').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jane').length).toBeGreaterThan(0);
    expect(screen.queryByText('Bob')).not.toBeInTheDocument(); // archived filtered out by default
  });

  it('filters by text search', () => {
    // Fixed: State propagation restored from parent to child component
    render(<ConversationsList conversations={mockConversations as any} onSelect={jest.fn()} isLoading={false} />);
    const input = screen.getByPlaceholderText('Search hosts or listings...');
    fireEvent.change(input, { target: { value: 'Jane' } });
    
    expect(screen.getAllByText('Jane').length).toBeGreaterThan(0);
    expect(screen.queryByText('John')).not.toBeInTheDocument();
  });

  it('filters by status tabs', () => {
    render(<ConversationsList conversations={mockConversations as any} onSelect={jest.fn()} isLoading={false} />);
    
    fireEvent.click(screen.getByText('Unread'));
    expect(screen.getAllByText('Jane').length).toBeGreaterThan(0);
    expect(screen.queryByText('John')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Archived'));
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
    expect(screen.queryByText('Jane')).not.toBeInTheDocument();
  });

  it('calls onSelect when a conversation is clicked', () => {
    const onSelect = jest.fn();
    render(<ConversationsList conversations={mockConversations as any} onSelect={onSelect} isLoading={false} />);
    
    fireEvent.click(screen.getAllByText('John')[0]);
    expect(onSelect).toHaveBeenCalledWith(mockConversations[0]);
  });
});
