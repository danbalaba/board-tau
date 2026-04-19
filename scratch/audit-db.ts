import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 AUDITING LISTINGS...");

  const total = await prisma.listing.count();
  const activeCount = await prisma.listing.count({ where: { status: "active" } });
  const pendingCount = await prisma.listing.count({ where: { status: "pending" } });

  console.log(`📊 TOTAL LISTINGS: ${total}`);
  console.log(`✅ ACTIVE: ${activeCount}`);
  console.log(`⏳ PENDING: ${pendingCount}`);

  // Look for some original titles
  const originalTitles = [
    "Will Mamardlo Apartment",
    "Good Shepherd Subdivision",
    "De Jesus Lourdes",
    "Jeck Pablo",
    "Estrella Lacaden Facunla"
  ];

  console.log("\n🔎 CHECKING FOR ORIGINAL ENTRIES...");
  for (const title of originalTitles) {
    const found = await prisma.listing.findFirst({
      where: { title: { contains: title, mode: 'insensitive' } }
    });
    
    if (found) {
      console.log(`✅ FOUND: "${found.title}" | Status: ${found.status} | CreatedAt: ${found.createdAt}`);
    } else {
      console.log(`❌ MISSING: "${title}"`);
    }
  }

  // Check the most recent listings to see why they might be overshadowing
  const latest = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log("\n🔝 TOP 5 MOST RECENT LISTINGS:");
  latest.forEach(l => console.log(`- ${l.title} (Score/Rating: ${l.rating})`));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
