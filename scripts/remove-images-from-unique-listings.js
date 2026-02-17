const fs = require('fs');

// Read unique real listings with images
const uniqueListingsWithImages = JSON.parse(fs.readFileSync('unique-real-listings.json', 'utf8'));

// Remove images field from each listing
const uniqueListingsWithoutImages = uniqueListingsWithImages.map(listing => {
    const { images, ...rest } = listing;
    return rest;
});

console.log(`Removed images field from ${uniqueListingsWithoutImages.length} listings`);

// Write to new file
fs.writeFileSync('unique-real-listings-without-images.json', JSON.stringify(uniqueListingsWithoutImages, null, 2));

// Generate TypeScript format
const tsContent = `export const baseListings = ${JSON.stringify(uniqueListingsWithoutImages, null, 2)} as const;`;
fs.writeFileSync('unique-seed-listings-without-images.txt', tsContent);
console.log('Listings without images saved to unique-real-listings-without-images.json');
console.log('TypeScript format saved to unique-seed-listings-without-images.txt');
