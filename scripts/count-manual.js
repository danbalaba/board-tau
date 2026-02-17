const fs = require('fs');

const rawText = fs.readFileSync('real-listing.json', 'utf8');

// Count the number of "title": occurrences
const titleMatches = rawText.match(/\"title\":/g);
console.log('Total title occurrences (potential listings):', titleMatches.length);

// Collect all unique normalized titles
const uniqueTitles = new Set();
const lines = rawText.split('\n');

let currentTitle = '';
lines.forEach(line => {
  if (line.includes('"title":')) {
    // Extract title
    const match = line.match(/"title":\s*"([^"]+)"/);
    if (match) {
      const title = match[1].trim().toLowerCase();
      uniqueTitles.add(title);
    }
  }
});

console.log('Unique normalized titles:', uniqueTitles.size);
console.log('\nUnique titles:');
Array.from(uniqueTitles).sort().forEach(title => console.log(`- ${title}`));
