import { NextRequest, NextResponse } from "next/server";
import {
  getLandlordTenants,
  getTenantDetails,
  getTenantDocument,
  getTenantRentalHistory,
} from "@/services/landlord/tenants";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const status = searchParams.get("status") || undefined;
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (id) {
      if (action === "documents") {
        const result = await getTenantDocument(id);
        return NextResponse.json({
          success: true,
          data: result,
        });
      } else if (action === "history") {
        const result = await getTenantRentalHistory(id);
        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      const result = await getTenantDetails(id);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    const result = await getLandlordTenants({ cursor, status });
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch tenants",
      },
      { status: 500 }
    );
  }
}
