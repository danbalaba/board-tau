import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cache } from "@/lib/redis";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const landlord = await requireLandlord();
    const { isArchived } = await req.json();

    if (typeof isArchived !== "boolean") {
      return NextResponse.json({ error: "Invalid archive status" }, { status: 400 });
    }

    // Verify ownership before updating
    const property = await db.listing.findFirst({
      where: {
        id: propertyId,
        userId: landlord.id,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found or unauthorized" }, { status: 404 });
    }

    const updated = await db.listing.update({
      where: { id: propertyId },
      data: { isArchived },
    });

    // Invalidate caches
    await cache.del("landlord:properties");
    await cache.del("listings:{}");
    
    revalidatePath("/landlord/properties");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PROPERTY_ARCHIVE_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
