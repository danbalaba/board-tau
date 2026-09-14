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

const createSchema = z.object({
  propertyTypeId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  isFlatRate: z.boolean().default(false),
  isActive: z.boolean().default(true),
  bedSetups: z.array(bedSetupSchema).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
      return NextResponse.json(ApiResponseFormatter.error("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyTypeId = searchParams.get("propertyTypeId");

    let whereClause: any = {};
    
    // Admins usually see everything, but if a propertyTypeId is specified, we filter by it
    if (propertyTypeId) {
      whereClause.propertyTypeId = propertyTypeId;
    }

    const roomTypes = await db.roomTypeDefinition.findMany({
      where: whereClause,
      include: {
        propertyType: {
          select: { name: true }
        },
        bedSetups: true,
        _count: {
          select: { rooms: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ApiResponseFormatter.success(roomTypes));
  } catch (error: any) {
    return NextResponse.json(ApiResponseFormatter.error(error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // SUPER_ADMIN only for creating new root-level dictionary configurations
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(ApiResponseFormatter.error("Unauthorized. Super Admin access required."), { status: 401 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    // Verify property type exists
    const propertyType = await db.propertyType.findUnique({
      where: { id: data.propertyTypeId }
    });

    if (!propertyType) {
      return NextResponse.json(ApiResponseFormatter.error("Invalid property type ID"), { status: 400 });
    }

    const { bedSetups, ...roomTypeData } = data;

    const existingName = await db.roomTypeDefinition.findFirst({
      where: {
        propertyTypeId: data.propertyTypeId,
        name: { equals: roomTypeData.name.trim(), mode: "insensitive" }
      }
    });

    if (existingName) {
      return NextResponse.json(ApiResponseFormatter.error(`A room type named '${roomTypeData.name}' already exists under ${propertyType.name}`), { status: 400 });
    }

    const newRoomType = await db.roomTypeDefinition.create({
      data: {
        ...roomTypeData,
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

    // Log the creation
    await db.adminActivityLog.create({
      data: {
        adminId: session.user.id,
        action: "room_type_created",
        entityType: "RoomTypeDefinition",
        entityId: newRoomType.id,
        details: JSON.stringify({ name: newRoomType.name, propertyTypeId: data.propertyTypeId, propertyTypeName: propertyType.name }),
      }
    });

    // Invalidate Redis cache so /api/room-types returns fresh data immediately
    await invalidatePropertyTypesCache();

    return NextResponse.json(ApiResponseFormatter.success(newRoomType));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation Error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(ApiResponseFormatter.error(error.message), { status: 500 });
  }
}
