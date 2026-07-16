import { NextResponse } from "next/server";
import { getLandlordRooms, createLandlordRoom } from "@/services/landlord/rooms";
import { cache } from "@/lib/redis";
import { hasPermission } from "@/lib/rbac";
import { getCurrentUser } from "@/services/user";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    const permitted = await hasPermission(user.id, "VIEW_ROOMS");
    if (!permitted) return new NextResponse("Forbidden: Missing VIEW_ROOMS", { status: 403 });

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;
    const listingId = searchParams.get("listingId") || undefined;
    const roomType = searchParams.get("roomType") || undefined;
    const capacity = searchParams.get("capacity") ? Number(searchParams.get("capacity")) : undefined;
    const isArchived = searchParams.get("isArchived") === 'true' ? true : searchParams.get("isArchived") === 'false' ? false : undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getLandlordRooms({ 
      cursor, 
      listingId, 
      roomType, 
      capacity, 
      isArchived, 
      sortBy,
      search 
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROOMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    const permitted = await hasPermission(user.id, "CREATE_ROOM");
    if (!permitted) return new NextResponse("Forbidden: Missing CREATE_ROOM", { status: 403 });

    const body = await request.json();
    const room = await createLandlordRoom(body);

    if (room.listingId) {
      await cache.del(`listing:id:${room.listingId}`);
    }

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    console.error("[ROOMS_POST]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
