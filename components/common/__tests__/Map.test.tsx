import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Map from '../Map';

// Mock Leaflet
const mockSetView = jest.fn().mockReturnThis();
const mockAddTo = jest.fn().mockReturnThis();
const mockOn = jest.fn().mockReturnThis();
const mockRemove = jest.fn().mockReturnThis();
const mockSetLatLng = jest.fn().mockReturnThis();
const mockGetContainer = jest.fn().mockReturnValue(document.createElement('div'));

const mockMapInstance = {
  setView: mockSetView,
  on: mockOn,
  off: jest.fn().mockReturnThis(),
  remove: mockRemove,
  getContainer: mockGetContainer,
};

const mockMarkerInstance = {
  addTo: mockAddTo,
  setLatLng: mockSetLatLng,
};

jest.mock('leaflet', () => ({
  __esModule: true,
  default: {
    map: jest.fn(() => mockMapInstance),
    tileLayer: jest.fn(() => ({ addTo: mockAddTo })),
    marker: jest.fn(() => mockMarkerInstance),
    Icon: jest.fn(() => ({})),
    divIcon: jest.fn(() => ({})),
    layerGroup: jest.fn(() => ({ 
      addTo: mockAddTo, 
      clearLayers: jest.fn(),
      remove: jest.fn()
    })),
    circle: jest.fn(() => ({ 
      addTo: mockAddTo,
      remove: jest.fn()
    })),
  },
}));

describe('Map', () => {
  const L = require('leaflet').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing and initializes map', () => {
    render(<Map />);
    
    expect(L.map).toHaveBeenCalled();
    expect(L.tileLayer).toHaveBeenCalled();
    expect(L.marker).toHaveBeenCalled();
  });

  it('sets view with center prop', () => {
    render(<Map center={[15.0, 120.0]} />);
    
    expect(L.marker).toHaveBeenCalledWith([15.0, 120.0], expect.any(Object));
  });

  it('re-centers map when center prop changes', () => {
    const { rerender } = render(<Map center={[15.0, 120.0]} />);
    
    // Change center prop
    rerender(<Map center={[16.0, 121.0]} />);
    
    expect(mockSetView).toHaveBeenCalledWith([16.0, 121.0], 14);
    expect(mockSetLatLng).toHaveBeenCalledWith([16.0, 121.0]);
  });

  it('registers click event when not readonly', () => {
    const mockOnLocationSelect = jest.fn();
    const mockOnClick = jest.fn();
    
    render(<Map onLocationSelect={mockOnLocationSelect} onClick={mockOnClick} />);
    
    expect(mockOn).toHaveBeenCalledWith('click', expect.any(Function));
    
    // Simulate click
    const clickHandler = mockOn.mock.calls.find((call: any) => call[0] === 'click')[1];
    
    act(() => {
      clickHandler({ latlng: { lat: 10, lng: 20 } });
    });
    
    expect(mockSetLatLng).toHaveBeenCalledWith({ lat: 10, lng: 20 });
    expect(mockOnLocationSelect).toHaveBeenCalledWith(10, 20);
    expect(mockOnClick).toHaveBeenCalledWith(10, 20);
  });

  it('does not register click event when readonly', () => {
    render(<Map readonly />);
    
    expect(mockOn).not.toHaveBeenCalled();
  });

  it('handles recenter button click', () => {
    render(<Map center={[15.0, 120.0]} />);
    
    const recenterBtn = screen.getByRole('button', { name: /recenter/i });
    fireEvent.click(recenterBtn);
    
    // The second time setView is called is when the button is clicked
    expect(mockSetView).toHaveBeenCalledWith([15.0, 120.0], 14, { animate: true });
  });

  it('cleans up map on unmount', () => {
    const { unmount } = render(<Map />);
    
    unmount();
    
    expect(mockRemove).toHaveBeenCalled();
  });
});
