import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChatInfoPanel } from '../ChatInfoPanel';
import axios from 'axios';

jest.mock('axios');
jest.mock('@/components/common/Avatar', () => ({
  __esModule: true,
  default: ({ name }: any) => <div data-testid="avatar">{name}</div>,
}));
jest.mock('@/components/common/SafeImage', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img data-testid="safe-image" src={src} alt={alt} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ChatInfoPanel', () => {
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

  const mockProfile = {
    id: 'landlord-1',
    name: 'John Doe',
    email: 'john@example.com',
    emailVerified: new Date().toISOString(),
    phoneNumber: '1234567890',
    bio: 'I am a landlord',
    createdAt: new Date().toISOString(),
    listings: [
      { id: '1', title: 'Listing 1', imageSrc: 'img1.jpg', category: 'Room', _count: { reviews: 5 } }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null if no active conversation', () => {
    const { container } = render(<ChatInfoPanel activeId={null} activeConversation={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches and displays landlord profile data', async () => {
    // Fixed: The API successfully returns the landlord profile data
    (axios.get as jest.Mock).mockResolvedValue({ data: { success: true, data: mockProfile } });
    
    render(<ChatInfoPanel activeId="conv-1" activeConversation={mockConversation as any} />);

    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText(/"I am a landlord"/)).toBeInTheDocument();
      expect(screen.getByText('Listing 1')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ChatInfoPanel activeId="conv-1" activeConversation={mockConversation as any} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch landlord profile', expect.any(Error));
    });
    
    expect(screen.getAllByText('—').length).toBeGreaterThan(0); // Email fallback
    consoleSpy.mockRestore();
  });

  it('opens and closes preview modal', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { success: true, data: mockProfile } });
    render(<ChatInfoPanel activeId="conv-1" activeConversation={mockConversation as any} />);

    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    });

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(screen.getAllByTestId('safe-image').length).toBeGreaterThan(0);

    const closeBtn = screen.getAllByRole('button').find(b => b.className.includes('bg-white/10'));
    if (closeBtn) fireEvent.click(closeBtn);
  });
});
