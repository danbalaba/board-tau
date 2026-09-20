import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Public & Admin GET - Fetch colleges for dropdowns or admin management
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDisabled = searchParams.get("includeDisabled") === "true";
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

    const whereCondition = (includeDisabled || isAdmin) ? {} : { isActive: true };

    const colleges = await db.campusCollege.findMany({
      where: whereCondition,
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(colleges);
  } catch (error) {
    console.error("[COLLEGES_GET]", error);
    return NextResponse.json({ message: "Failed to fetch campus colleges" }, { status: 500 });
  }
}

// Admin POST - Create a new college
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, code, latitude, longitude, logoUrl, isActive, order } = body;

    if (!name || !code || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existing = await db.campusCollege.findFirst({
      where: {
        OR: [
          { code: { equals: code.trim(), mode: "insensitive" } },
          { name: { equals: name.trim(), mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: `A campus landmark with Code '${code.trim()}' or Name '${name.trim()}' already exists.` },
        { status: 400 }
      );
    }

    const college = await db.campusCollege.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        logoUrl: logoUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order !== undefined ? parseInt(order.toString()) : 0,
      },
    });

    // Record Audit Log
    try {
      let adminId: string | undefined = session?.user?.id;
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
            action: "CREATE_LANDMARK",
            entityType: "CampusLandmark",
            entityId: college.id,
            details: JSON.stringify({
              name: college.name,
              code: college.code,
              latitude: college.latitude,
              longitude: college.longitude,
              logoUrl: college.logoUrl,
              isActive: college.isActive,
            }),
          },
        });
      }
    } catch (logErr) {
      console.error("[COLLEGES_POST_AUDIT_ERROR]", logErr);
    }

    return NextResponse.json(college);
  } catch (error: any) {
    console.error("[COLLEGES_POST]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
