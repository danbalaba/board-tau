import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper function to create audit log
async function createAuditLog(action: string, entityId: string, details: any, req: Request) {
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
          adminId: String(adminId),
          action,
          entityType: "CampusLandmark",
          entityId,
          details: JSON.stringify(details),
        },
      });
    }
  } catch (err) {
    console.error(`[AUDIT_LOG_ERROR] Failed to record ${action} for CampusLandmark ${entityId}:`, err);
  }
}

// PUT - Full update of an existing college landmark
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, code, latitude, longitude, logoUrl, isActive, order } = body;

    if (!name || !code || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingCollege = await db.campusCollege.findUnique({
      where: { id },
    });

    if (!existingCollege) {
      return NextResponse.json({ message: "Campus landmark not found" }, { status: 404 });
    }

    // Check for duplicate name or code (excluding current ID)
    const duplicate = await db.campusCollege.findFirst({
      where: {
        id: { not: id },
        OR: [
          { code: { equals: code.trim(), mode: "insensitive" } },
          { name: { equals: name.trim(), mode: "insensitive" } },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: `Another campus landmark with Code '${code.trim()}' or Name '${name.trim()}' already exists.` },
        { status: 400 }
      );
    }

    const updatedCollege = await db.campusCollege.update({
      where: { id },
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        logoUrl: logoUrl || null,
        isActive: isActive !== undefined ? isActive : existingCollege.isActive,
        order: order !== undefined ? parseInt(order.toString()) : existingCollege.order,
      },
    });

    // Record Audit Log
    await createAuditLog(
      "UPDATE",
      id,
      {
        previous: {
          name: existingCollege.name,
          code: existingCollege.code,
          latitude: existingCollege.latitude,
          longitude: existingCollege.longitude,
          logoUrl: existingCollege.logoUrl,
          isActive: existingCollege.isActive,
        },
        updated: {
          name: updatedCollege.name,
          code: updatedCollege.code,
          latitude: updatedCollege.latitude,
          longitude: updatedCollege.longitude,
          logoUrl: updatedCollege.logoUrl,
          isActive: updatedCollege.isActive,
        },
      },
      req
    );

    return NextResponse.json(updatedCollege);
  } catch (error: any) {
    console.error("[COLLEGES_PUT]", error);
    return NextResponse.json({ message: error.message || "Failed to update college landmark" }, { status: 500 });
  }
}

// PATCH - Partial update or Toggle Active Status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existingCollege = await db.campusCollege.findUnique({
      where: { id },
    });

    if (!existingCollege) {
      return NextResponse.json({ message: "Campus landmark not found" }, { status: 404 });
    }

    const updatedCollege = await db.campusCollege.update({
      where: { id },
      data: {
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.name && { name: body.name.trim() }),
        ...(body.code && { code: body.code.trim().toUpperCase() }),
        ...(body.latitude !== undefined && { latitude: parseFloat(body.latitude.toString()) }),
        ...(body.longitude !== undefined && { longitude: parseFloat(body.longitude.toString()) }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      },
    });

    // Record Audit Log
    await createAuditLog(
      body.isActive !== undefined ? (body.isActive ? "ENABLE_LANDMARK" : "DISABLE_LANDMARK") : "PATCH",
      id,
      {
        name: updatedCollege.name,
        code: updatedCollege.code,
        previousState: { isActive: existingCollege.isActive },
        newState: { isActive: updatedCollege.isActive },
      },
      req
    );

    return NextResponse.json(updatedCollege);
  } catch (error: any) {
    console.error("[COLLEGES_PATCH]", error);
    return NextResponse.json({ message: error.message || "Failed to patch college landmark" }, { status: 500 });
  }
}

// DELETE - Delete a college landmark
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const existingCollege = await db.campusCollege.findUnique({
      where: { id },
    });

    if (!existingCollege) {
      return NextResponse.json({ message: "Campus landmark not found" }, { status: 404 });
    }

    await db.campusCollege.delete({
      where: { id },
    });

    // Record Audit Log
    await createAuditLog(
      "DELETE",
      id,
      {
        deletedLandmark: {
          name: existingCollege.name,
          code: existingCollege.code,
          latitude: existingCollege.latitude,
          longitude: existingCollege.longitude,
        },
      },
      req
    );

    return NextResponse.json({ success: true, message: `Campus landmark '${existingCollege.name}' deleted.` });
  } catch (error: any) {
    console.error("[COLLEGES_DELETE]", error);
    return NextResponse.json({ message: error.message || "Failed to delete college landmark" }, { status: 500 });
  }
}
