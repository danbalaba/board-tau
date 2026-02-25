
const fs = require('fs');
const path = require('path');

// Read the processed real listings file
const listingsPath = path.join(__dirname, 'processed-real-listings.json');
const listings = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));

// Replace expired Facebook images with valid Unsplash placeholders
const fixedListings = listings.map((listing, index) => {
  return {
    ...listing,
    images: listing.images.map((img, imgIndex) => {
      // Check if it's a Facebook image with expired signature
      if (img.url.includes('fbcdn.net') || img.url.includes('photo-1500000000')) {
        // Generate a valid Unsplash image URL
        const width = 800;
        const height = 600;
        const unsplashIds = [
          '1522708323590-d24dbb6b0267',
          '1502672260266-1c1ef2d93688',
          '1512917774080-9991f1c4c750',
          '1516259762381-22954d7d352d',
          '1522158637959-d24dbb6b0267',
          '1519167758481-83f550bb49b3',
          '1523217580768-40ac789329b7',
          '1518709268805-4e9042af2176',
          '1505691938895-1758d7feb511',
          '1512917774080-9991f1c4c750',
          '1505691938895-1758d7feb511',
          '1523217580768-40ac789329b7',
          '1519167758481-83f550bb49b3',
          '1518709268805-4e9042af2176',
          '1502672260266-1c1ef2d93688',
          '1522708323590-d24dbb6b0267',
          '1516259762381-22954d7d352d',
          '1522158637959-d24dbb6b0267',
          '1519167758481-83f550bb49b3',
          '1523217580768-40ac789329b7',
          '1518709268805-4e9042af2176',
          '1505691938895-1758d7feb511',
          '1512917774080-9991f1c4c750',
          '1505691938895-1758d7feb511',
          '1523217580768-40ac789329b7',
          '1519167758481-83f550bb49b3',
          '1518709268805-4e9042af2176',
          '1502672260266-1c1ef2d93688',
          '1522708323590-d24dbb6b0267',
          '1516259762381-22954d7d352d',
          '1522158637959-d24dbb6b0267',
          '1519167758481-83f550bb49b3'
        ];

        const randomId = unsplashIds[(index * 10 + imgIndex) % unsplashIds.length];
        const newUrl = `https://images.unsplash.com/photo-${randomId}?w=${width}&h=${height}&fit=crop&crop=entropy&auto=format`;
        console.log(`Replacing image: ${img.url} → ${newUrl}`);
        return { ...img, url: newUrl };
      }
      return img;
    })
  };
});

// Write the fixed data back to the file
fs.writeFileSync(listingsPath, JSON.stringify(fixedListings, null, 2));

console.log(`\n✅ Fixed ${fixedListings.length} listings with valid images`);
