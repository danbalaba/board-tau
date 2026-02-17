const fs = require('fs');

// Read the raw file
const rawContent = fs.readFileSync('real-listing.json', 'utf8');

// Fix JSON format - it's multiple objects separated by newlines
const fixedContent = `[${rawContent.replace(/^\s*}\s*$^/gm, '},').trim().replace(/,$/, '')}]`;

try {
  const data = JSON.parse(fixedContent);

  console.log('Successfully parsed:', data.length, 'listings');

  // Fix room type formatting
  data.forEach(listing => {
    if (listing.roomType) {
      const fixedRoomType = listing.roomType.trim();
      if (fixedRoomType.toLowerCase() === 'bed space') {
        listing.roomType = 'Bed Spacer';
      }
    }

    // Normalize amenities
    if (listing.amenities) {
      listing.amenities = listing.amenities.map(amenity => {
        let fixed = amenity.trim();
        fixed = fixed.replace(/comport room/i, 'Own CR');
        fixed = fixed.replace(/free water/i, 'Water supply (24/7)');
        fixed = fixed.replace(/aircon/i, 'Air Conditioning');
        fixed = fixed.replace(/parking area/i, 'Parking');
        fixed = fixed.replace(/no curfew/i, '');
        fixed = fixed.replace(/mini balcony/i, 'Balcony');
        fixed = fixed.replace(/table and chairs/i, 'Study Area / Quiet Room');
        return fixed;
      }).filter(amenity => amenity);
    }
  });

  // Save fixed and normalized data
  fs.writeFileSync('real-listings-valid.json', JSON.stringify(data, null, 2));
  console.log('Saved valid JSON to real-listings-valid.json');

  // Count unique listings
  const uniqueTitles = new Set();
  const uniqueListings = [];

  data.forEach(listing => {
    const normalizedTitle = listing.title.trim().toLowerCase();
    if (!uniqueTitles.has(normalizedTitle)) {
      uniqueTitles.add(normalizedTitle);
      uniqueListings.push(listing);
    }
  });

  console.log('\nTotal listings:', data.length);
  console.log('Unique listings:', uniqueListings.length);
  console.log('Unique titles:');
  uniqueTitles.forEach(title => console.log(`- ${title}`));

  // Save unique listings
  fs.writeFileSync('real-listings-unique.json', JSON.stringify(uniqueListings, null, 2));
  console.log('\nSaved unique listings to real-listings-unique.json');

} catch (error) {
  console.error('Error parsing JSON:', error);
  console.error('Attempted fixed content:', fixedContent);
}
