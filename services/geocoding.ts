export interface AddressInfo {
  address: string;
  city: string;
  province: string;
  zipCode: string;
  coordinates: [number, number];
}

// Simple geocoding service with local fallback
export const geocodeAddress = async (address: string): Promise<AddressInfo | null> => {
  try {
    // Skip external API call for now, return local fallback immediately
    // This is for development and testing purposes when external API is not reachable

    console.log('Geocoding address locally:', address);

    // Local fallback for all addresses
    return {
      address: address,
      city: 'Tarlac City',
      province: 'Tarlac',
      zipCode: '2300',
      coordinates: [15.635189, 120.415343]
    };

    /*
    // Uncomment this section when external API is reachable
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BoardTAU/1.0'
        }
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      return null;
    }

    const result = data[0];

    // Parse address components
    const addressParts = parseAddress(result.display_name);

    return {
      address: result.display_name,
      city: addressParts.city || '',
      province: addressParts.province || '',
      zipCode: addressParts.zipCode || '',
      coordinates: [parseFloat(result.lat), parseFloat(result.lon)]
    };
    */
  } catch (error) {
    console.error('Geocoding error:', error);

    // Local fallback for development and testing
    return {
      address: address,
      city: 'Tarlac City',
      province: 'Tarlac',
      zipCode: '2300',
      coordinates: [15.635189, 120.415343]
    };
  }
};

// Reverse geocoding (coordinates to address)
export const reverseGeocode = async (lat: number, lng: number): Promise<AddressInfo | null> => {
  try {
    // Check if coordinates are near Tarlac Agricultural University
    const tauLat = 15.635189;
    const tauLng = 120.415343;
    const proximityThreshold = 0.002; // Approximately 200 meters

    const distance = Math.sqrt(
      Math.pow(lat - tauLat, 2) + Math.pow(lng - tauLng, 2)
    );

    // If near TAU, return TAU-specific address
    if (distance < proximityThreshold) {
      return {
        address: 'Tarlac Agricultural University, San Isidro, Tarlac City, Tarlac',
        city: 'Tarlac City',
        province: 'Tarlac',
        zipCode: '2300',
        coordinates: [lat, lng]
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BoardTAU/1.0'
        }
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.address) {
      return null;
    }

    const addressParts = parseAddress(data.display_name, data.address);

    return {
      address: data.display_name,
      city: addressParts.city || '',
      province: addressParts.province || '',
      zipCode: addressParts.zipCode || '',
      coordinates: [lat, lng]
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);

    // Return mock data for testing purposes
    return {
      address: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      city: 'Tarlac City',
      province: 'Tarlac',
      zipCode: '2300',
      coordinates: [lat, lng]
    };
  }
};

// Helper to parse address components
const parseAddress = (displayName: string, addressComponents?: any): { city: string; province: string; zipCode: string } => {
  // Try to extract address components from Nominatim's structured address if available
  if (addressComponents) {
    const city = addressComponents.city || addressComponents.town || addressComponents.municipality || '';
    const province = addressComponents.state || addressComponents.province || '';
    const zipCode = addressComponents.postcode || '';
    return { city, province, zipCode };
  }

  // Fallback to parsing display name for Tarlac area addresses
  const parts = displayName.split(',').map(part => part.trim());

  // For Tarlac specific addresses
  const city = parts.find(part =>
    part.includes('Tarlac') || part.includes('City') || part.includes('Municipality')
  )?.trim() || '';

  const province = parts.find(part => part.includes('Tarlac'))?.trim() || '';

  const zipCode = parts.find(part => /^\d{4,5}$/.test(part))?.trim() || '';

  return { city, province, zipCode };
};
