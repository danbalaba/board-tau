import { PrismaClient } from "@prisma/client";
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Fixing emailVerified field type in MongoDB...\n");

    // Get MongoDB connection string from environment or use default
    const connectionString = process.env.DATABASE_URL || 'mongodb://localhost:27017/boardtau';

    // Create a direct MongoDB client connection
    const mongoClient = new MongoClient(connectionString);
    await mongoClient.connect();

    const db = mongoClient.db('boardtau');
    const usersCollection = db.collection('User');

    // Find all users with boolean emailVerified field
    const usersWithBoolean = await usersCollection.find({
      emailVerified: { $type: 'boolean' }
    }).toArray();

    console.log(`Found ${usersWithBoolean.length} users with boolean emailVerified`);

    // Update each user to set emailVerified to current date
    if (usersWithBoolean.length > 0) {
      const result = await usersCollection.updateMany(
        { emailVerified: { $type: 'boolean' } },
        { $set: { emailVerified: new Date() } }
      );

      console.log(`✓ Updated ${result.modifiedCount} users`);
    }

    // Verify the fix
    const updatedUsers = await usersCollection.find({
      email: { $in: [
        'landlord@boardtau.test',
        'admin@boardtau.test',
        'maria@student.edu',
        'juan@student.edu',
        'angela@student.edu',
        'pedro@student.edu'
      ]}
    }).project({ email: 1, emailVerified: 1, password: 1 }).toArray();

    console.log("\n✅ Verified users:");
    updatedUsers.forEach(user => {
      console.log(`- ${user.email}`);
      console.log(`  emailVerified type: ${typeof user.emailVerified}`);
      console.log(`  emailVerified value: ${user.emailVerified}`);
    });

    await mongoClient.close();
    console.log("\n✅ All operations completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing emailVerified field:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
