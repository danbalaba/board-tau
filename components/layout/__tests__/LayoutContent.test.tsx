import React from 'react';
import { render, screen } from '@testing-library/react';
import LayoutContent from '../LayoutContent';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../LayoutContentClient', () => {
  return function MockLayoutContentClient({ user, children }: any) {
    return (
      <div data-testid="layout-content-client">
        <div data-testid="user-data">{JSON.stringify(user)}</div>
        <div data-testid="children">{children}</div>
      </div>
    );
  };
});

describe('LayoutContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with no session', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    // Since it's an async component, we await it
    const jsx = await LayoutContent({ children: <p>Child Content</p> });
    render(jsx);

    expect(screen.getByTestId('layout-content-client')).toBeInTheDocument();
    expect(screen.getByTestId('children')).toHaveTextContent('Child Content');
    // User should be undefined/null
    expect(screen.getByTestId('user-data')).toHaveTextContent('');
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it('renders correctly with session but no db user', async () => {
    const mockSession = { user: { email: 'test@example.com', name: 'Test User' } };
    (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
    (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const jsx = await LayoutContent({ children: <p>Child</p> });
    render(jsx);

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      select: expect.any(Object),
    });
    
    // It should fall back to session user
    expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(mockSession.user));
  });

  it('renders correctly with session and db user (merging them)', async () => {
    const mockSession = { user: { email: 'test@example.com', name: 'Test User Session' } };
    const mockDbUser = { id: '1', email: 'test@example.com', name: 'Test User DB', role: 'TENANT', image: 'image.jpg' };
    
    (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
    (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockDbUser);

    const jsx = await LayoutContent({ children: <p>Child</p> });
    render(jsx);

    const expectedMergedUser = {
      ...mockSession.user,
      ...mockDbUser,
    };
    
    expect(screen.getByTestId('user-data')).toHaveTextContent(JSON.stringify(expectedMergedUser));
  });
});
