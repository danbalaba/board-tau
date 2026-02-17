const fs = require('fs');

function extractListings() {
    const rawText = fs.readFileSync('real-listing.json', 'utf8');
    const listings = [];

    // Split by individual listing objects
    const listingMatches = rawText.split(/(?=\{(\s*"title":))/g).filter(match => match.trim().startsWith('{'));

    console.log(`Found ${listingMatches.length} potential listings`);

    listingMatches.forEach((rawListing, index) => {
        try {
            // Find the end of the listing
            let end = 0;
            let braceCount = 0;

            for (let i = 0; i < rawListing.length; i++) {
                if (rawListing[i] === '{') braceCount++;
                if (rawListing[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        end = i + 1;
                        break;
                    }
                }
            }

            const trimmed = rawListing.substring(0, end).trim();
            const parsed = JSON.parse(trimmed);

            // Basic validation
            if (parsed.title && parsed.price) {
                listings.push(parsed);
            }

        } catch (error) {
            console.log(`Error parsing listing ${index + 1}:`, error.message);
            // Skip to next listing
        }
    });

    console.log(`Successfully parsed ${listings.length} valid listings`);

    // Save valid listings
    fs.writeFileSync('valid-real-listings.json', JSON.stringify(listings, null, 2));
    console.log('Saved valid listings to valid-real-listings.json');

    // Count unique normalized titles
    const uniqueTitles = new Set();
    const uniqueListings = [];

    listings.forEach(listing => {
        const normalizedTitle = listing.title.trim().toLowerCase();
        if (!uniqueTitles.has(normalizedTitle)) {
            uniqueTitles.add(normalizedTitle);
            uniqueListings.push(listing);
        }
    });

    console.log(`Unique listings: ${uniqueListings.length}`);
    fs.writeFileSync('unique-real-listings.json', JSON.stringify(uniqueListings, null, 2));
    console.log('Saved unique listings to unique-real-listings.json');

    return uniqueListings;
}

if (require.main === module) {
    extractListings();
}

module.exports = extractListings;
