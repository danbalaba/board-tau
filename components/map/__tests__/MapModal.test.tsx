import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MapModal from '../MapModal';
import { useSession } from 'next-auth/react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useRecentStore } from '@/hooks/use-recent-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/components/common/ResponsiveToast', () => ({
  useResponsiveToast: jest.fn(),
}));

jest.mock('@/hooks/use-recent-store', () => ({
  useRecentStore: jest.fn(),
}));

// Mock dynamic and child components
jest.mock('next/dynamic', () => () => {
  return function MockInteractiveMap() {
    return <div data-testid="mock-interactive-map" />;
  };
});

jest.mock('../MapActionSidebar', () => {
  return function MockMapActionSidebar({ onMenuClick, onSavedClick }: any) {
    return (
      <div data-testid="mock-map-action-sidebar">
        <button onClick={onMenuClick}>Menu</button>
        <button onClick={onSavedClick}>Saved</button>
      </div>
    );
  };
});

jest.mock('../SidebarListView', () => () => <div data-testid="mock-sidebar-list-view" />);
jest.mock('../SidebarDetailView', () => () => <div data-testid="mock-sidebar-detail-view" />);
jest.mock('../MapFiltersOverlay', () => () => <div data-testid="mock-map-filters-overlay" />);
jest.mock('../LandmarkCard', () => () => <div data-testid="mock-landmark-card" />);
jest.mock('../ListingPinCard', () => () => <div data-testid="mock-listing-pin-card" />);
jest.mock('../SavedListView', () => () => <div data-testid="mock-saved-list-view" />);
jest.mock('../RecentsListView', () => () => <div data-testid="mock-recents-list-view" />);
jest.mock('../../modals/Modal', () => ({ isOpen, children }: any) => isOpen ? <div data-testid="mock-modal">{children}</div> : null);
jest.mock('../../modals/AuthModal', () => () => <div data-testid="mock-auth-modal" />);

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/map',
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('MapModal Component', () => {
  const mockOnClose = jest.fn();
  const mockListings: any = [{ id: '1', title: 'Listing 1', latitude: 14.5, longitude: 121 }];
  const mockToastError = jest.fn();
  const mockAddRecentListing = jest.fn();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (useResponsiveToast as jest.Mock).mockReturnValue({ error: mockToastError });
    (useRecentStore as unknown as jest.Mock).mockReturnValue({ addRecentListing: mockAddRecentListing });
  });

  it('does not render when isOpen is false', () => {
    const { container } = renderWithProviders(<MapModal isOpen={false} onClose={mockOnClose} listings={mockListings} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    renderWithProviders(<MapModal isOpen={true} onClose={mockOnClose} listings={mockListings} />);
    expect(screen.getByTestId('mock-map-action-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-sidebar-list-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-interactive-map')).toBeInTheDocument();
  });

  it('calls onClose when escape key is pressed', () => {
    renderWithProviders(<MapModal isOpen={true} onClose={mockOnClose} listings={mockListings} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('requires auth to view saved listings', () => {
    renderWithProviders(<MapModal isOpen={true} onClose={mockOnClose} listings={mockListings} />);
    fireEvent.click(screen.getByText('Saved'));
    
    expect(mockToastError).toHaveBeenCalled();
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByTestId('mock-auth-modal')).toBeInTheDocument();
  });

  it('shows saved view if authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { id: '1' } }, status: 'authenticated' });
    renderWithProviders(<MapModal isOpen={true} onClose={mockOnClose} listings={mockListings} />);
    
    fireEvent.click(screen.getByText('Saved'));
    
    expect(screen.getByTestId('mock-saved-list-view')).toBeInTheDocument();
  });
});
