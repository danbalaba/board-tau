import { db } from "@/lib/db";
import { sendStrikeWarningEmail, sendBanNoticeEmail, sendSuspensionNoticeEmail } from "@/services/email/notifications";
import { executeCascadeCancellation } from "@/services/cascade-cancellation";

export async function recordCancellationStrike(userId: string, entityId: string, reason: string) {
  // 1. Create the strike
  await db.userStrike.create({
    data: {
      userId,
      reason,
      entityId,
    }
  });

  // 2. Count strikes in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const strikeCount = await db.userStrike.count({
    where: {
      userId,
      createdAt: {
        gte: sevenDaysAgo,
      }
    }
  });

  // 3. Fetch user details to check suspensionCount
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) return;

  const suspensionCount = user.suspensionCount || 0;

  // 4. Apply Strike Rules
  if (strikeCount === 2) {
    if (suspensionCount === 0) {
      await sendStrikeWarningEmail(user, 2, "You have cancelled multiple inquiries or reservations recently. One more cancellation will result in a temporary account suspension.", false);
    } else {
      await sendStrikeWarningEmail(user, 2, "You have been suspended before. One more cancellation will result in a PERMANENT LIFETIME BAN.", true);
    }
  } else if (strikeCount >= 3) {
    if (suspensionCount === 0) {
      // First Offense: Suspend
      await db.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          suspensionCount: 1,
          restrictedReason: "Auto-Suspended (1st Offense): Excessive Cancellations",
          deletedAt: new Date()
        }
      });
      // Send suspension email notification
      await sendSuspensionNoticeEmail(user, "Auto-Suspended (1st Offense): Excessive Cancellations");
      // Fire cascade cancellation
      await executeCascadeCancellation(userId, "System Auto-Suspension: Excessive Cancellations");
    } else {
      // Repeat Offense: LIFETIME BAN
      await db.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          isPermanentlyBanned: true,
          restrictedReason: "LIFETIME BAN: Repeat Offense (Excessive Cancellations)",
          deletedAt: new Date()
        }
      });
      await sendBanNoticeEmail(user, "Accumulating 3 strikes due to repeated cancellations after a previous suspension.");
      // Fire cascade cancellation with isPermanentBan = true
      await executeCascadeCancellation(userId, "System LIFETIME BAN: Repeat Offense (Excessive Cancellations)", true);
    }
  }
}
