"use client";
import React, { useState } from "react";
import Button from "@/components/common/Button";
import Modal from "../../modals/Modal";
import InquiryModal from "../../modals/InquiryModal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  availableSlots: number;
  images: string[];
  roomType: string;
  status: string;
}

interface AvailableRoomsSectionProps {
  rooms: Room[];
  listingId: string;
  listingName: string;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  user?: any; // User object or null if not logged in (optional)
}

const AvailableRoomsSection: React.FC<AvailableRoomsSectionProps> = ({
  rooms,
  listingId,
  listingName,
  onSubmit,
  isLoading,
  user,
}) => {
  // Show all rooms, not just available ones
  const allRooms = rooms;
  const router = useRouter();
  const [inquiringRoomId, setInquiringRoomId] = useState<string | null>(null);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleInquireClick = async (e: React.MouseEvent, roomId: string) => {
    // Prevent multiple clicks on any room
    if (inquiringRoomId) {
      e.preventDefault();
      return;
    }

    setInquiringRoomId(roomId);

    if (!user) {
      e.preventDefault();

      // Clear existing timer if any
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Show toast only once after a delay
      debounceTimerRef.current = setTimeout(() => {
        toast.error("Please log in to send an inquiry.");
        setInquiringRoomId(null);
      }, 1000);

      return;
    }
  };

  return (
    <section className="py-8 border-t border-border">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Available Rooms / Bedspaces
      </h2>

      {allRooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
            No rooms available for this listing
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white dark:bg-gray-800 rounded-card shadow-soft overflow-hidden border border-border dark:border-gray-700 transition-colors duration-300"
            >
              {/* Room Image */}
              <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 relative">
                <img
                  src={room.images[0] || "/images/placeholder.jpg"}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      room.status === "available"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>

              {/* Room Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary dark:text-gray-100 mb-2">
                  {room.name}
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  ₱ {room.price.toLocaleString()}/month
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Capacity
                    </p>
                    <p className="font-semibold text-text-primary dark:text-gray-100">
                      {room.capacity}{" "}
                      {room.capacity === 1 ? "person" : "people"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available Slots
                    </p>
                    <p className="font-semibold text-text-primary dark:text-gray-100">
                      {room.availableSlots}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Room Type
                    </p>
                    <p className="font-semibold text-text-primary dark:text-gray-100">
                      {room.roomType}
                    </p>
                  </div>
                </div>

                {/* Reserve Button */}
                {user ? (
                  <Modal>
                    <Modal.Trigger name={`inquire-${room.id}`}>
                      <Button
                        className="w-full"
                        isLoading={inquiringRoomId === room.id}
                        onClick={(e) => handleInquireClick(e, room.id)}
                        disabled={room.status !== "available"}
                      >
                        {room.status === "available" ? "Reserve" : "Full"}
                      </Button>
                    </Modal.Trigger>

                    <InquiryModal
                      listingName={listingName}
                      room={room}
                      onSubmit={onSubmit}
                      isLoading={isLoading}
                    />
                  </Modal>
                ) : (
                  <Button
                    className="w-full"
                    onClick={(e) => handleInquireClick(e, room.id)}
                    isLoading={inquiringRoomId === room.id}
                    disabled={room.status !== "available"}
                  >
                    {room.status === "available" ? "Reserve" : "Full"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AvailableRoomsSection;
