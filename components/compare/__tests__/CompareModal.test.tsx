import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CompareModal from '../CompareModal';
import { getComparedListings } from '@/app/actions/compare';

jest.mock('@/app/actions/compare', () => ({
  getComparedListings: jest.fn()
}));

jest.mock('@/hooks/use-compare-store', () => ({
  useCompareStore: () => ({
    clearListings: jest.fn()
  })
}));

jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>
}));

jest.mock('swiper/modules', () => ({
  Navigation: {},
  Pagination: {}
}));

jest.mock('swiper/css', () => jest.fn());
jest.mock('swiper/css/navigation', () => jest.fn());
jest.mock('swiper/css/pagination', () => jest.fn());

jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: any) {
    return <div data-testid="react-markdown">{children}</div>;
  };
});

describe('CompareModal', () => {
  const mockListing = {
    id: '1',
    title: 'Test Listing 1',
    price: 1000,
    region: 'City A',
    amenities: { wifi: true, pool: true },
    features: { cctv: true, security24h: false },
    rules: { petsAllowed: true },
    user: { name: 'Host A', image: null },
    category: ['Condo'],
    imageSrc: 'img1.jpg',
    images: ['img2.jpg'],
    reviews: [{ rating: 5 }, { rating: 4 }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getComparedListings as jest.Mock).mockResolvedValue([mockListing]);
    // Mock fetch for AI Chat
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ reply: 'AI response', suggestedPrompts: ['Prompt A'] }),
      })
    ) as jest.Mock;
    
    // Polyfill for scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('renders nothing if not open', () => {
    render(<CompareModal isOpen={false} onClose={jest.fn()} listingIds={['1']} />);
    expect(screen.queryByText(/Compare Options/i)).not.toBeInTheDocument();
  });

  it('loads and displays listings', async () => {
    render(<CompareModal isOpen={true} onClose={jest.fn()} listingIds={['1']} />);
    
    // Fixed the intentional error for the final green screenshot!
    expect(screen.getByText(/Fetching listing data/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Listing 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('₱')).toBeInTheDocument(); // currency symbol
    expect(screen.getByText('1,000')).toBeInTheDocument(); // price formatted
  });

  it('handles chat submission', async () => {
    render(<CompareModal isOpen={true} onClose={jest.fn()} listingIds={['1']} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Listing 1')).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/Ask about these properties/i);
    fireEvent.change(input, { target: { value: 'Is there a pool?' } });
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });
  });

  it('handles suggested prompt click', async () => {
    render(<CompareModal isOpen={true} onClose={jest.fn()} listingIds={['1']} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Listing 1')).toBeInTheDocument();
    });
    
    const promptBtn = screen.getByText('Which property offers the best value for money?');
    fireEvent.click(promptBtn);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });
  });

  it('toggles mobile tabs', async () => {
    render(<CompareModal isOpen={true} onClose={jest.fn()} listingIds={['1']} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Listing 1')).toBeInTheDocument();
    });
    
    const dataSheetBtn = screen.getByText('Data Sheet');
    const aiAdvisorBtn = screen.getByText('AI Advisor', { selector: 'button' }); // Since it's also a heading
    
    fireEvent.click(aiAdvisorBtn);
    expect(aiAdvisorBtn).toHaveClass('text-primary');
    
    fireEvent.click(dataSheetBtn);
    expect(dataSheetBtn).toHaveClass('text-primary');
  });
});
