import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { db } from "@/lib/db";
import { backendClient } from "@/lib/edgestore-server";
import { requireLandlord } from "@/lib/landlord";
import {
  getLandlordInquiries,
  getInquiryDetails,
  respondToInquiry,
  deleteInquiry,
} from "@/services/landlord/inquiries";
import { hasPermission } from "@/lib/rbac";
import { getCurrentUser } from "@/services/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const permitted = await hasPermission(user.id, "MANAGE_INQUIRIES");
    if (!permitted) return NextResponse.json({ success: false, error: 'Forbidden: Missing MANAGE_INQUIRIES' }, { status: 403 });

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const status = searchParams.get("status") || undefined;
    const includeArchived = searchParams.get("isArchived") === "true";

    const result = await getLandlordInquiries({ cursor, status, includeArchived });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch inquiries",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const permitted = await hasPermission(user.id, "MANAGE_INQUIRIES");
    if (!permitted) return NextResponse.json({ success: false, error: 'Forbidden: Missing MANAGE_INQUIRIES' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const inquiryId = searchParams.get("id");

    if (!inquiryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Inquiry ID is required",
        },
        { status: 400 }
      );
    }

    const { status, message } = await request.json();

    // Sanitize using validator.escape() — fully trusted HTML entity encoding
    // This converts all HTML special characters to safe entities,
    // preventing both XSS and the incomplete multi-char sanitization CodeQL warning
    // that a regex-based approach (e.g. /&lt;[^&gt;]*&gt;?/gm) produces.
    const sanitizedMessage = typeof message === 'string'
      ? validator.escape(message.trim())
      : undefined;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid status (APPROVED/REJECTED) is required",
        },
        { status: 400 }
      );
    }

    const result = await respondToInquiry(inquiryId, status, sanitizedMessage);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error responding to inquiry:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to respond to inquiry",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const landlord = await requireLandlord();
    const permitted = await hasPermission(landlord.id, "MANAGE_INQUIRIES");
    if (!permitted) return NextResponse.json({ success: false, error: 'Forbidden: Missing MANAGE_INQUIRIES' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const inquiryId = searchParams.get("id");
    const isPurge = searchParams.get("purge") === "true";

    if (!inquiryId) {
      return NextResponse.json({ success: false, error: "Inquiry ID is required" }, { status: 400 });
    }

    // 1. Fetch current state ensuring it belongs to the authenticated landlord
    const inquiry = await db.inquiry.findFirst({
      where: { 
        id: inquiryId,
        listing: {
          userId: landlord.id
        }
      }
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, error: "Inquiry not found or unauthorized" }, { status: 404 });
    }

    // 2. If PURGE requested (Permanent Delete)
    if (isPurge) {
      const fileUrls = [
        inquiry.profilePhotoUrl,
        inquiry.idAttachmentUrl
      ].filter(Boolean) as string[];

      if (fileUrls.length > 0) {
        await Promise.allSettled(
          fileUrls.map(async (url) => {
            try {
              let targetUrl = url;

              // Robustly extract the real EdgeStore URL from the proxy
              if (url.includes('/api/edgestore/proxy-file')) {
                try {
                  // Handle both relative (/api/...) and absolute (http://...) URLs
                  const urlObj = url.startsWith('http') 
                    ? new URL(url) 
                    : new URL(url, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
                  
                  const extractedUrl = urlObj.searchParams.get('url');
                  if (extractedUrl) targetUrl = extractedUrl;
                } catch (urlErr) {
                  console.error("Failed to parse proxied URL:", url);
                }
              }

              // Verify we are sending a valid external URL to EdgeStore
              if (targetUrl.startsWith('http')) {
                 return await backendClient.identityDocs.deleteFile({ url: targetUrl });
              } else {
                 console.warn(`⚠️ Skipping delete for invalid/non-external URL: ${targetUrl}`);
              }
            } catch (err) {
              console.error(`❌ EdgeStore Delete Failed for ${url}:`, err);
              throw err;
            }
          })
        );
      }

      await db.inquiry.delete({
        where: { id: inquiryId }
      });

      return NextResponse.json({
        success: true,
        message: "Inquiry and all associated sensitive files purged permanently."
      });
    }

    // 3. Otherwise, just archive/restore (toggle behavior via service)
    const result = await deleteInquiry(inquiryId);

    return NextResponse.json({
      success: true,
      data: result,
      message: result.isArchived ? "Inquiry archived successfully." : "Inquiry restored successfully."
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete inquiry",
      },
      { status: 500 }
    );
  }
}
