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

    // Fetch the lease contract (if exists)
    const leaseContract = await db.leaseContract.findFirst({
      where: { listingId },
      include: { signatures: true }
    });

    const businessInfo = (listing.businessInfo as any) || {};

    // Extract custom PDF URL if landlord uploaded a custom contract PDF
    const customPdfUrl =
      leaseContract?.pdfUrl ||
      businessInfo?.customPdfUrl ||
      businessInfo?.documents?.customContract ||
      null;

    const contractMode =
      businessInfo?.contractMode ||
      businessInfo?.propertyConfig?.contractMode ||
      (customPdfUrl ? "CUSTOM_PDF" : "AUTO_GEN");

    // Extract signatures
    const landlordSig =
      leaseContract?.signatures?.find((s: any) => s.signerType === 'LANDLORD')?.signatureUrl ||
      businessInfo?.landlordSignatureBase64 ||
      businessInfo?.propertyConfig?.landlordSignatureBase64 ||
      "";

    // Check for tenant signature in ContractSignature table or Inquiry
    const tenantSigRecord = await db.contractSignature.findFirst({
      where: {
        signerId: tenantId,
        signerType: "TENANT",
        contract: { listingId }
      },
      orderBy: { signedAt: 'desc' }
    });

    const tenantSig =
      leaseContract?.signatures?.find((s: any) => s.signerType === 'TENANT' && s.signerId === tenantId)?.signatureUrl ||
      tenantSigRecord?.signatureUrl ||
      "";

    // Generate contract hash
    const contractContent = `${listingId}-${tenantId}-${inquiry.id}-${leaseContract?.id || 'default'}`;
    const contractHash = crypto.createHash('sha256').update(contractContent).digest('hex').substring(0, 12).toUpperCase();

    // Format address
    const locationObj = listing.location as any;
    const propertyAddress = locationObj?.label || listing.region || "Verified Location";

    // Deposit calculation (if <= 6, treated as months multiplier; otherwise raw peso value)
    const rawDeposit = leaseContract?.depositAmount ?? businessInfo?.depositAmount ?? businessInfo?.propertyConfig?.depositAmount ?? 0;
    const depositAmount = rawDeposit > 0 && rawDeposit <= 6 ? rawDeposit * room.price : Number(rawDeposit);

    const moveOutNoticeDays = leaseContract?.moveOutNoticeDays ?? businessInfo?.moveOutNoticeDays ?? businessInfo?.propertyConfig?.moveOutNoticeDays ?? 30;

    const customClauses = listing.customClauses && listing.customClauses.length > 0
      ? listing.customClauses
      : businessInfo?.customContractClauses || businessInfo?.propertyConfig?.customContractClauses || [];

    const contractData = {
      contractHash,
      contractMode,
      customPdfUrl,
      landlordName: listing.user.name || listing.user.businessName || "Landlord",
      tenantName: tenantUser.name || "Tenant",
      propertyName: listing.title,
      roomName: room.name,
      propertyAddress,
      moveInDate: new Date(inquiry.moveInDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      checkOutDate: new Date(inquiry.checkOutDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      depositAmount,
      rentAmount: room.price,
      moveOutNoticeDays,
      customClauses,
      landlordSignatureBase64: landlordSig,
      tenantSignatureBase64: tenantSig,
    };

    return NextResponse.json(contractData);
  } catch (error: any) {
    console.error("Error generating contract data:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
