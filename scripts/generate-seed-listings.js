const fs = require('fs');
const path = require('path');

const processedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../processed-real-listings.json'), 'utf8'));

// Convert JSON to TypeScript array
const tsData = `// Real listings from Facebook data (TAU area)
const baseListings = ${JSON.stringify(processedData, null, 2).replace(/\"([^(\")"]+)\":/g, '$1:')};`;

fs.writeFileSync(path.join(__dirname, '../seed-listings.txt'), tsData);

console.log('Successfully generated TypeScript listings');
console.log('Output saved to seed-listings.txt');
