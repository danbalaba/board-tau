const fs = require('fs');

// Read processed real listings
const processedListings = JSON.parse(fs.readFileSync('processed-real-listings.json', 'utf8'));

// Remove duplicate listings based on title (case-insensitive and trim whitespace)
const uniqueListings = [];
const seenTitles = new Set();

processedListings.forEach(listing => {
    const normalizedTitle = listing.title.trim().toLowerCase();
    if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueListings.push(listing);
    }
});

console.log(`Removed ${processedListings.length - uniqueListings.length} duplicate listings`);
console.log(`Remaining unique listings: ${uniqueListings.length}`);

// Write unique listings to new file
fs.writeFileSync('unique-real-listings.json', JSON.stringify(uniqueListings, null, 2));
console.log('Unique listings saved to unique-real-listings.json');

// Generate TypeScript format
const tsContent = `export const baseListings = ${JSON.stringify(uniqueListings, null, 2)} as const;`;
fs.writeFileSync('unique-seed-listings.txt', tsContent);
console.log('TypeScript format saved to unique-seed-listings.txt');
