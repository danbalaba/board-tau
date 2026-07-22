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
    expect(screen.getByPlaceholderText('Search landmarks, areas, or colleges...')).toBeInTheDocument();
  });

  it('renders quick filter pills', () => {
    render(<MapFiltersOverlay />);
    expect(screen.getByText('Any College')).toBeInTheDocument();
    expect(screen.getByText('Under ₱2k')).toBeInTheDocument();
    expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    expect(screen.getByText('Female Only')).toBeInTheDocument();
  });

  it('toggles filter pill and calls router.replace', () => {
    render(<MapFiltersOverlay />);
    const collegeButton = screen.getByText('Any College');
    
    fireEvent.click(collegeButton);
    expect(mockReplace).toHaveBeenCalled();
  });
});
