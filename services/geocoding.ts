export interface AddressInfo {
  address: string;
  city: string;
  province: string;
  zipCode: string;
  coordinates: [number, number];
}

const TOWN_COORDINATES: Record<string, [number, number]> = {
  paniqui: [15.6661, 120.5814],
  camiling: [15.6980, 120.4285],
  gerona: [15.6053, 120.5986],
  moncada: [15.7342, 120.5881],
  capas: [15.3347, 120.5908],
  concepcion: [15.3242, 120.6558],
  victoria: [15.5767, 120.6806],
  'tarlac city': [15.4802, 120.5979],
  tarlac: [15.4802, 120.5979],
  bamban: [15.2811, 120.5694],
  'santa ignacia': [15.6147, 120.4358],
  'san jose': [15.4678, 120.4708],
  'san manuel': [15.8272, 120.6125],
  pula: [15.6352, 120.4153],
  tau: [15.6352, 120.4153],
};

const getTownFallbackCoords = (query: string): [number, number] => {
  const lower = query.toLowerCase();
  for (const [town, coords] of Object.entries(TOWN_COORDINATES)) {
    if (lower.includes(town)) {
      return coords;
    }
  }
  return [15.635189, 120.415343]; // Default TAU Camiling
};

// Geocoding service with multi-level query fallback & town dictionary lookup
export const geocodeAddress = async (address: string): Promise<AddressInfo | null> => {
  if (!address || !address.trim()) return null;

  const tryFetchNominatim = async (queryStr: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&limit=1&addressdetails=1`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': 'BoardTAU/1.0' }
        }
      );
      clearTimeout(timeout);
      if (!response.ok) return null;
      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  };

  try {
    // 1. Try exact address string query
    let result = await tryFetchNominatim(address);

    // 2. If no result and address contains commas, try simplified query (e.g. "Paniqui, Tarlac, Philippines")
    if (!result && address.includes(',')) {
      const parts = address.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 2) {
        const simplified = parts.slice(-3).join(', ');
        result = await tryFetchNominatim(simplified);
      }
      if (!result && parts.length > 1) {
        const townProvince = parts.slice(-2).join(', ');
        result = await tryFetchNominatim(townProvince);
      }
    }

    if (result) {
      const addressParts = parseAddress(result.display_name, result.address);
      return {
        address: result.display_name,
        city: addressParts.city || '',
        province: addressParts.province || '',
        zipCode: addressParts.zipCode || '',
        coordinates: [parseFloat(result.lat), parseFloat(result.lon)]
      };
    }

    // 3. Fallback to town lookup dictionary if nominatim returned empty
    const fallbackCoords = getTownFallbackCoords(address);
    return {
      address: address,
      city: 'Tarlac',
      province: 'Tarlac',
      zipCode: '2300',
      coordinates: fallbackCoords
    };

  } catch (error) {
    console.error('Geocoding error:', error);
    const fallbackCoords = getTownFallbackCoords(address);
    return {
      address: address,
      city: 'Tarlac',
      province: 'Tarlac',
      zipCode: '2300',
      coordinates: fallbackCoords
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
