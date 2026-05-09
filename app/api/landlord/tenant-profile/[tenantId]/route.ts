import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/landlord/tenant-profile/[tenantId]
 * Returns safe, non-sensitive tenant profile info for the Landlord Messaging Hub.
 * Only accessible by a verified LANDLORD who has had at least one message exchange with the tenant.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "LANDLORD") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId } = await params;

    // Authorization check: Landlord must have had a message exchange with this tenant
    const hasMessaged = await db.message.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: tenantId },
          { senderId: tenantId, receiverId: session.user.id },
        ],
      },
      select: { id: true, listingId: true },
    });

    if (!hasMessaged) {
      return NextResponse.json(
        { success: false, error: "No message relationship found" },
        { status: 403 }
      );
    }

    // Fetch only safe, non-sensitive profile fields
    const tenant = await db.user.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        emailVerified: true,
        phoneNumber: true,
        bio: true,
        city: true,
        region: true,
        createdAt: true,
        isActive: true,
        // Fetch the latest inquiry for this tenant with this landlord
        inquiries: {
          where: {
            listing: {
              userId: session.user.id,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            moveInDate: true,
            checkOutDate: true,
            occupantsCount: true,
            createdAt: true,
            listing: {
              select: { id: true, title: true, imageSrc: true, images: true },
            }
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error("Error fetching tenant profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
