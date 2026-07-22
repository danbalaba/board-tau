import React from 'react';
import { render } from '@testing-library/react';
import InteractiveMap from '../InteractiveMap';
import { useTheme } from 'next-themes';

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock leaflet fully to prevent jsdom errors
const mockMapInstance = {
  setView: jest.fn().mockReturnThis(),
  addLayer: jest.fn().mockReturnThis(),
  removeLayer: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  flyTo: jest.fn().mockReturnThis(),
  remove: jest.fn().mockReturnThis(),
  distance: jest.fn().mockReturnValue(100),
  getContainer: jest.fn().mockReturnValue(document.createElement('div')),
  getBounds: jest.fn(),
  hasLayer: jest.fn().mockReturnValue(false),
};

jest.mock('leaflet', () => {
  const L = {
    map: jest.fn(() => mockMapInstance),
    control: {
      zoom: jest.fn().mockReturnValue({ addTo: jest.fn() }),
      layers: jest.fn().mockReturnValue({ addTo: jest.fn() }),
    },
    tileLayer: jest.fn().mockReturnValue({ addTo: jest.fn() }),
    divIcon: jest.fn(),
    marker: jest.fn(() => ({ addTo: jest.fn().mockReturnThis(), on: jest.fn() })),
    circle: jest.fn(() => ({ addTo: jest.fn() })),
    polyline: jest.fn(() => ({ addTo: jest.fn() })),
    point: jest.fn(),
    markerClusterGroup: jest.fn(() => ({
      addTo: jest.fn(),
      addLayers: jest.fn(),
      clearLayers: jest.fn(),
      zoomToShowLayer: jest.fn(),
      on: jest.fn().mockReturnThis(),
    })),
  };
  return L;
});

jest.mock('leaflet.markercluster', () => ({}), { virtual: true });

describe('InteractiveMap Component', () => {
  const mockOnListingClick = jest.fn();
  const mockOnLandmarkClick = jest.fn();
  const mockListings: any = [{ id: '1', title: 'Listing 1', latitude: 14.5, longitude: 121, price: 1000 }];

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'light' });
  });

  it('renders the map container without crashing', () => {
    const { container } = render(
      <InteractiveMap 
        onListingClick={mockOnListingClick}
        onLandmarkClick={mockOnLandmarkClick}
        listings={mockListings}
      />
    );
    
    // Fixed: The container correctly remains mounted in the DOM
    expect(container.firstChild).toBeInTheDocument();
  });
});
