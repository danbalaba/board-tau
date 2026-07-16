import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandlordPropertySearch } from '../landlord-property-search';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: any) => value,
}));

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return true;
      return () => <div data-testid={`icon-${String(prop)}`} />;
    }
  });
});

const mockProperties = [
  { id: '1', title: 'Listing A', region: 'City A', price: 1000, imageSrc: 'img1.jpg' },
  { id: '2', title: 'Listing B', region: 'City B', price: 2000, imageSrc: null },
] as any[];

describe('LandlordPropertySearch', () => {
  const mockSetSearchQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <LandlordPropertySearch
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
        properties={mockProperties}
      />
    );
    expect(screen.getByPlaceholderText(/Search properties.../i)).toBeInTheDocument();
  });

  it('calls setSearchQuery on input change', async () => {
    render(
      <LandlordPropertySearch
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
        properties={mockProperties}
      />
    );
    
    const input = screen.getByPlaceholderText(/Search properties.../i);
    fireEvent.change(input, { target: { value: 'Listing' } });
    
    await waitFor(() => {
      expect(mockSetSearchQuery).toHaveBeenCalledWith('Listing');
    });
  });

  it('clears search query when clear button is clicked', () => {
    render(
      <LandlordPropertySearch
        searchQuery="Listing"
        setSearchQuery={mockSetSearchQuery}
        properties={mockProperties}
      />
    );
    
    const clearBtn = screen.getByRole('button');
    fireEvent.click(clearBtn);
    
    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
  });

  it('shows suggestions on focus if query length >= 2', () => {
    render(
      <LandlordPropertySearch
        searchQuery="Listing"
        setSearchQuery={mockSetSearchQuery}
        properties={mockProperties}
      />
    );
    
    const input = screen.getByPlaceholderText(/Search properties.../i);
    fireEvent.focus(input);
    
    expect(screen.getByText('Possible Matches')).toBeInTheDocument();
    expect(screen.getByText('Listing A')).toBeInTheDocument();
    expect(screen.getByText('Listing B')).toBeInTheDocument();
  });
});
