import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let whereClause: any = { isActive: true };
    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    const subGroups = await (db as any).attributeSubGroup.findMany({
      where: whereClause,
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: subGroups,
    });
  } catch (error: any) {
    console.error("GET /api/admin/sub-groups error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sub-groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("--> POST /api/admin/sub-groups payload received:", body);
    const { key, type, title, subtitle, tabLabel, displayOrder, isActive } = body;

    if (!key || !type || !tabLabel) {
      return NextResponse.json(
        { success: false, message: "Key, type, and tabLabel are required" },
        { status: 400 }
      );
    }

    const formattedKey = key.trim().toUpperCase().replace(/\s+/g, "_");

    const subGroup = await (db as any).attributeSubGroup.upsert({
      where: { key: formattedKey },
      update: {
        type,
        title: title ? title.trim() : `Step: ${tabLabel}`,
        subtitle: subtitle ? subtitle.trim() : `Select your ${tabLabel} preferences`,
        tabLabel: tabLabel.trim(),
        displayOrder: displayOrder ?? 99,
        isActive: isActive ?? true,
      },
      create: {
        key: formattedKey,
        type,
        title: title ? title.trim() : `Step: ${tabLabel}`,
        subtitle: subtitle ? subtitle.trim() : `Select your ${tabLabel} preferences`,
        tabLabel: tabLabel.trim(),
        displayOrder: displayOrder ?? 99,
        isActive: isActive ?? true,
      },
    });

    // Invalidate Upstash Redis taxonomy cache
    await cache.delPattern("taxonomy:*");

    // Audit Logging
    try {
      const session = await getServerSession(authOptions);
      let adminId = session?.user?.id;
      if (!adminId) {
        const adminUser = await db.user.findFirst({
          where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
          select: { id: true },
        });
        adminId = adminUser?.id;
      }
      if (adminId) {
        await db.adminActivityLog.create({
          data: {
            adminId,
            action: "CREATE",
            entityType: "AttributeSubGroup",
            entityId: subGroup.id,
            details: JSON.stringify({
              key: subGroup.key,
              type: subGroup.type,
              tabLabel: subGroup.tabLabel,
              title: subGroup.title,
            }),
          },
        });
      }
    } catch (logErr) {
      console.error("Audit log creation error in POST /api/admin/sub-groups:", logErr);
    }

    return NextResponse.json({
      success: true,
      data: subGroup,
      message: "Sub-group created successfully",
    });
  } catch (error: any) {
    console.error("POST /api/admin/sub-groups error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save sub-group" },
      { status: 500 }
    );
  }
}
