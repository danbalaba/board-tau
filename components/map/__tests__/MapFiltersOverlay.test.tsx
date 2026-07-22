import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MapFiltersOverlay from '../MapFiltersOverlay';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/map',
}));

jest.mock('@/hooks/use-ai-search-store', () => ({
  useAISearchStore: () => ({
    recentQueries: [],
    addQuery: jest.fn(),
  }),
}));

describe('MapFiltersOverlay Component', () => {
  it('renders the search bar and placeholder', () => {
    render(<MapFiltersOverlay />);
    expect(screen.getByPlaceholderText("Ask AI: 'Cheap boarding house near TAU with wifi'")).toBeInTheDocument();
  });

  it('renders search controls', () => {
    render(<MapFiltersOverlay />);
    expect(screen.getByTitle('Directions')).toBeInTheDocument();
  });

  it('toggles directions mode when directions button is clicked', () => {
    const mockSetShowDirections = jest.fn();
    render(<MapFiltersOverlay setShowDirections={mockSetShowDirections} showDirections={false} />);
    const directionsButton = screen.getByTitle('Directions');
    
    fireEvent.click(directionsButton);
    expect(mockSetShowDirections).toHaveBeenCalledWith(true);
  });
});
