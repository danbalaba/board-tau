import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyTypeId = searchParams.get("propertyTypeId");
    const propertyTypeName = searchParams.get("propertyType");

    let whereClause: any = { isActive: true };
    if (propertyTypeId) {
      whereClause.propertyTypeId = propertyTypeId;
    } else if (propertyTypeName) {
      const propType = await db.propertyType.findFirst({
        where: {
          name: { equals: propertyTypeName, mode: "insensitive" },
          isActive: true,
        },
      });
      if (propType) {
        whereClause.propertyTypeId = propType.id;
      }
    }

    const roomTypes = await db.roomTypeDefinition.findMany({
      where: whereClause,
      include: {
        propertyType: {
          select: { name: true }
        },
        bedSetups: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" }
        }
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: roomTypes }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch room types" }, { status: 500 });
  }
}
