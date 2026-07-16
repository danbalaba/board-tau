import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FavoritesClient from '../FavoritesClient';
import { SessionProvider } from 'next-auth/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: jest.fn(() => ({ get: jest.fn() }))
}));

jest.mock('@/components/listings/ListingCard', () => {
  return function MockListingCard({ data, isHighlighted }: any) {
    return <div data-testid={`listing-card-${data.id}`}>{data.title}</div>;
  };
});

jest.mock('@/components/common/ModernSelect', () => {
  return function MockModernSelect({ value, onChange, options, instanceId }: any) {
    return (
      <select data-testid={`modern-select-${instanceId}`} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  };
});

describe('FavoritesClient', () => {
  const mockFavorites = [
    { id: '1', title: 'Test Listing 1', region: 'Region A', country: 'Country A', price: 100, createdAt: '2026-07-01T00:00:00Z' },
    { id: '2', title: 'Test Listing 2', region: 'Region B', country: 'Country B', price: 200, createdAt: '2026-07-02T00:00:00Z' }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders favorites', async () => {
    render(
      <SessionProvider session={null}>
        <FavoritesClient initialFavorites={mockFavorites as any} />
      </SessionProvider>
    );

    act(() => { jest.advanceTimersByTime(800); });
    act(() => { jest.advanceTimersByTime(1500); });

    expect(screen.getByTestId('listing-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('listing-card-2')).toBeInTheDocument();
  });

  it('renders empty state when no favorites exist', async () => {
    render(
      <SessionProvider session={null}>
        <FavoritesClient initialFavorites={[]} />
      </SessionProvider>
    );

    act(() => { jest.advanceTimersByTime(800); });
    act(() => { jest.advanceTimersByTime(1500); });

    expect(screen.getByText(/No Favorites Found/i)).toBeInTheDocument();
  });

  it('filters by region', async () => {
    render(
      <SessionProvider session={null}>
        <FavoritesClient initialFavorites={mockFavorites as any} />
      </SessionProvider>
    );

    act(() => { jest.advanceTimersByTime(800); });
    act(() => { jest.advanceTimersByTime(1500); });

    const regionSelect = screen.getByTestId('modern-select-region-filter');
    fireEvent.change(regionSelect, { target: { value: 'Region A' } });

    act(() => { jest.advanceTimersByTime(600); });
    act(() => { jest.advanceTimersByTime(600); });

    expect(screen.getByTestId('listing-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('listing-card-2')).not.toBeInTheDocument();
  });

  it('filters by search query', async () => {
    render(
      <SessionProvider session={null}>
        <FavoritesClient initialFavorites={mockFavorites as any} />
      </SessionProvider>
    );

    act(() => { jest.advanceTimersByTime(800); });
    act(() => { jest.advanceTimersByTime(1500); });

    const searchInput = screen.getByPlaceholderText(/Search by title or region/i);
    fireEvent.change(searchInput, { target: { value: 'Listing 2' } });

    act(() => { jest.advanceTimersByTime(600); });
    act(() => { jest.advanceTimersByTime(600); });

    expect(screen.queryByTestId('listing-card-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('listing-card-2')).toBeInTheDocument();
  });

  it('sorts favorites by price high', async () => {
    render(
      <SessionProvider session={null}>
        <FavoritesClient initialFavorites={mockFavorites as any} />
      </SessionProvider>
    );

    act(() => { jest.advanceTimersByTime(800); });
    act(() => { jest.advanceTimersByTime(1500); });

    const sortSelect = screen.getByTestId('modern-select-sort-filter');
    fireEvent.change(sortSelect, { target: { value: 'price-high' } });

    act(() => { jest.advanceTimersByTime(600); });
    act(() => { jest.advanceTimersByTime(600); });

    expect(screen.getByTestId('listing-card-1')).toBeInTheDocument();
  });
});
