const fs = require('fs');

function processListings() {
    console.log('Processing valid listings...');

    const rawListings = JSON.parse(fs.readFileSync('valid-real-listings.json', 'utf8'));
    const processedListings = [];
    const uniqueTitles = new Set();

    // Helper function to normalize room type
    const normalizeRoomType = (roomType) => {
        if (!roomType) return 'Bed Spacer';
        const lower = roomType.toLowerCase().trim();

        if (lower.includes('bed space') || lower.includes('bed spacer')) {
            return 'Bed Spacer';
        } else if (lower.includes('solo')) {
            return 'Solo';
        } else if (lower.includes('shared')) {
            return 'Shared';
        }
        return 'Bed Spacer'; // Default
    };

    // Helper function to normalize amenities
    const normalizeAmenities = (amenities) => {
        if (!amenities || !Array.isArray(amenities)) return [];

        return amenities.map(amenity => {
            if (!amenity) return '';
            const lower = amenity.toLowerCase().trim();

            if (lower.includes('comport')) {
                return 'Own CR';
            } else if (lower.includes('free water')) {
                return 'Water supply (24/7)';
            } else if (lower.includes('aircon') || lower.includes('air conditioning')) {
                return 'Air Conditioning';
            } else if (lower.includes('parking')) {
                return 'Parking';
            } else if (lower.includes('table') && lower.includes('chair')) {
                return 'Study Area / Quiet Room';
            } else if (lower.includes('curfew')) {
                return 'Curfew Enforced';
            } else if (lower.includes('mini balcony') || lower.includes('balcony')) {
                return 'Balcony';
            } else if (lower.includes('own bathroom')) {
                return 'Own CR';
            } else if (lower.includes('private cr')) {
                return 'Own CR';
            } else if (lower.includes('shared cr')) {
                return 'Shared CR';
            } else if (lower.includes('laundry')) {
                return 'Laundry Area';
            } else if (lower.includes('kitchen')) {
                return 'Kitchen Access';
            } else if (lower.includes('wifi')) {
                return 'WiFi';
            } else if (lower.includes('cctv')) {
                return 'CCTV';
            } else if (lower.includes('gate') || lower.includes('secure') || lower.includes('gated')) {
                return 'Gated / Secure';
            }
            return amenity.trim();
        }).filter(amenity => amenity.length > 0);
    };

    // Helper function to normalize price
    const normalizePrice = (price) => {
        if (typeof price === 'number') {
            return price;
        } else if (typeof price === 'string') {
            // Handle ranges like "1800 - 3500"
            const match = price.match(/(\d+)/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        return 3000; // Default price
    };

    // Process each listing
    rawListings.forEach((listing, index) => {
        // Skip if no title or invalid data
        if (!listing.title) {
            console.log(`Skipping listing ${index + 1} - no title`);
            return;
        }

        // Normalize title
        const normalizedTitle = listing.title.trim().toLowerCase();

        // Skip duplicates
        if (uniqueTitles.has(normalizedTitle)) {
            console.log(`Skipping duplicate listing: ${listing.title}`);
            return;
        }

        uniqueTitles.add(normalizedTitle);

        // Generate realistic coordinates near TAU
        const tauCoords = { lat: 15.635189, lng: 120.415343 };
        const offset = 0.01; // ~1km radius
        const latOffset = (Math.random() - 0.5) * offset * 2;
        const lngOffset = (Math.random() - 0.5) * offset * 2;

        // Process room type
        const roomType = normalizeRoomType(listing.roomType);
        const processedPrice = normalizePrice(listing.price);

        processedListings.push({
            title: listing.title.trim(),
            description: listing.description ? listing.description.trim() : 'Affordable boarding house near TAU campus.',
            price: processedPrice,
            roomType: roomType,
            location: listing.location ? listing.location.trim() : 'Malacampa, Camiling, Tarlac',
            amenities: normalizeAmenities(listing.amenities),
            images: (listing.images || []).map(img => ({
                url: img.url ? img.url.trim() : '',
                roomType: img.roomType || 'Unknown',
                caption: img.caption || ''
            })).filter(img => img.url && img.url.startsWith('https://')),
            coords: {
                lat: tauCoords.lat + latOffset,
                lng: tauCoords.lng + lngOffset
            },
            rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 - 5.0
            reviewCount: Math.floor(Math.random() * 10) + 1,
            roomCount: Math.floor(Math.random() * 5) + 3,
            bathroomCount: Math.floor(Math.random() * 3) + 1,
            guestCount: roomType === 'Solo' ? 1 : Math.floor(Math.random() * 2) + 2,
            bedType: roomType === 'Solo' ? 'Single Bed' : 'Single Bed (Shared Room)',
            category: roomType === 'Solo' ? 'Private Boarding House' :
                      (processedPrice < 2000 ? 'Budget Boarding House' : 'Student-Friendly'),
            femaleOnly: listing.title.toLowerCase().includes('girls only') ||
                       listing.title.toLowerCase().includes('female only'),
            maleOnly: listing.title.toLowerCase().includes('boys only') ||
                     listing.title.toLowerCase().includes('male only'),
            visitorsAllowed: !listing.title.toLowerCase().includes('no visitors'),
            petsAllowed: listing.title.toLowerCase().includes('pet friendly') ||
                       listing.amenities?.some(a => a.toLowerCase().includes('pet')),
            smokingAllowed: listing.title.toLowerCase().includes('smoking allowed'),
            security24h: listing.amenities?.some(a => a.toLowerCase().includes('24/7') || a.toLowerCase().includes('24h')),
            cctv: listing.amenities?.some(a => a.toLowerCase().includes('cctv')),
            fireSafety: false, // Default
            nearTransport: true, // Default
            studyFriendly: true, // Default for student housing
            quietEnvironment: true, // Default
            flexibleLease: true // Default
        });
    });

    console.log(`Processed ${processedListings.length} unique valid listings`);

    // Save processed data
    fs.writeFileSync('processed-real-listings.json', JSON.stringify(processedListings, null, 2));
    console.log('Saved to processed-real-listings.json');

    // Create version without images for seed file
    const listingsWithoutImages = processedListings.map(listing => {
        const { images, ...rest } = listing;
        return {
            ...rest,
            imageSrc: listing.images[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
        };
    });

    fs.writeFileSync('processed-real-listings-no-images.json', JSON.stringify(listingsWithoutImages, null, 2));
    console.log('Saved to processed-real-listings-no-images.json');

    return processedListings;
}

if (require.main === module) {
    processListings();
}

module.exports = processListings;
