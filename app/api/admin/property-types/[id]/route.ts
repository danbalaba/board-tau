import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponseFormatter } from "@/lib/api-response";
import { z } from "zod";
import { sendPropertyTypeDisabledEmail } from "@/services/email/notifications";
import { invalidatePropertyTypesCache } from "@/services/taxonomy";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(ApiResponseFormatter.error("Unauthorized: Super Admin access required"), { status: 403 });
    }

    const { id } = await props.params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const existing = await db.propertyType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(ApiResponseFormatter.error("Property type not found"), { status: 404 });
    }

    if (data.name) {
      const duplicate = await db.propertyType.findFirst({
        where: {
          name: { equals: data.name.trim(), mode: "insensitive" },
          id: { not: id }
        }
      });
      if (duplicate) {
        return NextResponse.json(ApiResponseFormatter.error(`A property category named '${data.name}' already exists.`), { status: 400 });
      }
    }

    // Begin a transaction because we might need to cascade UNPUBLISHED to listings
    const result = await db.$transaction(async (tx) => {
      const updated = await tx.propertyType.update({
        where: { id },
        data,
      });

      // If isActive was changed to false, cascade to listings
      if (existing.isActive && data.isActive === false) {
        const affectedListings = await tx.listing.findMany({
          where: { propertyTypeId: id, status: "ACTIVE" },
          include: { user: true }
        });

        if (affectedListings.length > 0) {
          await tx.listing.updateMany({
            where: { propertyTypeId: id, status: "ACTIVE" },
            data: { status: "UNPUBLISHED" }
          });

          // Log the cascading action
          await tx.adminActivityLog.create({
            data: {
              adminId: session.user.id,
              action: "cascaded_unpublished_listings",
              entityType: "Listing",
              entityId: id,
              details: JSON.stringify({
                notes: `Cascaded UNPUBLISHED status because Property Type '${existing.name}' was disabled.`,
                affectedCount: affectedListings.length,
              })
            }
          });

          // Group by user and notify them
          const landlordStats = new Map();
          for (const listing of affectedListings) {
            if (!landlordStats.has(listing.user.id)) {
              landlordStats.set(listing.user.id, { user: listing.user, count: 0 });
            }
            landlordStats.get(listing.user.id).count++;
          }
          
          for (const stats of Array.from(landlordStats.values())) {
            // We fire this asynchronously and do not block the request
            sendPropertyTypeDisabledEmail(stats.user, existing, stats.count).catch(console.error);
          }
        }
      }

      await tx.adminActivityLog.create({
        data: {
          adminId: session.user.id,
          action: data.isActive === false ? "property_type_disabled" : data.isActive === true ? "property_type_enabled" : "property_type_updated",
          entityType: "PropertyType",
          entityId: updated.id,
          details: JSON.stringify({ name: updated.name, isActive: updated.isActive, changes: data }),
        }
      });

      return updated;
    });

    // Invalidate Redis cache so homepage & navbar immediately reflect updated property type status
    await invalidatePropertyTypesCache();

    return NextResponse.json(ApiResponseFormatter.success(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation Error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(ApiResponseFormatter.error(error.message), { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(ApiResponseFormatter.error("Unauthorized: Super Admin access required"), { status: 403 });
    }

    const { id } = await props.params;

    const existing = await db.propertyType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(ApiResponseFormatter.error("Property type not found"), { status: 404 });
    }

    // Count attached listings
    const attachedCount = await db.listing.count({
      where: { propertyTypeId: id },
    });

    await db.$transaction(async (tx) => {
      // Delete associated room type definitions
      await tx.roomTypeDefinition.deleteMany({
        where: { propertyTypeId: id },
      });

      // If listings were attached, unpublish them so they are not orphaned
      if (attachedCount > 0) {
        await tx.listing.updateMany({
          where: { propertyTypeId: id },
          data: { status: "UNPUBLISHED" },
        });
      }

      // Delete the property type record
      await tx.propertyType.delete({
        where: { id },
      });

      // Audit log in AdminActivityLog
      await tx.adminActivityLog.create({
        data: {
          adminId: session.user.id,
          action: "property_type_deleted",
          entityType: "PropertyType",
          entityId: id,
          details: JSON.stringify({ name: existing.name, affectedListings: attachedCount }),
        },
      });
    });

    // Invalidate Redis cache immediately
    await invalidatePropertyTypesCache();

    return NextResponse.json(
      ApiResponseFormatter.success({
        id,
        deletedName: existing.name,
        affectedListings: attachedCount,
      })
    );
  } catch (error: any) {
    return NextResponse.json(ApiResponseFormatter.error(error.message || "Failed to delete property type"), { status: 500 });
  }
}
