const fs = require('fs');

function fixAndProcessListings() {
    console.log('Processing real-listing.json...');

    const rawContent = fs.readFileSync('real-listing.json', 'utf8');

    // Step 1: Fix JSON format - wrap in array and add commas
    let jsonText = rawContent.trim();

    // Replace all }, followed by { with },{
    jsonText = jsonText.replace(/\}\s*\{/g, '},{');

    // Wrap in array
    jsonText = `[${jsonText}]`;

    try {
        const data = JSON.parse(jsonText);
        console.log(`Successfully parsed ${data.length} listings`);

        // Step 2: Process and normalize listings
        const processedListings = [];
        const uniqueTitles = new Set();

        data.forEach((listing, index) => {
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

            // Fix room type
            let roomType = listing.roomType || 'Bed Spacer';
            roomType = roomType.trim().toLowerCase();
            if (roomType === 'bed space') {
                roomType = 'Bed Spacer';
            } else if (roomType === 'solo/bed spacer' || roomType === 'solo or bed spacer') {
                roomType = 'Bed Spacer'; // Default to bed spacer for combined types
            } else if (roomType === 'solo') {
                roomType = 'Solo';
            } else if (roomType === 'shared') {
                roomType = 'Shared';
            } else {
                // Default to bed spacer if unknown
                console.log(`Unknown room type: ${listing.roomType} for ${listing.title} - defaulting to Bed Spacer`);
                roomType = 'Bed Spacer';
            }

            // Fix amenities
            const amenities = (listing.amenities || []).map(amenity => {
                let fixed = amenity.trim().toLowerCase();
                if (fixed.includes('comport')) {
                    return 'Own CR';
                } else if (fixed.includes('free water')) {
                    return 'Water supply (24/7)';
                } else if (fixed.includes('aircon') || fixed.includes('air conditioning')) {
                    return 'Air Conditioning';
                } else if (fixed.includes('parking')) {
                    return 'Parking';
                } else if (fixed.includes('table') && fixed.includes('chair')) {
                    return 'Study Area / Quiet Room';
                } else if (fixed.includes('curfew')) {
                    return 'Curfew Enforced';
                } else if (fixed.includes('mini balcony') || fixed.includes('balcony')) {
                    return 'Balcony';
                } else if (fixed.includes('own bathroom')) {
                    return 'Own CR';
                } else if (fixed.includes('private cr')) {
                    return 'Own CR';
                } else if (fixed.includes('shared cr')) {
                    return 'Shared CR';
                } else if (fixed.includes('laundry')) {
                    return 'Laundry Area';
                } else if (fixed.includes('kitchen')) {
                    return 'Kitchen Access';
                } else if (fixed.includes('wifi')) {
                    return 'WiFi';
                } else if (fixed.includes('cctv')) {
                    return 'CCTV';
                } else if (fixed.includes('gate') || fixed.includes('secure') || fixed.includes('gated')) {
                    return 'Gated / Secure';
                }
                return amenity.trim();
            }).filter(amenity => amenity.length > 0);

            // Ensure price is a number
            let price = parseInt(listing.price);
            if (isNaN(price) || price <= 0) {
                // Handle ranges like "1800 - 3500"
                if (typeof listing.price === 'string') {
                    const match = listing.price.match(/(\d+)/);
                    if (match) {
                        price = parseInt(match[1]);
                    } else {
                        price = 3000; // Default price
                    }
                } else {
                    price = 3000;
                }
            }

            // Generate realistic coordinates near TAU
            const tauCoords = { lat: 15.635189, lng: 120.415343 };
            const offset = 0.01; // ~1km radius
            const latOffset = (Math.random() - 0.5) * offset * 2;
            const lngOffset = (Math.random() - 0.5) * offset * 2;

            processedListings.push({
                title: listing.title.trim(),
                description: listing.description ? listing.description.trim() : 'Affordable boarding house near TAU campus.',
                price: price,
                roomType: roomType,
                location: listing.location ? listing.location.trim() : 'Malacampa, Camiling, Tarlac',
                amenities: amenities,
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
                          price < 2000 ? 'Budget Boarding House' : 'Student-Friendly',
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

        console.log(`Processed ${processedListings.length} unique listings`);

        // Step 3: Save processed data
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

        console.log('\n=== Summary ===');
        console.log(`Total listings: ${data.length}`);
        console.log(`Unique listings: ${processedListings.length}`);
        console.log(`Duplicates removed: ${data.length - processedListings.length}`);

        return processedListings;

    } catch (error) {
        console.error('JSON Parse Error:', error);
        console.log('Attempted JSON:', jsonText);
        return null;
    }
}

if (require.main === module) {
    fixAndProcessListings();
}

module.exports = fixAndProcessListings;
