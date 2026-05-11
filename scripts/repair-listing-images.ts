import fs from 'fs';
import path from 'path';

// Using confirmed stable and high-traffic Unsplash IDs that are less likely to 404
const IMAGE_MAP: Record<string, string[]> = {
  "Exterior": [
    "1501183638710-841dd1904471", // Modern House
    "1518780664697-55e3ad937233", // Cozy Cottage
    "1480074568708-e7b720bb3f09", // Nice suburban home
    "1513584684002-29f97395885d"  // Apartment building
  ],
  "Bedroom": [
    "1522771739844-6a9f6d5f14af", // Modern bedroom
    "1505691938895-1758d7feb511", // Cozy bed
    "1616489953149-8f6f69168b44", // Clean room
    "1540518614846-7eded433c457"  // Minimalist bedroom
  ],
  "Kitchen": [
    "1556911223-e1f8d14eb919", // Modern kitchen
    "1484154218962-a197022b5858", // Bright kitchen
    "1564013799919-ab600027ffc6"  // Luxury kitchen
  ],
  "CR": [
    "1552321554-5fefe8c9ef14", // Clean bathroom
    "1584622650111-993a426fbf0a", // Modern CR
    "1552321554-5fefe8c9ef14"  // Backup CR
  ],
  "Common Area": [
    "1524758631624-e2822e304c36", // Living room
    "1493663284031-b7e3aefcae8e", // Modern lounge
    "1512917774080-9991f1c4c750"  // Bright lobby
  ]
};

const JSON_PATH = path.join(process.cwd(), 'processed-real-listings.json');

async function repair() {
  console.log('🔍 Reading processed-real-listings.json...');
  const rawData = fs.readFileSync(JSON_PATH, 'utf-8');
  const listings = JSON.parse(rawData);

  console.log(`🚀 Repairing ${listings.length} listings with Ultra-Stable IDs...`);

  listings.forEach((listing: any, index: number) => {
    if (listing.images && Array.isArray(listing.images)) {
      listing.images.forEach((img: any, imgIndex: number) => {
        const type = img.roomType || "Common Area";
        const pool = IMAGE_MAP[type] || IMAGE_MAP["Common Area"];
        
        // Use a semi-deterministic choice based on listing and image index
        const id = pool[(index + imgIndex) % pool.length];
        
        // Simplified Unsplash URL for better compatibility
        img.url = `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`;
      });
    }
  });

  console.log('💾 Saving repaired JSON...');
  fs.writeFileSync(JSON_PATH, JSON.stringify(listings, null, 2));
  console.log('✅ REPAIR COMPLETE! Ready to re-seed.');
}

repair().catch(err => {
  console.error('❌ REPAIR FAILED:', err);
});
