
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listingsCount = await prisma.listing.count();
  const listingStatuses = await prisma.listing.groupBy({
    by: ['status'],
    _count: true
  });
  
  const hostCount = await prisma.hostApplication.count();
  const hostStatuses = await prisma.hostApplication.groupBy({
    by: ['status'],
    _count: true
  });

  const reviewCount = await prisma.review.count();
  const reviewStatuses = await prisma.review.groupBy({
    by: ['status'],
    _count: true
  });

  console.log('--- Listings ---');
  console.log('Total:', listingsCount);
  console.log('Statuses:', JSON.stringify(listingStatuses, null, 2));

  console.log('\n--- Host Applications ---');
  console.log('Total:', hostCount);
  console.log('Statuses:', JSON.stringify(hostStatuses, null, 2));

  console.log('\n--- Reviews ---');
  console.log('Total:', reviewCount);
  console.log('Statuses:', JSON.stringify(reviewStatuses, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
