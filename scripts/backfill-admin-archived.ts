import { db } from "../lib/db";

async function backfillAdminArchived() {
  console.log("Starting backfill for listing.isAdminArchived...");
  
  // Update all listings to ensure isAdminArchived is set to false if missing or null
  const result = await db.listing.updateMany({
    data: {
      isAdminArchived: false,
    } as any,
  });

  console.log(`Successfully updated ${result.count} listing documents in MongoDB with isAdminArchived: false.`);
}

backfillAdminArchived()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
