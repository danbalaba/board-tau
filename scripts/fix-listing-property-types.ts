import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Starting listing propertyTypeId migration script...");

  // 1. Fetch all PropertyTypes
  const propertyTypes = await db.propertyType.findMany();
  console.log(`Found ${propertyTypes.length} property types in database:`);
  propertyTypes.forEach((pt) => {
    console.log(` - ID: ${pt.id}, Name: ${pt.name}`);
  });

  // 2. Fetch all Listings
  const listings = await db.listing.findMany({
    select: {
      id: true,
      title: true,
      propertyTypeId: true,
      businessInfo: true,
    }
  });

  console.log(`\nFound ${listings.length} total listings in database.`);

  let updatedCount = 0;

  for (const listing of listings) {
    let matchedPtId: string | null = null;
    let matchedPtName: string | null = null;

    // A. Check if businessInfo.businessType is a valid PropertyType ID or Name
    const bizInfo = (listing.businessInfo as any) || {};
    const bizType = bizInfo.businessType;

    if (bizType) {
      const ptByBiz = propertyTypes.find(
        (pt) => pt.id === bizType || pt.name.toLowerCase() === String(bizType).toLowerCase()
      );
      if (ptByBiz) {
        matchedPtId = ptByBiz.id;
        matchedPtName = ptByBiz.name;
      }
    }

    // B. Keyword search in title if not matched yet
    if (!matchedPtId && listing.title) {
      const lowerTitle = listing.title.toLowerCase();
      if (lowerTitle.includes("dorm")) {
        const pt = propertyTypes.find((p) => p.name.toLowerCase().includes("dorm"));
        if (pt) { matchedPtId = pt.id; matchedPtName = pt.name; }
      } else if (lowerTitle.includes("boarding")) {
        const pt = propertyTypes.find((p) => p.name.toLowerCase().includes("boarding"));
        if (pt) { matchedPtId = pt.id; matchedPtName = pt.name; }
      } else if (lowerTitle.includes("apt") || lowerTitle.includes("apartment")) {
        const pt = propertyTypes.find((p) => p.name.toLowerCase().includes("apartment"));
        if (pt) { matchedPtId = pt.id; matchedPtName = pt.name; }
      } else if (lowerTitle.includes("transient")) {
        const pt = propertyTypes.find((p) => p.name.toLowerCase().includes("transient"));
        if (pt) { matchedPtId = pt.id; matchedPtName = pt.name; }
      } else if (lowerTitle.includes("hostel")) {
        const pt = propertyTypes.find((p) => p.name.toLowerCase().includes("hostel"));
        if (pt) { matchedPtId = pt.id; matchedPtName = pt.name; }
      }
    }

    // C. Default fallback if still unmatched: Boarding House (most common student housing)
    if (!matchedPtId) {
      const defaultPt = propertyTypes.find((p) => p.name.toLowerCase() === "boarding house") || propertyTypes[0];
      if (defaultPt) {
        matchedPtId = defaultPt.id;
        matchedPtName = defaultPt.name;
      }
    }

    if (matchedPtId) {
      if (listing.propertyTypeId !== matchedPtId) {
        await db.listing.update({
          where: { id: listing.id },
          data: { propertyTypeId: matchedPtId }
        });
        console.log(`[UPDATED] Listing "${listing.title}" (${listing.id}) -> Linked propertyTypeId: ${matchedPtId} (${matchedPtName})`);
        updatedCount++;
      } else {
        console.log(`[OK] Listing "${listing.title}" already linked to propertyTypeId: ${matchedPtId} (${matchedPtName})`);
      }
    } else {
      console.log(`[WARN] Could not match listing "${listing.title}" to any PropertyType.`);
    }
  }

  console.log(`\nMigration completed successfully! Updated ${updatedCount} listings.`);
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
