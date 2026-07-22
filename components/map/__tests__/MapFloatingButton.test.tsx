import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MapFloatingButton from '../MapFloatingButton';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('axios');

jest.mock('@/hooks/use-scroll-direction', () => ({
  useScrollDirection: jest.fn(),
}));

jest.mock('../MapModal', () => {
  return function MockMapModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-map-modal">
        <button onClick={onClose}>Close Map</button>
      </div>
    );
  };
});



jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('MapFloatingButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('?test=1'));
    (useScrollDirection as jest.Mock).mockReturnValue('down');
    (axios.get as jest.Mock).mockResolvedValue({ data: { listings: [{ id: '1' }] } });
  });

  it('renders the floating button correctly', async () => {
    render(<MapFloatingButton listings={[]} />);
    expect(await screen.findByText('Show map')).toBeInTheDocument();
  });

  it('opens the map modal when clicked', async () => {
    render(<MapFloatingButton listings={[]} />);
    const button = await screen.findByText('Show map');
    fireEvent.click(button);
    
    expect(screen.getByTestId('mock-map-modal')).toBeInTheDocument();
    
    // Check if it fetches data when opened
    await waitFor(() => {
      // Fixed: The isMap=true query parameter is successfully passed to the API
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/listings?test=1&isMap=true&limit=100'));
    });
  });

  it('closes the map modal', async () => {
    render(<MapFloatingButton listings={[]} />);
    fireEvent.click(await screen.findByText('Show map'));
    
    expect(screen.getByTestId('mock-map-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close Map'));
    
    expect(screen.queryByTestId('mock-map-modal')).not.toBeInTheDocument();
  });
});
