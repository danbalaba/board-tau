import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db as prisma } from "@/lib/db";

export async function POST(
  request: Request, 
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.error();
    }
    
    const body = await request.json();
    const { recentSearchQueries, recentListingIds } = body;
    
    // Cap to 20 items and filter unique
    const uniqueQueries = Array.from(new Set(recentSearchQueries || [])).slice(0, 20);
    const uniqueListingIds = Array.from(new Set(recentListingIds || [])).slice(0, 20);

    const user = await prisma.user.update({
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
    return new NextResponse('Internal Error', { status: 500 });
  }
}
