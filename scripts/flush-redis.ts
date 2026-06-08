import { cache } from "../lib/redis";

async function main() {
  console.log("🌪️  FLUSHING REDIS CACHE...");

  try {
    const success = await cache.flush();
    if (success) {
      console.log("✅ SUCCESS: All search and listing caches have been cleared.");
      console.log("🏠 The Home Page will now fetch the latest images from the database.");
    } else {
      console.error("❌ FAILED: Could not flush Redis. Check your connection.");
    }
  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    process.exit(0);
  }
}

main();
