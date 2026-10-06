import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarDetailView from '../SidebarDetailView';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Swiper CSS
jest.mock('swiper/css', () => ({}), { virtual: true });
jest.mock('swiper/css/navigation', () => ({}), { virtual: true });
jest.mock('swiper/css/pagination', () => ({}), { virtual: true });

// Mock Swiper
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => <div data-testid="mock-swiper">{children}</div>,
  SwiperSlide: ({ children }: any) => <div data-testid="mock-swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Navigation: {},
  Pagination: {},
}));

describe('SidebarDetailView Component', () => {
  const mockOnBack = jest.fn();
  const mockListing = {
    id: '1',
    title: 'Test Listing',
    price: 1500,
    region: 'Camiling',
    rooms: [{ status: 'available' }],
    user: { name: 'Test Host' },
    amenities_list: ['WiFi', 'Parking'],
    features: { cctv: true },
    rules: { femaleOnly: true },
  };

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
  });

  it('renders listing details correctly', () => {
    renderWithProviders(<SidebarDetailView listing={mockListing} onBack={mockOnBack} />);
    
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument(); // Format price
    expect(screen.getByText('Test Host')).toBeInTheDocument();
    expect(screen.getByText('Strictly Female Only')).toBeInTheDocument();
    expect(screen.getByText(/CCTV/i)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    renderWithProviders(<SidebarDetailView listing={mockListing} onBack={mockOnBack} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockOnBack).toHaveBeenCalled();
  });
});
