import { PrismaClient } from "@prisma/client";
import { decryptMessage, encryptMessage } from "../lib/encryption";

const db = new PrismaClient();

async function main() {
  console.log("🔄 Starting message re-encryption & cleanup script...");

  const messages = await db.message.findMany();
  console.log(`Found ${messages.length} total messages in the database.`);

  let reencryptedCount = 0;
  let deletedCount = 0;

  for (const msg of messages) {
    const decrypted = decryptMessage(msg.content);

    // If the message could not be decrypted by any known key candidate
    if (decrypted.includes("🔒 This message")) {
      console.log(`⚠️ Unreadable old test message found (ID: ${msg.id}). Removing stale test record...`);
      await db.message.delete({ where: { id: msg.id } });
      deletedCount++;
    } else {
      // Re-encrypt with current active .env MESSAGE_ENCRYPTION_KEY
      const freshEncrypted = encryptMessage(decrypted);
      if (freshEncrypted !== msg.content) {
        await db.message.update({
          where: { id: msg.id },
          data: { content: freshEncrypted }
        });
        reencryptedCount++;
      }
    }
  }

  console.log(`✅ Script completed successfully!`);
  console.log(`- Re-encrypted ${reencryptedCount} messages with your active .env key.`);
  console.log(`- Cleaned up ${deletedCount} unreadable old test messages.`);
}

main()
  .catch((e) => {
    console.error("❌ Error running re-encryption script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
