import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🛠️ Attempting to create 2dsphere index on Listing.location...");
  
  try {
    const result = await prisma.$runCommandRaw({
      createIndexes: "Listing",
      indexes: [
        {
          key: { location: "2dsphere" },
          name: "location_2dsphere",
        },
      ],
    });
    
    console.log("✅ SUCCESS:", JSON.stringify(result, null, 2));
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      console.log("ℹ️ Index already exists, skipping.");
    } else {
      console.error("❌ FAILED:", err.message);
    }
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
