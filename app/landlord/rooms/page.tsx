import { getLandlordRooms } from "@/services/landlord/rooms";
import LandlordRoomManagementHub from "../features/room-management";

export const metadata = {
  title: "Rooms | Landlord Dashboard",
  description: "Manage individual room availability, pricing, and occupancy across your properties.",
};

export const dynamic = 'force-dynamic';

export default async function LandlordRoomsPage() {
  const result = await getLandlordRooms({ isArchived: false });

  return <LandlordRoomManagementHub initialData={result as any} />;
}
