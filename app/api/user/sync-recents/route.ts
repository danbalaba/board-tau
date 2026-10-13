import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db as prisma } from "@/lib/db";

export async function POST(
  request: Request, 
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json().catch(() => ({}));
    const { recentSearchQueries, recentListingIds } = body || {};
    
    // Cap to 20 items and filter unique
    const uniqueQueries = Array.from(new Set(Array.isArray(recentSearchQueries) ? recentSearchQueries : [])).slice(0, 20);
    const uniqueListingIds = Array.from(new Set(Array.isArray(recentListingIds) ? recentListingIds : [])).slice(0, 20);

    await prisma.user.update({
      where: {
        id: currentUser.id
      },
      data: {
        recentSearchQueries: uniqueQueries as string[],
        recentListingIds: uniqueListingIds as string[]
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SYNC_RECENTS_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
