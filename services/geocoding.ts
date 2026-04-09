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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
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

    // Parse address components - now with structured address details from API
    const addressParts = parseAddress(result.display_name, result.address);

    return {
      address: result.display_name,
      city: addressParts.city || '',
      province: addressParts.province || '',
      zipCode: addressParts.zipCode || '',
      coordinates: [parseFloat(result.lat), parseFloat(result.lon)]
    };
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

// Reverse geocoding (coordinates to address) - Bulletproof Version
export const reverseGeocode = async (lat: number, lng: number): Promise<AddressInfo | null> => {
  // Defensive return for invalid coordinates
  if (!lat || !lng) return null;

  try {
    // 1. Check for Tarlac Agricultural University Proximity (Local Logic)
    const tauLat = 15.635189;
    const tauLng = 120.415343;
    const proximityThreshold = 0.002;
    const distance = Math.sqrt(Math.pow(lat - tauLat, 2) + Math.pow(lng - tauLng, 2));

    if (distance < proximityThreshold) {
      return {
        address: 'Tarlac Agricultural University, San Isidro, Tarlac City, Tarlac',
        city: 'Tarlac City',
        province: 'Tarlac',
        zipCode: '2300',
        coordinates: [lat, lng]
      };
    }

    // 2. Attempt Network Lookup (Defensively)
    let response;
    try {
      response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: { 'User-Agent': 'BoardTAU-Dashboard-V2' }
        }
      );
    } catch (networkError) {
      console.warn('Network blocked or offline, using local fallback:', networkError);
      return {
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}, Tarlac City, Tarlac`,
        city: 'Tarlac City',
        province: 'Tarlac',
        zipCode: '2300',
        coordinates: [lat, lng]
      };
    }

    if (!response || !response.ok) {
      throw new Error('API server unreachable');
    }

    const data = await response.json();
    if (!data || !data.address) return null;

    const addressParts = parseAddress(data.display_name, data.address);

    return {
      address: data.display_name || 'Selected Location',
      city: addressParts.city || 'Tarlac City',
      province: addressParts.province || 'Tarlac',
      zipCode: addressParts.zipCode || '2300',
      coordinates: [lat, lng]
    };

  } catch (error) {
    // Catch-all prevents any Turbopack/Next.js crash screen
    console.error('Handled Geocoding Exception:', error);
    return {
      address: `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
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
    console.log('Parsing address with components:', addressComponents); // Debug log
    const city = addressComponents.city || addressComponents.town || addressComponents.municipality || '';
    let province = addressComponents.province || addressComponents.county || addressComponents.state || addressComponents.region || '';
    let zipCode = addressComponents.postcode || '';
    
    // Special handling for Philippine addresses
    if (province === 'Central Luzon') {
      // For Tarlac addresses, Nominatim returns province as Central Luzon - we need to set it to Tarlac
      if (addressComponents.county === 'Tarlac') {
        province = 'Tarlac';
      }
    } else if (province === 'Central Visayas') {
      // For Cebu addresses, try to extract province from city or other components
      if (city === 'Cebu City') {
        province = 'Cebu';
      }
    } else if (!province || province === 'Metro Manila') {
      // For Metro Manila addresses, province remains Metro Manila
    }
    
    // Special zip code fix for Anao, Tarlac - Nominatim returns 2309 but actual is 2310
    if (displayName.toLowerCase().includes('anao') && displayName.toLowerCase().includes('tarlac') && zipCode === '2309') {
      zipCode = '2310';
    }
    
    // Fallback to extract zip code from display name if not available from API
    if (!zipCode) {
      const zipMatch = displayName.match(/\b\d{4,5}\b/);
      if (zipMatch) {
        zipCode = zipMatch[0];
      }
    }
    
    return { city, province, zipCode };
  }

  // Fallback to parsing display name for Tarlac area addresses
  const parts = displayName.split(',').map(part => part.trim());

  // For Philippine addresses
  const city = parts.find(part => 
    part.includes('City') || part.includes('Municipality') || part.includes('Tarlac')
  )?.trim() || '';

  const province = parts.find(part => 
    part.includes('Province') || part.includes('Tarlac') || 
    ['Pampanga', 'Nueva Ecija', 'Zambales', 'Pangasinan'].includes(part)
  )?.trim() || '';

  const zipCode = parts.find(part => /^\d{4,5}$/.test(part))?.trim() || '';

  // Improve city/province extraction for common Tarlac addresses
  if (!city && parts.some(part => part.includes('Tarlac'))) {
    const tarlacPart = parts.find(part => part.includes('Tarlac'));
    if (tarlacPart && tarlacPart.includes('City')) {
      return { city: 'Tarlac City', province: 'Tarlac', zipCode };
    }
    return { city: 'Tarlac City', province: 'Tarlac', zipCode };
  }

  return { city, province, zipCode };
};
