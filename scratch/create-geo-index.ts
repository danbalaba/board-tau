import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const targetName = "Listing";
  const indexName = "location_2dsphere";
  
  console.log(`🧹 DROPPING PLACEHOLDER INDEX "${indexName}" ON "${targetName}"...`);
  try {
    await prisma.$runCommandRaw({
      dropIndexes: targetName,
      index: indexName
    });
  } catch (e) {
    console.log("⚠️ Index not found, proceeding to creation...");
  }

  console.log(`🛠️  UPGRADING TO 2DSPHERE INDEX ON "${targetName}"...`);
  const result = await prisma.$runCommandRaw({
    createIndexes: targetName,
    indexes: [
      {
        key: { location: "2dsphere" },
        name: indexName
      }
    ]
  });

  console.log("✅ UPGRADE RESULT:", JSON.stringify(result, null, 2));
  
  const sample = await prisma.listing.findFirst({
    where: { location: { not: null } }
  });
  console.log("📍 DATA SAMPLE (Checking Location Format):", JSON.stringify(sample?.location));
}

main()
  .catch((e) => {
    console.error("❌ FAILED TO CREATE INDEX:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
