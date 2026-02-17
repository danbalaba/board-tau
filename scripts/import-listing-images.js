const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const realListings = JSON.parse(fs.readFileSync('processed-real-listings.json', 'utf8'));

async function importImages() {
    console.log('Importing listing images...');

    try {
        // Get all listings from database
        const listings = await prisma.listing.findMany({
            select: {
                id: true,
                title: true
            }
        });

        // Match listings by title and add images
        for (const realListing of realListings) {
            const dbListing = listings.find(listing =>
                listing.title.toLowerCase() === realListing.title.toLowerCase().trim()
            );

            if (dbListing && realListing.images && realListing.images.length > 0) {
                console.log(`Adding images to: ${realListing.title}`);

                // Delete existing images for this listing
                await prisma.listingImage.deleteMany({
                    where: {
                        listingId: dbListing.id
                    }
                });

                // Create new images
                const imagesData = realListing.images.map((img, index) => ({
                    listingId: dbListing.id,
                    url: img.url,
                    caption: img.caption || img.roomType,
                    roomType: img.roomType,
                    order: index
                })).filter(img => img.url && img.url.startsWith('https://'));

                await prisma.listingImage.createMany({
                    data: imagesData
                });

                console.log(`Added ${imagesData.length} images`);
            }
        }

        console.log('✅ All images imported successfully');
    } catch (error) {
        console.error('❌ Error importing images:', error);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    importImages();
}

module.exports = importImages;
