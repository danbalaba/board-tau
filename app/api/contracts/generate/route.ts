import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const tenantId = searchParams.get("userId"); // The tenant's user ID
    const roomId = searchParams.get("roomId");

    if (!listingId || !tenantId || !roomId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Security Check: Only allow if the requester is the tenant, landlord, or admin
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: { user: true }
    });

    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const isTenant = user.id === tenantId;
    const isLandlord = user.id === listing.userId;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isTenant && !isLandlord && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch the Tenant user
    const tenantUser = await db.user.findUnique({ where: { id: tenantId } });
    if (!tenantUser) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    // Fetch the room
    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Fetch the Inquiry to get moveIn and moveOut dates
    const inquiry = await db.inquiry.findFirst({
      where: { listingId, userId: tenantId, roomId },
      orderBy: { createdAt: 'desc' }
    });

    if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });

    // Fetch the lease contract
    const leaseContract = await db.leaseContract.findFirst({
      where: { listingId },
      include: { signatures: true }
    });

    if (!leaseContract) return NextResponse.json({ error: "Lease contract not found" }, { status: 404 });

    // Extract signatures
    const landlordSig = leaseContract.signatures.find((s: any) => s.signerType === 'LANDLORD')?.signatureUrl || "";
    const tenantSig = leaseContract.signatures.find((s: any) => s.signerType === 'TENANT' && s.signerId === tenantId)?.signatureUrl || "";

    // Generate contract hash
    const contractContent = `${listingId}-${tenantId}-${inquiry.id}-${leaseContract.id}`;
    const contractHash = crypto.createHash('sha256').update(contractContent).digest('hex').substring(0, 12).toUpperCase();

    // Format address
    const locationObj = listing.location as any;
    const propertyAddress = locationObj?.label || listing.region || "Verified Location";

    const contractData = {
      contractHash,
      landlordName: listing.user.name || "Landlord",
      tenantName: tenantUser.name || "Tenant",
      propertyName: listing.title,
      roomName: room.name,
      propertyAddress,
      moveInDate: new Date(inquiry.moveInDate).toLocaleDateString(),
      checkOutDate: new Date(inquiry.checkOutDate).toLocaleDateString(),
      depositAmount: leaseContract.depositAmount * room.price, // assuming depositAmount is stored as number of months
      rentAmount: room.price,
      moveOutNoticeDays: leaseContract.moveOutNoticeDays,
      customClauses: listing.customClauses || [],
      landlordSignatureBase64: landlordSig,
      tenantSignatureBase64: tenantSig,
    };

    return NextResponse.json(contractData);
  } catch (error: any) {
    console.error("Error generating contract data:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
