import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({ select: { id: true } });
  let updated = 0;
  for (const listing of listings) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: "active" },
    });
    updated++;
  }
  console.log(`✓ Updated ${updated} listings with status: "active"`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
