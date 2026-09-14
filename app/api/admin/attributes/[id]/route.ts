import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { name, type, subGroupKey, setupContext, description, icon, isActive, isUniversal, propertyTypeNames } = body;

    if (name) {
      const duplicate = await db.dynamicAttribute.findFirst({
        where: {
          name: { equals: name.trim(), mode: "insensitive" },
          id: { not: id },
        },
      });
      if (duplicate) {
        return NextResponse.json({ success: false, message: `A dynamic attribute named '${name.trim()}' already exists.` }, { status: 400 });
      }
    }

    let propertyTypeIds: string[] | undefined = undefined;
    let finalIsUniversal = isUniversal;

    if (isUniversal !== undefined) {
      if (isUniversal) {
        propertyTypeIds = [];
      } else if (Array.isArray(propertyTypeNames) && propertyTypeNames.length > 0) {
        const hexObjectIdRegex = /^[0-9a-fA-F]{24}$/;
        const validIds = propertyTypeNames.filter((item: string) => typeof item === "string" && hexObjectIdRegex.test(item));
        const nameStrings = propertyTypeNames.filter((item: string) => typeof item === "string" && !hexObjectIdRegex.test(item));

        const orConditions: any[] = [];
        if (nameStrings.length > 0) {
          orConditions.push({ name: { in: nameStrings } });
        }
        if (validIds.length > 0) {
          orConditions.push({ id: { in: validIds } });
        }

        if (orConditions.length > 0) {
          const [matchingPropTypes, totalDbTypesCount] = await Promise.all([
            db.propertyType.findMany({
              where: { OR: orConditions },
              select: { id: true },
            }),
            db.propertyType.count(),
          ]);

          propertyTypeIds = matchingPropTypes.map((pt) => pt.id);

          // If targeted selection includes ALL database property types, logically convert to Universal (All)
          if (totalDbTypesCount > 0 && propertyTypeIds.length >= totalDbTypesCount) {
            finalIsUniversal = true;
            propertyTypeIds = [];
          }
        } else {
          propertyTypeIds = [];
        }
      }
    }

    const attribute = await db.dynamicAttribute.update({
      where: { id },
      data: {
        ...(name && { name: name.trim().replace(/\s+/g, " ") }),
        ...(type && { type }),
        subGroupKey: subGroupKey || null,
        setupContext: type === "ROOM_AMENITY" ? (setupContext || null) : null,
        ...(description !== undefined && { description: description ? description.trim().replace(/\s+/g, " ") : null }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive }),
        ...(finalIsUniversal !== undefined && { isUniversal: finalIsUniversal }),
        ...(propertyTypeIds !== undefined && { propertyTypeIds }),
      },
    });

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
        let action = "UPDATE";
        if (isActive !== undefined && Object.keys(body).length <= 2) {
          action = isActive ? "PUBLISH" : "UNPUBLISH";
        }
        await db.adminActivityLog.create({
          data: {
            adminId,
            action,
            entityType: "DynamicAttribute",
            entityId: attribute.id,
            details: JSON.stringify({
              name: attribute.name,
              type: attribute.type,
              subGroupKey: attribute.subGroupKey,
              isActive: attribute.isActive,
              isUniversal: attribute.isUniversal,
              propertyTypeNames: finalIsUniversal ? [] : propertyTypeNames || [],
            }),
          },
        });
      }
    } catch (logErr) {
      console.error("Audit log creation error in PUT /api/admin/attributes/[id]:", logErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...attribute,
        propertyTypeNames: isUniversal ? [] : propertyTypeNames || [],
      },
    });
  } catch (error: any) {
    console.error(`PUT /api/admin/attributes error:`, error);
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, message: "Attribute record not found in database. It may have been deleted or reset." }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: error.message || "Failed to update attribute" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const deletedAttr = await db.dynamicAttribute.delete({
      where: { id },
    });

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
            action: "DELETE",
            entityType: "DynamicAttribute",
            entityId: id,
            details: JSON.stringify({
              name: deletedAttr?.name || id,
              type: deletedAttr?.type,
              subGroupKey: deletedAttr?.subGroupKey,
            }),
          },
        });
      }
    } catch (logErr) {
      console.error("Audit log creation error in DELETE /api/admin/attributes/[id]:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: "Dynamic attribute deleted successfully",
    });
  } catch (error: any) {
    console.error(`DELETE /api/admin/attributes error:`, error);
    return NextResponse.json({ success: false, message: error.message || "Failed to delete attribute" }, { status: 500 });
  }
}
