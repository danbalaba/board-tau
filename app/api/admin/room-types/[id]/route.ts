import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponseFormatter } from "@/lib/api-response";
import { z } from "zod";
import { invalidatePropertyTypesCache } from "@/services/taxonomy";

const bedSetupSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  paxCapacity: z.number().default(1),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  isFlatRate: z.boolean().optional(),
  isActive: z.boolean().optional(),
  bedSetups: z.array(bedSetupSchema).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // SUPER_ADMIN only for updating dictionary configurations
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(ApiResponseFormatter.error("Unauthorized. Super Admin access required."), { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const existing = await db.roomTypeDefinition.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(ApiResponseFormatter.error("Room type definition not found"), { status: 404 });
    }

    if (data.name) {
      const duplicateName = await db.roomTypeDefinition.findFirst({
        where: {
          propertyTypeId: existing.propertyTypeId,
          name: { equals: data.name.trim(), mode: "insensitive" },
          id: { not: id }
        }
      });
      if (duplicateName) {
        return NextResponse.json(ApiResponseFormatter.error(`A room type named '${data.name}' already exists in this category.`), { status: 400 });
      }
    }

    const result = await db.$transaction(async (tx) => {
      const { bedSetups, ...updateData } = data;

      if (bedSetups !== undefined) {
        await tx.bedSetupDefinition.deleteMany({
          where: { roomTypeDefinitionId: id },
        });
      }

      const updated = await tx.roomTypeDefinition.update({
        where: { id },
        data: {
          ...updateData,
          bedSetups: bedSetups && bedSetups.length > 0 ? {
            create: bedSetups.map((b) => ({
              code: b.code,
              name: b.name,
              description: b.description || "",
              paxCapacity: b.paxCapacity || 1,
            }))
          } : undefined,
        },
        include: {
          bedSetups: true,
        }
      });

      await tx.adminActivityLog.create({
        data: {
          adminId: session.user.id,
          action: data.isActive === false ? "room_type_disabled" : data.isActive === true ? "room_type_enabled" : "room_type_updated",
          entityType: "RoomTypeDefinition",
          entityId: updated.id,
          details: JSON.stringify({ name: updated.name, isActive: updated.isActive, changes: data }),
        }
      });

      return updated;
    });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(ApiResponseFormatter.error("Unauthorized. Super Admin access required."), { status: 401 });
    }

    const { id } = await params;

    const existing = await db.roomTypeDefinition.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { rooms: true }
        }
      }
    });

    if (!existing) {
      return NextResponse.json(ApiResponseFormatter.error("Room type definition not found"), { status: 404 });
    }

    if (existing._count.rooms > 0) {
      return NextResponse.json(ApiResponseFormatter.error(`Cannot delete room type: ${existing._count.rooms} rooms are using it. Disable it by setting isActive to false instead.`), { status: 400 });
    }

    await db.roomTypeDefinition.delete({ where: { id } });

    await db.adminActivityLog.create({
      data: {
        adminId: session.user.id,
        action: "room_type_deleted",
        entityType: "RoomTypeDefinition",
        entityId: id,
        details: JSON.stringify({ name: existing.name }),
      }
    });

    await invalidatePropertyTypesCache();

    return NextResponse.json(ApiResponseFormatter.success({ deleted: true }));
  } catch (error: any) {
    return NextResponse.json(ApiResponseFormatter.error(error.message), { status: 500 });
  }
}
