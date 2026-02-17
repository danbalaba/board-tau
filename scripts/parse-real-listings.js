const fs = require('fs');
const path = require('path');

// Read raw data and split into individual listings
const rawData = fs.readFileSync(path.join(__dirname, '../real-listing.json'), 'utf8');
const listings = [];

// Split on },{ to get individual objects
let temp = rawData.trim();
temp = temp.replace(/^\s*\{/, '{').replace(/\}\s*$/, '}');

const rawListings = temp.split(/\}\s*\{/).map((str, index) => {
  if (index === 0) {
    return str + '}';
  } else if (index === temp.split(/\}\s*\{/).length - 1) {
    return '{' + str;
  }
  return '{' + str + '}';
});

// Parse each listing with error recovery
console.log(`Found ${rawListings.length} potential listings`);

rawListings.forEach((rawListing, index) => {
  try {
    const listing = JSON.parse(rawListing);
    listings.push(listing);
    console.log(`Successfully parsed listing ${index + 1}: ${listing.title || 'Untitled'}`);
  } catch (error) {
    console.warn(`Failed to parse listing ${index + 1}:`, error.message);
    // Try to fix common JSON errors
    let fixed = rawListing;

    // Fix missing trailing commas in arrays
    fixed = fixed.replace(/\["([^"]+)"\]\s*(\w+)/g, '["$1"],$2');
    fixed = fixed.replace(/,"([^"]+)"\s*]/g, ',"$1"]');

    try {
      const listing = JSON.parse(fixed);
      listings.push(listing);
      console.log(`Successfully parsed listing ${index + 1} after fixing: ${listing.title || 'Untitled'}`);
    } catch (fixError) {
      console.error(`Failed to parse listing ${index + 1} even after fixing:`, fixError.message);
    }
  }
});

// Process listings
const normalizeRoomType = (roomType) => {
  if (!roomType) return 'Bed Spacer';
  const normalized = roomType.trim().toLowerCase();
  if (normalized.includes('bed space') || normalized.includes('bed spacer')) return 'Bed Spacer';
  if (normalized.includes('solo')) return 'Solo';
  if (normalized.includes('shared')) return 'Shared';
  return 'Bed Spacer';
};

const normalizeAmenities = (amenities) => {
  if (!amenities) return [];
  return amenities.map(amenity => {
    const normalized = amenity.trim().toLowerCase();
    if (normalized.includes('wifi')) return 'WiFi';
    if (normalized.includes('own cr') || normalized.includes('own bathroom')) return 'Own CR';
    if (normalized.includes('shared cr') || normalized.includes('shared bathroom')) return 'Shared CR';
    if (normalized.includes('kitchen')) return 'Kitchen Access';
    if (normalized.includes('laundry')) return 'Laundry Area';
    if (normalized.includes('aircon') || normalized.includes('air conditioning')) return 'Air Conditioning';
    if (normalized.includes('parking')) return 'Parking';
    if (normalized.includes('curfew')) return 'Curfew Enforced';
    if (normalized.includes('cctv')) return 'CCTV';
    if (normalized.includes('table') || normalized.includes('desk')) return 'Study Area / Quiet Room';
    if (normalized.includes('water')) return 'Water supply (24/7)';
    if (normalized.includes('electricity')) return 'Electricity included';
    if (normalized.includes('secure') || normalized.includes('gated')) return 'Gated / Secure';
    return null;
  }).filter(Boolean);
};

const assignCategory = (listing) => {
  const desc = (listing.description || '').toLowerCase();
  const title = (listing.title || '').toLowerCase();

  if (desc.includes('female') || title.includes('female') || desc.includes('girls only')) {
    return 'Female-Only';
  }
  if (desc.includes('male') || title.includes('male') || desc.includes('boys only')) {
    return 'Male-Only';
  }
  if (desc.includes('family') || title.includes('family')) {
    return 'Family / Visitor Friendly';
  }
  if (listing.price && listing.price <= 2000) {
    return 'Budget Boarding House';
  }
  if (listing.price && listing.price >= 5000) {
    return 'Private Boarding House';
  }
  return 'Student-Friendly';
};

// Process each listing
const structuredListings = listings.map((listing, index) => {
  const roomType = normalizeRoomType(listing.roomType);
  const amenities = normalizeAmenities(listing.amenities);

  const baseLat = 15.63518934952113;
  const baseLng = 120.41534319307087;
  const latOffset = (Math.random() - 0.5) * 0.01;
  const lngOffset = (Math.random() - 0.5) * 0.01;

  return {
    title: listing.title?.trim() || `Untitled Listing ${index + 1}`,
    description: listing.description?.trim() || 'Affordable boarding house near TAU campus.',
    imageSrc: listing.images?.[0]?.url?.trim(),
    category: assignCategory(listing),
    roomCount: Math.floor(Math.random() * 5) + 3,
    roomType: roomType,
    bedType: roomType === 'Solo' ? 'Single Bed' : 'Single Bed (Shared Room)',
    bathroomCount: Math.floor(Math.random() * 3) + 1,
    guestCount: roomType === 'Solo' ? 1 : Math.floor(Math.random() * 2) + 2,
    price: listing.price || Math.floor(Math.random() * 3000) + 1500,
    country: 'Philippines',
    region: 'Tarlac',
    amenities: amenities,
    rating: Math.floor(Math.random() * 20) / 10 + 3.5,
    reviewCount: Math.floor(Math.random() * 10) + 1,
    coords: {
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset
    },
    femaleOnly: assignCategory(listing) === 'Female-Only',
    maleOnly: assignCategory(listing) === 'Male-Only',
    visitorsAllowed: !listing.description?.toLowerCase().includes('no visitors'),
    petsAllowed: listing.amenities?.some(amenity =>
      amenity?.toLowerCase().includes('pet')
    ),
    smokingAllowed: listing.amenities?.some(amenity =>
      amenity?.toLowerCase().includes('smoke') || amenity?.toLowerCase().includes('smoking')
    ),
    security24h: listing.amenities?.some(amenity =>
      amenity?.toLowerCase().includes('24/7') || amenity?.toLowerCase().includes('security')
    ),
    cctv: listing.amenities?.some(amenity =>
      amenity?.toLowerCase().includes('cctv')
    ),
    fireSafety: false,
    nearTransport: false,
    studyFriendly: listing.amenities?.some(amenity =>
      amenity?.toLowerCase().includes('table') || amenity?.toLowerCase().includes('desk') ||
      amenity?.toLowerCase().includes('study')
    ),
    quietEnvironment: !listing.description?.toLowerCase().includes('lively') &&
                     !listing.description?.toLowerCase().includes('noisy'),
    flexibleLease: true,
    images: listing.images?.map((img, imgIndex) => ({
      url: img.url?.trim(),
      caption: img.caption || img.roomType || 'Room',
      roomType: img.roomType || 'Interior',
      order: imgIndex
    })) || []
  };
});

// Write processed data
fs.writeFileSync(
  path.join(__dirname, '../processed-real-listings.json'),
  JSON.stringify(structuredListings, null, 2)
);

console.log(`\nSuccessfully processed ${structuredListings.length} valid listings`);
console.log('Output saved to processed-real-listings.json');
