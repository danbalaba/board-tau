import { PrismaClient } from "@prisma/client";
import { decryptMessage, encryptMessage } from "../lib/encryption";

const db = new PrismaClient();

async function rotateKeys() {
  console.log("🔐 Starting Database Message Key Rotation Script...\n");

  const currentKey = process.env.MESSAGE_ENCRYPTION_KEY;
  if (!currentKey) {
    console.error("❌ CRITICAL ERROR: MESSAGE_ENCRYPTION_KEY is not defined in your .env file!");
    process.exit(1);
  }

  const messages = await db.message.findMany();
  console.log(`📦 Found ${messages.length} total messages in the database.\n`);

  let reencryptedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const msg of messages) {
    const decrypted = decryptMessage(msg.content);

    if (decrypted.startsWith("🔒 This message")) {
      console.warn(`⚠️ Warning: Could not decrypt message ID ${msg.id}. Check PREVIOUS_MESSAGE_ENCRYPTION_KEYS in .env.`);
      failedCount++;
      continue;
    }

    // Re-encrypt the decrypted message content using the active MESSAGE_ENCRYPTION_KEY
    const reencrypted = encryptMessage(decrypted);

    if (reencrypted !== msg.content) {
      await db.message.update({
        where: { id: msg.id },
        data: { content: reencrypted },
      });
      reencryptedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log("\n=============================================");
  console.log("🎉 Key Rotation Completed Successfully!");
  console.log(`- Re-encrypted under new active key: ${reencryptedCount} messages`);
  console.log(`- Already up-to-date messages: ${skippedCount} messages`);
  if (failedCount > 0) {
    console.log(`- Unreadable messages (missing old key): ${failedCount} messages`);
  }
  console.log("=============================================\n");
}

rotateKeys()
  .catch((e) => {
    console.error("❌ Error executing key rotation script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
