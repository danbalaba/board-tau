import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatInfoPanel } from '../chat-info-panel';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');

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

// Provide a mock for react-loading-skeleton
jest.mock('react-loading-skeleton', () => {
  return function MockSkeleton() {
    return <span data-testid="mock-skeleton" />;
  };
});

describe('ChatInfoPanel', () => {
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
    inquiryId: 'i-1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.get as jest.Mock).mockResolvedValue({
      data: { success: true, data: { inquiries: [], createdAt: '2023-01-01', emailVerified: true } }
    });
  });

  it('renders tenant name', async () => {
    render(<ChatInfoPanel activeConversation={mockConversation} />);
    const nameElements = await screen.findAllByText('John Doe');
    expect(nameElements.length).toBeGreaterThan(0);
  });

  it('renders section headers', async () => {
    render(<ChatInfoPanel activeConversation={mockConversation} />);
    expect(await screen.findByText('Trust Indicators')).toBeInTheDocument();
    expect(screen.getByText('Contact Info')).toBeInTheDocument();
  });
});
