const fs = require('fs');

// Read the fixed JSON file
const data = JSON.parse(fs.readFileSync('real-listing-fixed.json', 'utf8'));

console.log('Total listings in real-listing-fixed.json:', data.length);

// Count unique listings by title
const uniqueTitles = new Set();
const uniqueListings = [];

data.forEach(listing => {
  const normalizedTitle = listing.title.trim().toLowerCase();
  if (!uniqueTitles.has(normalizedTitle)) {
    uniqueTitles.add(normalizedTitle);
    uniqueListings.push(listing);
  }
});

console.log('Unique listings:', uniqueListings.length);
console.log('Unique titles:');
uniqueTitles.forEach(title => console.log(`- ${title}`));
