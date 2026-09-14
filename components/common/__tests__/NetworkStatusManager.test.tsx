import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { NetworkStatusManager } from '../NetworkStatusManager';
import { useNetworkStatus } from '@/hooks/use-network-status';

// Mock hooks
jest.mock('@/hooks/use-network-status', () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock framer-motion to simplify testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    path: ({ ...props }: any) => <path {...props} />,
    circle: ({ ...props }: any) => <circle {...props} />,
    img: ({ ...props }: any) => <img {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('NetworkStatusManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.style.overflow = '';
  });

  it('renders nothing when online initially', () => {
    (useNetworkStatus as jest.Mock).mockReturnValue(true);
    
    const { container } = render(<NetworkStatusManager />);
    
    expect(container).toBeEmptyDOMElement();
    expect(document.body.style.overflow).toBe('');
  });

  it('renders offline overlay when offline', () => {
    (useNetworkStatus as jest.Mock).mockReturnValue(false);
    
    render(<NetworkStatusManager />);
    
    expect(screen.getByText(/No Internet Connection/i)).toBeInTheDocument();
    expect(screen.getByText(/Please check your Wi-Fi router/i)).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    
    // Body scroll should be locked
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('shows back online toast and hides it after 3 seconds', () => {
    // Start offline
    (useNetworkStatus as jest.Mock).mockReturnValue(false);
    const { rerender } = render(<NetworkStatusManager />);
    
    expect(screen.getByText(/No Internet Connection/i)).toBeInTheDocument();
    
    // Go online
    (useNetworkStatus as jest.Mock).mockReturnValue(true);
    rerender(<NetworkStatusManager />);
    
    // Should show "Connection Restored" toast
    expect(screen.getByText(/Connection Restored/i)).toBeInTheDocument();
    expect(screen.queryByText(/No Internet Connection/i)).not.toBeInTheDocument();
    
    // Body scroll should be unlocked
    expect(document.body.style.overflow).toBe('');
    
    // Advance timers by 3 seconds
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    
    // Toast should be gone
    expect(screen.queryByText(/Connection Restored/i)).not.toBeInTheDocument();
  });

  it('reloads page when refresh button is clicked', () => {
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
    
    (useNetworkStatus as jest.Mock).mockReturnValue(false);
    render(<NetworkStatusManager />);
    
    const refreshBtn = screen.getByText('Refresh Page');
    refreshBtn.click();
    
    expect(reloadMock).toHaveBeenCalled();
  });
});
