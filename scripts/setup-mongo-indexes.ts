import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Connecting to database to establish TTL and Geospatial indexes...");
  
  // Create TTL index for AdminActivityLog (90 days = 7776000 seconds)
  await prisma.$runCommandRaw({
    createIndexes: "AdminActivityLog",
    indexes: [
      {
        key: { createdAt: 1 },
        name: "createdAt_ttl_90_days",
        expireAfterSeconds: 7776000
      }
    ]
  });
  console.log("✅ AdminActivityLog TTL index created (90 days).");

  // Create TTL index for Notification (30 days = 2592000 seconds)
  await prisma.$runCommandRaw({
    createIndexes: "Notification",
    indexes: [
      {
        key: { createdAt: 1 },
        name: "createdAt_ttl_30_days",
        expireAfterSeconds: 2592000
      }
    ]
  });
  console.log("✅ Notification TTL index created (30 days).");

  // Create Geospatial index for Listing location (Required for $near queries)
  try {
    await prisma.$runCommandRaw({
      createIndexes: "Listing",
      indexes: [
        {
          key: { location: "2dsphere" },
          name: "location_2dsphere_native"
        }
      ]
    });
    console.log("✅ Listing 2dsphere Geospatial index created.");
  } catch (err) {
    console.log("⚠️ Listing 2dsphere index might already exist or needs cleanup. Continuing...");
  }

}

main()
  .catch((e) => {
    console.error("❌ Error creating indexes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔒 Database connection closed.");
  });
