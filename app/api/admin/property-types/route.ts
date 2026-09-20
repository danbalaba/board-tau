import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponseFormatter } from "@/lib/api-response";
import { z } from "zod";

import { invalidatePropertyTypesCache } from "@/services/taxonomy";

const propertyTypeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
      return NextResponse.json(ApiResponseFormatter.error("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const propertyTypes = await db.propertyType.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        roomTypes: true,
        _count: {
          select: { listings: true }
        }
      }
    });

    return NextResponse.json(ApiResponseFormatter.success(propertyTypes));
  } catch (error: any) {
    return NextResponse.json(ApiResponseFormatter.error(error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(ApiResponseFormatter.error("Unauthorized: Super Admin access required"), { status: 403 });
    }

    const body = await req.json();
    const data = propertyTypeSchema.parse(body);

    const existing = await db.propertyType.findUnique({
      where: { name: data.name }
    });

    if (existing) {
      return NextResponse.json(ApiResponseFormatter.error("Property type already exists"), { status: 400 });
    }

    const propertyType = await db.propertyType.create({
      data: {
        name: data.name,
        description: data.description || null,
        icon: data.icon || "Building",
      }
    });

    await db.adminActivityLog.create({
      data: {
        adminId: session.user.id,
        action: "property_type_created",
        entityType: "PropertyType",
        entityId: propertyType.id,
        details: JSON.stringify({ name: propertyType.name, icon: propertyType.icon, description: propertyType.description }),
      }
    });

    // Invalidate Redis cache so homepage & navbar immediately reflect the new property type
    await invalidatePropertyTypesCache();

    return NextResponse.json(ApiResponseFormatter.success(propertyType));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation Error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(ApiResponseFormatter.error(error.message), { status: 500 });
  }
}
