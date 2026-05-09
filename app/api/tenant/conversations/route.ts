import { NextRequest, NextResponse } from "next/server";
import { getTenantConversations } from "@/services/user/messages";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getTenantConversations();

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching tenant conversations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
