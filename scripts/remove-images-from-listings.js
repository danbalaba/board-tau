const fs = require('fs');

const seedFile = fs.readFileSync('prisma/seed-enhanced-v2.ts', 'utf8');
const baseListingsMatch = seedFile.match(/const baseListings = \[([\s\S]*?)\];/);

if (!baseListingsMatch) {
    console.error('❌ Could not find baseListings array');
    process.exit(1);
}

let baseListingsContent = baseListingsMatch[1];

// Remove images field from each listing object
baseListingsContent = baseListingsContent.replace(/,\s*images:\s*\[([\s\S]*?)\]/g, '');

const newSeedFile = seedFile.replace(/const baseListings = \[([\s\S]*?)\];/, `const baseListings = [${baseListingsContent}];`);

fs.writeFileSync('prisma/seed-enhanced-v2.ts', newSeedFile);

console.log('✅ Successfully removed images field from baseListings');
