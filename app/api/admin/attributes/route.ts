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

    let whereClause: any = {};
    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    const [attributes, propertyTypes] = await Promise.all([
      db.dynamicAttribute.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
      }),
      db.propertyType.findMany({
        select: { id: true, name: true },
      }),
    ]);

    const propTypeMap = new Map(propertyTypes.map((pt) => [pt.id, pt.name]));

    const data = attributes.map((attr) => {
      const propertyTypeNames = (attr.propertyTypeIds || [])
        .map((id) => propTypeMap.get(id))
        .filter(Boolean);

      return {
        ...attr,
        propertyTypeNames,
        propertyTypes: propertyTypeNames.map((name) => ({ name })),
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/admin/attributes error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attributes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, subGroupKey, setupContext, description, icon, isActive, isUniversal, propertyTypeNames } = body;

    const cleanName = name.trim().replace(/\s+/g, " ");

    if (!cleanName || !type) {
      return NextResponse.json({ success: false, message: "Name and type are required" }, { status: 400 });
    }

    const existing = await db.dynamicAttribute.findFirst({
      where: { name: { equals: cleanName, mode: "insensitive" } },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: `A dynamic attribute named '${cleanName}' already exists.` }, { status: 400 });
    }

    // Resolve propertyTypeNames to propertyTypeIds safely without Prisma P2023 Malformed ObjectID errors
    let propertyTypeIds: string[] = [];
    let finalIsUniversal = Boolean(isUniversal);

    if (!finalIsUniversal && Array.isArray(propertyTypeNames) && propertyTypeNames.length > 0) {
      const allDbPropTypes = await db.propertyType.findMany({ select: { id: true, name: true } });
      const normTargets = propertyTypeNames.map((n: string) => String(n).toLowerCase().trim());

      const matched = allDbPropTypes.filter((pt) =>
        normTargets.some((t: string) => t === pt.id.toLowerCase() || t === pt.name.toLowerCase().trim())
      );

      propertyTypeIds = matched.map((pt) => pt.id);

      if (allDbPropTypes.length > 0 && propertyTypeIds.length >= allDbPropTypes.length) {
        finalIsUniversal = true;
        propertyTypeIds = [];
      }
    }

    const attribute = await db.dynamicAttribute.create({
      data: {
        name: cleanName,
        type,
        subGroupKey: subGroupKey || null,
        setupContext: setupContext || null,
        description: description ? description.trim().replace(/\s+/g, " ") : null,
        icon: icon || "Sparkles",
        isActive: isActive ?? true,
        isUniversal: finalIsUniversal,
        propertyTypeIds: finalIsUniversal ? [] : propertyTypeIds,
      },
    });

    // Invalidate Upstash Redis taxonomy cache instantly
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
            action: "CREATE_ATTRIBUTE",
            entityType: "DynamicAttribute",
            entityId: attribute.id,
            details: JSON.stringify({
              name: attribute.name,
              type: attribute.type,
              subGroupKey: attribute.subGroupKey,
              isUniversal: attribute.isUniversal,
              propertyTypeNames: finalIsUniversal ? [] : propertyTypeNames || [],
            }),
          },
        });
      }
    } catch (logErr) {
      console.error("Audit log creation error in POST /api/admin/attributes:", logErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...attribute,
        propertyTypeNames: isUniversal ? [] : propertyTypeNames,
      },
      message: "Dynamic attribute saved successfully",
    });
  } catch (error: any) {
    console.error("POST /api/admin/attributes error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to save dynamic attribute" }, { status: 500 });
  }
}
