const fs = require('fs');
const path = require('path');

// Read and fix the JSON file
const rawData = fs.readFileSync(path.join(__dirname, '../real-listing.json'), 'utf8');

// Fix JSON by wrapping in array and adding commas between objects
let fixedData = rawData.trim();
fixedData = fixedData.replace(/}\s*{/g, '},{');
fixedData = `[${fixedData}]`;

// Write fixed JSON
fs.writeFileSync(path.join(__dirname, '../real-listing-fixed.json'), fixedData);

console.log('Successfully fixed JSON file');
console.log('Fixed file saved to real-listing-fixed.json');
