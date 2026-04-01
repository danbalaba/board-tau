import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- BoardTAU Database Diagnostic ---');
  
  // 1. Total Users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      email: true,
      createdAt: true,
      lastLogin: true,
      isVerifiedLandlord: true,
      deletedAt: true
    }
  });
  
  console.log(`\nTotal Users in DB: ${allUsers.length}`);
  
  // List all users for inspection
  allUsers.forEach((u, i) => {
    console.log(`User ${i+1}: Email: ${u.email}, Role: ${u.role}, CreatedAt: ${u.createdAt}, LastLogin: ${u.lastLogin}, Deleted: ${u.deletedAt}`);
  });

  // 2. Role Distribution (Raw)
  const roleGroups = allUsers.reduce((acc: any, u) => {
    const r = u.role || 'NONE';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});
  console.log('\nRole Distribution (Raw):', roleGroups);
  
  // 3. User Locations from Listings (Where hosts actually operate)
  const listings = await prisma.listing.findMany({
    select: { region: true }
  });
  const regions = listings.reduce((acc: any, l) => {
    const r = l.region || 'UNKNOWN';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});
  console.log('\nActual Locations Found:', regions);
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
