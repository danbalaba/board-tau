import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { backendClient } from "@/lib/edgestore-server";
import {
  getLandlordProperties,
  getLandlordPropertiesMinimal,
  createProperty,
  updateProperty,
  deleteProperty,
  updateListingStatus,
} from "@/services/landlord/properties";
import { requireLandlord } from "@/lib/landlord";
import { cache } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const all = searchParams.get("all") === "true";

    if (all) {
      const minimalProperties = await getLandlordPropertiesMinimal();
      return NextResponse.json({
        success: true,
        data: minimalProperties,
      });
    }

    // Create cache key
    const cacheKey = cursor ? `landlord:properties:${cursor}` : "landlord:properties";

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const result = await getLandlordProperties({ cursor });

    const response = {
      success: true,
      data: result,
    };

    // Cache the response for 15 minutes
    await cache.set(cacheKey, response, 900);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch properties",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const result = await createProperty(data);

    if (result.success) {
      // Invalidate property cache
      await cache.del("landlord:properties");
      // Also invalidate listings cache since properties might be listed
      await cache.del("listings:{}");

      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create property",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("id");

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Property ID is required",
        },
        { status: 400 }
      );
    }

    const data = await request.json();

    const result = await updateProperty(propertyId, data);

    if (result.success) {
      // Invalidate property cache
      await cache.del("landlord:properties");
      // Also invalidate listings cache since properties might be listed
      await cache.del("listings:{}");

      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update property",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const landlord = await requireLandlord();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("id");

    if (!propertyId) {
      return NextResponse.json({ success: false, error: "Property ID is required" }, { status: 400 });
    }

    // 1. Fetch the listing with all nested images (ListingImages and RoomImages)
    // We use findFirst with userId to ensure the property belongs to the logged-in landlord
    const listing = await db.listing.findFirst({
      where: { 
        id: propertyId,
        userId: landlord.id 
      },
      include: {
        images: true,
        rooms: {
          include: {
            images: true
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: "Property not found or unauthorized" }, { status: 404 });
    }

    // 2. Logic: If not archived, archive it. If already archived, PURGE EVERYTHING.
    if (!listing.isArchived) {
      await db.listing.update({
        where: { id: propertyId },
        data: { isArchived: true }
      });
      return NextResponse.json({ success: true, message: "Property moved to archive." });
    }

    // 3. HARD DELETE FLOW (Recursive Wipe)
    // Gather all Public Images (Gallery + Thumbnail)
    const listingImageUrls = listing.images.map(img => img.url);
    if (listing.imageSrc) listingImageUrls.push(listing.imageSrc);
    
    // Gather all Room Images
    const roomImageUrls = listing.rooms.flatMap(room => room.images.map(img => img.url));
    const publicFileUrls = [...new Set([...listingImageUrls, ...roomImageUrls])].filter(Boolean);

    // Gather all Identity Documents (Legal)
    const businessInfo = (listing as any).businessInfo;
    const documentUrls: string[] = [];
    if (businessInfo?.documents) {
      Object.values(businessInfo.documents).forEach((url: any) => {
        if (typeof url === 'string' && url.startsWith('http')) {
          documentUrls.push(url);
        }
      });
    }

    // --- HELPER: Robust URL Extraction ---
    const extractRealUrl = (url: string) => {
      let targetUrl = url;
      if (url.includes('/api/edgestore/proxy-file')) {
        try {
          const urlObj = url.startsWith('http') 
            ? new URL(url) 
            : new URL(url, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
          const extractedUrl = urlObj.searchParams.get('url');
          if (extractedUrl) targetUrl = extractedUrl;
        } catch (err) {
          console.error("Failed to parse proxied URL during property purge:", url);
        }
      }
      return targetUrl;
    };

    // Wipe Public Files (Gallery + Rooms)
    const publicDeletePromises = publicFileUrls.map(url => {
      const targetUrl = extractRealUrl(url);
      if (targetUrl.startsWith('http')) {
        return (backendClient.publicFiles as any).deleteFile({ url: targetUrl }).catch(() => {});
      }
      return Promise.resolve();
    });

    // Wipe Identity Docs (Legal/Business)
    const identityDeletePromises = documentUrls.map(url => {
      const targetUrl = extractRealUrl(url);
      if (targetUrl.startsWith('http')) {
        return (backendClient.identityDocs as any).deleteFile({ url: targetUrl }).catch((err: any) => {
          console.error(`❌ Failed to delete identity doc: ${targetUrl}`, err);
        });
      }
      return Promise.resolve();
    });

    // Run all deletions
    await Promise.all([...publicDeletePromises, ...identityDeletePromises]);

    // Finally, drop the record (Cascade will handle sub-records in DB)
    const result = await deleteProperty(propertyId);

    if (result.success) {
      // Invalidate property cache
      await cache.del("landlord:properties");
      // Also invalidate listings cache
      await cache.del("listings:{}");

      return NextResponse.json({
        success: true,
        message: "Property and all associated images purged permanently."
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete property",
      },
      { status: 500 }
    );
  }
}
