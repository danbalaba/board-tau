import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CompareModal from '../CompareModal';
import { getComparedListings } from '@/app/actions/compare';

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

const mockClearListings = jest.fn();
const mockGetCachedListings = jest.fn(() => [mockListing]);
const mockSetCachedListings = jest.fn();

jest.mock('@/app/actions/compare', () => ({
  getComparedListings: jest.fn(() => Promise.resolve([mockListing]))
}));

jest.mock('@/hooks/use-compare-store', () => ({
  useCompareStore: () => ({
    clearListings: mockClearListings,
    getCachedListings: mockGetCachedListings,
    setCachedListings: mockSetCachedListings
  })
}));

jest.mock('@/lib/landlordTaxonomyCache', () => ({
  getCachedPropertyTypes: jest.fn(() => Promise.resolve([])),
  getCachedAttributes: jest.fn(() => Promise.resolve([])),
  getCachedSubGroups: jest.fn(() => Promise.resolve([])),
  getSyncPropertyTypes: jest.fn(() => []),
  getSyncAttributes: jest.fn(() => []),
  getSyncSubGroups: jest.fn(() => [])
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
jest.mock('remark-gfm', () => jest.fn());

describe('CompareModal', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (getComparedListings as jest.Mock).mockResolvedValue([mockListing]);
    mockGetCachedListings.mockReturnValue([mockListing]);
    
    mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ reply: 'AI response', suggestedPrompts: ['Prompt A'] }),
      })
    );
    
    global.fetch = mockFetch;
    globalThis.fetch = mockFetch;
    if (typeof window !== 'undefined') {
      window.fetch = mockFetch;
    }
    
    // Polyfill for scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('renders nothing if not open', () => {
    render(<CompareModal isOpen={false} onClose={jest.fn()} listingIds={['1']} />);
    expect(screen.queryByText(/Compare Options/i)).not.toBeInTheDocument();
  });

  it('loads and displays listings', async () => {
    render(<CompareModal isOpen={true} onClose={jest.fn()} listingIds={['1']} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Listing 1').length).toBeGreaterThan(0);
    });
    
    expect(screen.getAllByText('₱').length).toBeGreaterThan(0); // currency symbol
    expect(screen.getAllByText('1,000').length).toBeGreaterThan(0); // price formatted
  });

  it('handles chat submission', async () => {
    render(<CompareModal isOpen={true} onClose={jest.fn()} listingIds={['1']} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Listing 1').length).toBeGreaterThan(0);
    });
    
    const input = screen.getByPlaceholderText(/Ask about these properties/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Is there a pool?' } });
    });
    
    await act(async () => {
      const activeInput = screen.getByPlaceholderText(/Ask about these properties/i);
      const activeForm = activeInput.closest('form')!;
      fireEvent.submit(activeForm);
    });
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });
  });

  it('handles suggested prompt click', async () => {
    render(<CompareModal isOpen={true} onClose={jest.fn()} listingIds={['1']} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Listing 1').length).toBeGreaterThan(0);
    });
    
    const promptBtn = screen.getByText('Which property offers the best value for money?');
    fireEvent.click(promptBtn);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });
  });

  it('toggles mobile tabs', async () => {
    render(<CompareModal isOpen={true} onClose={jest.fn()} listingIds={['1']} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Listing 1').length).toBeGreaterThan(0);
    });
    
    const kerbyAiBtn = screen.getByText('Kerby AI', { selector: 'span' }).closest('button')!;
    fireEvent.click(kerbyAiBtn);
    
    await waitFor(() => {
      expect(kerbyAiBtn).toHaveClass('text-[#2f7d6d]');
    });
    
    const propertySpecsBtn = screen.getByText('Property Specs', { selector: 'span' }).closest('button')!;
    fireEvent.click(propertySpecsBtn);
    
    await waitFor(() => {
      expect(propertySpecsBtn).toHaveClass('text-[#2f7d6d]');
    });
  });
});
