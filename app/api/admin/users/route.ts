import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }

    // Fetch users with pagination
    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        emailVerified: true,
        isVerifiedLandlord: true,
        phoneNumber: true,
        businessName: true,
        image: true,
      },
    });

    // Get total count for pagination
    const totalUsers = await db.user.count({ where });

    // Transform user data
    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email || "",
      role: user.role || "User",
      status: user.isActive ? "Active" : "Inactive",
      lastLogin: "Never", // Last login tracking coming soon
      created: user.createdAt.toISOString().split('T')[0],
      emailVerified: !!user.emailVerified,
      isVerifiedLandlord: user.isVerifiedLandlord,
      phoneNumber: user.phoneNumber || "N/A",
      businessName: user.businessName || "N/A",
      image: user.image || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          current: page,
          total: totalUsers,
          perPage: limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
