import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("✂️ Pruning database to enforce 1 category per listing...");
  
  const listings = await prisma.listing.findMany({
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  console.log(`📦 Processing ${listings.length} listings...`);

  let prunedCount = 0;
  for (const listing of listings) {
    // If it has multiple categories, keep only the first one
    if (listing.category.length > 1 || listing.categories.length > 1) {
      const primaryCategoryName = listing.category[0] || (listing.categories[0]?.category?.name) || null;
      
      if (primaryCategoryName) {
        // 1. Update the denormalized array to have only one
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            category: [primaryCategoryName]
          }
        });

        // 2. Remove all relational links except the first one (optional but cleaner)
        const categoriesToRemove = listing.categories.slice(1).map(c => c.id);
        if (categoriesToRemove.length > 0) {
          await prisma.listingCategory.deleteMany({
            where: {
              id: { in: categoriesToRemove }
            }
          });
        }
        prunedCount++;
      }
    }
  }

  console.log(`✅ Cleanup Complete! Pruned ${prunedCount} listings to have a single identity.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
