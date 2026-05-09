import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ landlordId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { landlordId } = await params;

    const landlord = await db.user.findUnique({
      where: { id: landlordId },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        emailVerified: true,
        phoneNumber: true,
        bio: true,
        createdAt: true,
        role: true,
        listings: {
          select: {
            id: true,
            title: true,
            imageSrc: true,
            images: true,
            category: true,
            location: true,
            _count: {
              select: {
                reviews: true,
              }
            }
          }
        }
      }
    });

    if (!landlord) {
      return NextResponse.json({ success: false, error: "Landlord not found" }, { status: 404 });
    }

    // Verify it is indeed a landlord (though anyone can view a host profile generally)
    if (landlord.role !== "LANDLORD") {
       // Silently handle if they are chatting with another user? 
       // In BoardTAU, you only chat with Landlords as a user.
    }

    return NextResponse.json({
      success: true,
      data: landlord,
    });
  } catch (error) {
    console.error("Error fetching landlord profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
