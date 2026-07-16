import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HeartButton from '../HeartButton';
import { SessionProvider, useSession } from 'next-auth/react';
import { updateFavorite } from '@/services/user/favorites';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: any) => <>{children}</>
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

jest.mock('@/services/user/favorites', () => ({
  updateFavorite: jest.fn()
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn()
}));

describe('HeartButton', () => {
  const mockError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useResponsiveToast as jest.Mock).mockReturnValue({ error: mockError });
  });

  it('shows error if not authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'unauthenticated' });
    
    render(<HeartButton listingId="1" hasFavorited={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockError).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Please sign in'
    }));
  });

  it('toggles favorite when authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'authenticated' });
    (updateFavorite as jest.Mock).mockResolvedValue({});
    
    render(<HeartButton listingId="1" hasFavorited={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(updateFavorite).toHaveBeenCalledWith({
        listingId: '1',
        favorite: true
      });
    });
  });

  it('renders with label if showLabel is true', () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'authenticated' });
    
    render(<HeartButton listingId="1" hasFavorited={false} showLabel={true} />);
    
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
