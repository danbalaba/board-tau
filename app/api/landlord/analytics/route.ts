import { NextRequest, NextResponse } from "next/server";
import {
  getLandlordDashboardStats,
  getPropertyPerformance,
  getRevenueReport,
  getOccupancyReport,
} from "@/services/landlord/analytics";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const propertyId = searchParams.get("propertyId");
    const period = searchParams.get("period");

    switch (type) {
      case "dashboard":
        const stats = await getLandlordDashboardStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      case "property":
        if (!propertyId) {
          return NextResponse.json(
            {
              success: false,
              error: "Property ID is required for property performance",
            },
            { status: 400 }
          );
        }
        const propertyStats = await getPropertyPerformance(propertyId);
        return NextResponse.json({
          success: true,
          data: propertyStats,
        });

      case "revenue":
        const revenuePeriod = (period as "month" | "quarter" | "year") || "month";
        const revenueStats = await getRevenueReport(revenuePeriod);
        return NextResponse.json({
          success: true,
          data: revenueStats,
        });

      case "occupancy":
        const occupancyStats = await getOccupancyReport(propertyId || undefined);
        return NextResponse.json({
          success: true,
          data: occupancyStats,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid report type",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}
