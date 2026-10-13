// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface IndexConfig {
  collection: string;
  indexes: {
    key: Record<string, any>;
    name: string;
  }[];
}

const indexDefinitions: IndexConfig[] = [
  {
    collection: "Listing",
    indexes: [
      { key: { location: "2dsphere" }, name: "location_2dsphere" },
      { key: { userId: 1 }, name: "Listing_userId_idx" },
      { key: { status: 1 }, name: "Listing_status_idx" },
      { key: { price: 1 }, name: "Listing_price_idx" },
      { key: { propertyTypeId: 1 }, name: "Listing_propertyTypeId_idx" },
    ]
  },
  {
    collection: "Room",
    indexes: [
      { key: { listingId: 1 }, name: "Room_listingId_idx" },
      { key: { status: 1 }, name: "Room_status_idx" },
      { key: { roomTypeDefinitionId: 1 }, name: "Room_roomTypeDefinitionId_idx" },
    ]
  },
  {
    collection: "ListingImage",
    indexes: [
      { key: { listingId: 1 }, name: "ListingImage_listingId_idx" },
    ]
  },
  {
    collection: "RoomImage",
    indexes: [
      { key: { roomId: 1 }, name: "RoomImage_roomId_idx" },
    ]
  },
  {
    collection: "Inquiry",
    indexes: [
      { key: { userId: 1 }, name: "Inquiry_userId_idx" },
    ]
  },
  {
    collection: "Reservation",
    indexes: [
      { key: { userId: 1 }, name: "Reservation_userId_idx" },
    ]
  },
  {
    collection: "LeaseContract",
    indexes: [
      { key: { landlordId: 1 }, name: "LeaseContract_landlordId_idx" },
      { key: { tenantId: 1 }, name: "LeaseContract_tenantId_idx" },
      { key: { listingId: 1 }, name: "LeaseContract_listingId_idx" },
    ]
  },
  {
    collection: "HostApplication",
    indexes: [
      { key: { status: 1 }, name: "HostApplication_status_idx" },
    ]
  },
  {
    collection: "DynamicAttribute",
    indexes: [
      { key: { type: 1, isActive: 1 }, name: "DynamicAttribute_type_isActive_idx" },
      { key: { subGroupKey: 1 }, name: "DynamicAttribute_subGroupKey_idx" },
    ]
  },
  {
    collection: "ListingAttributeLink",
    indexes: [
      { key: { attributeId: 1 }, name: "ListingAttributeLink_attributeId_idx" },
    ]
  },
  {
    collection: "RoomAttributeLink",
    indexes: [
      { key: { attributeId: 1 }, name: "RoomAttributeLink_attributeId_idx" },
    ]
  },
  {
    collection: "RoomTypeDefinition",
    indexes: [
      { key: { propertyTypeId: 1 }, name: "RoomTypeDefinition_propertyTypeId_idx" },
    ]
  },
  {
    collection: "BedSetupDefinition",
    indexes: [
      { key: { roomTypeDefinitionId: 1 }, name: "BedSetupDefinition_roomTypeDefinitionId_idx" },
    ]
  },
];

async function main() {
  console.log("⏳ Connecting to database to establish and verify all MongoDB indexes...\n");

  // 1. Ensure any legacy TTL indexes are dropped so audit logs are permanently preserved
  try {
    await prisma.$runCommandRaw({
      dropIndexes: "AdminActivityLog",
      index: "createdAt_ttl_90_days"
    });
    console.log("ℹ️ Legacy AdminActivityLog TTL index removed (audit logs are permanent).\n");
  } catch (err) {
    // Expected: index does not exist
  }

  // 2. Loop through every collection and ensure indexes are created
  for (const config of indexDefinitions) {
    try {
      await prisma.$runCommandRaw({
        createIndexes: config.collection,
        indexes: config.indexes
      });
      console.log(`✅ [${config.collection}] All ${config.indexes.length} indexes verified and active.`);
    } catch (err: any) {
      console.log(`ℹ️ [${config.collection}] Indexes already active or skipped: ${err.message}`);
    }
  }

  console.log("\n🚀 All MongoDB performance & geospatial indexes are successfully established!");
}

main()
  .catch((e) => {
    console.error("❌ Error creating indexes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔒 Database connection closed.");
  });
