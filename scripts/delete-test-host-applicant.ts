import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=======================================================");
  console.log("🧹 BOARDTAU DELETE TEST HOST APPLICANT SCRIPT");
  console.log("=======================================================\n");

  const email = "applicant@boardtau.test";

  // 1. Find the test user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { hostApplication: true },
  });

  if (!user) {
    console.log(`ℹ️ No test applicant user found with email: ${email}`);
    // Check if any orphan host applications exist with applicant@boardtau.test
    const orphanApps = await prisma.hostApplication.findMany();
    const testOrphans = orphanApps.filter((app: any) => {
      const cInfo = typeof app.contactInfo === "string" ? JSON.parse(app.contactInfo) : app.contactInfo;
      return cInfo?.email === email;
    });

    if (testOrphans.length > 0) {
      for (const orphan of testOrphans) {
        await prisma.hostApplication.delete({ where: { id: orphan.id } });
        console.log(`   ✅ Cleaned up unlinked host application (${orphan.id}).`);
      }
    } else {
      console.log("   Database is already clean!\n");
    }
    return;
  }

  // 2. Delete HostApplication if exists
  if (user.hostApplication) {
    console.log(`🗑️ Deleting host application (${user.hostApplication.id}) with status: "${user.hostApplication.status}"...`);
    await prisma.hostApplication.delete({
      where: { id: user.hostApplication.id },
    });
    console.log("   ✅ Host application successfully deleted.");
  } else {
    // Check if any host applications exist for this userId
    const apps = await prisma.hostApplication.findMany({
      where: { userId: user.id },
    });
    for (const app of apps) {
      await prisma.hostApplication.delete({ where: { id: app.id } });
      console.log(`   ✅ Cleaned up host application (${app.id}).`);
    }
  }

  // 3. Clean up notifications for this test user
  const deletedNotifications = await prisma.notification.deleteMany({
    where: { userId: user.id },
  });
  if (deletedNotifications.count > 0) {
    console.log(`   ✅ Deleted ${deletedNotifications.count} test notifications.`);
  }

  // 4. Delete the test user completely
  await prisma.user.delete({
    where: { id: user.id },
  });
  console.log(`   ✅ Test applicant user (${email}) deleted successfully.`);

  console.log("\n=======================================================");
  console.log("✨ CLEANUP COMPLETE!");
  console.log("   All test applicant data has been permanently removed.");
  console.log("-------------------------------------------------------");
  console.log("🚀 READY TO RESEED:");
  console.log("   Run: npm run seed:test-applicant");
  console.log("   Then open: http://localhost:3000/admin/moderation/hosts");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error deleting test applicant:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
