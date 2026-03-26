"use client";
import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import Modal from "../../modals/Modal";
import InquiryModal from "../../modals/InquiryModal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaChevronLeft, FaChevronRight, FaEye, FaInfoCircle } from "react-icons/fa";
import AllRoomsModal from "./AllRoomsModal";
import RoomTooltip from "./RoomTooltip";
import RoomDetailsModal from "./RoomDetailsModal";
import { Eye } from "lucide-react";

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  availableSlots: number;
  images: {
    id: string;
    url: string;
    caption?: string;
    order?: number;
  }[];
  roomType: string;
  status: string;
  description?: string;
  size?: number;
  bedType?: string;
  amenities?: string[];
  reservationFee: number;
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
  const [showAllRoomsModal, setShowAllRoomsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [roomToInquire, setRoomToInquire] = useState<Room | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Slider navigation state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to update arrow visibility
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [allRooms]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleInquireClick = (e: React.MouseEvent | undefined, room: Room) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    
    if (!user) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        toast.error("Please log in to send an inquiry.");
      }, 100);
      return;
    }

    setRoomToInquire(room);
    setShowInquiryModal(true);
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  // Show View All button only when there are more than 3 rooms
  const showViewAllButton = allRooms.length > 3;

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
        <div className="relative">
          {/* Navigation Arrows */}
          {allRooms.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
                  canScrollLeft
                    ? "bg-white dark:bg-gray-800 text-primary hover:bg-gray-100 dark:hover:bg-gray-700"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
                aria-label="Scroll left"
              >
                <FaChevronLeft size={20} />
              </button>

              {/* Right Arrow */}
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
                  canScrollRight
                    ? "bg-white dark:bg-gray-800 text-primary hover:bg-gray-100 dark:hover:bg-gray-700"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
                aria-label="Scroll right"
              >
                <FaChevronRight size={20} />
              </button>
            </>
          )}

          {/* Rooms Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allRooms.map((room) => (
              <div
                key={room.id}
                className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-card shadow-soft overflow-hidden border border-border dark:border-gray-700 transition-colors duration-300 relative"
                onMouseEnter={() => {
                  if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                  hoverTimerRef.current = setTimeout(() => {
                    setHoveredRoomId(room.id);
                  }, 1000); // 1s delay to prevent accidental overlaps
                }}
                onMouseLeave={() => {
                  if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                  setHoveredRoomId(null);
                }}
              >
                {/* Room Image */}
                <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 relative">
                  <img
                    src={(room.images && room.images.length > 0) ? room.images[0].url : "/images/placeholder.jpg"}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        room.status === "AVAILABLE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {room.status === "AVAILABLE" ? "Available" : room.status}
                    </span>
                  </div>

                  {/* Quick View Button */}
                  <button
                    onClick={() => handleViewDetails(room)}
                    className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors flex items-center justify-center p-2.5"
                    aria-label="View room details"
                  >
                    <Eye size={16} />
                  </button>
                </div>

                {/* Room Info */}
                <div className="p-6">
                  <h3 
                    className="text-xl font-bold text-text-primary dark:text-gray-100 mb-2 truncate"
                    title={room.name}
                  >
                    {room.name}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                    ₱ {room.price.toLocaleString()}/month
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {room.roomType === "BEDSPACE" && (
                      <>
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
                      </>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Room Type
                      </p>
                      <p className="font-semibold text-text-primary dark:text-gray-100">
                        {room.roomType}
                      </p>
                    </div>
                  </div>

                  {/* Inquire Button */}
                  <Button
                    className="w-full"
                    onClick={(e) => handleInquireClick(e, room)}
                    disabled={room.status !== "AVAILABLE"}
                  >
                    {room.status === "AVAILABLE" ? "Inquire" : "Full"}
                  </Button>
                </div>

                {/* Hover Tooltip */}
                <RoomTooltip 
                  room={room} 
                  isVisible={hoveredRoomId === room.id} 
                  onViewDetails={() => handleViewDetails(room)}
                />
              </div>
            ))}

            {/* View All Rooms Button */}
            {showViewAllButton && (
              <div className="flex-shrink-0 w-80 flex items-center justify-center">
                <button
                  onClick={() => setShowAllRoomsModal(true)}
                  className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-card border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Eye className="text-2xl text-gray-500 dark:text-gray-400" />
                  </div>
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    View All Rooms
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {allRooms.length} rooms available
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Rooms Modal */}
      <AllRoomsModal
        isOpen={showAllRoomsModal}
        onClose={() => setShowAllRoomsModal(false)}
        rooms={allRooms}
        listingName={listingName}
        listingId={listingId}
        onSubmit={onSubmit}
        isLoading={isLoading}
        user={user}
        onViewDetails={handleViewDetails}
        onInquire={(room) => {
          setShowAllRoomsModal(false);
          handleInquireClick({} as any, room);
        }}
      />

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal
          isOpen={showRoomDetails}
          onClose={() => setShowRoomDetails(false)}
          room={selectedRoom}
          listingName={listingName}
          onInquire={() => {
            setShowRoomDetails(false);
            setRoomToInquire(selectedRoom);
            setShowInquiryModal(true);
          }}
          user={user}
        />
      )}

      {/* Central Inquiry Modal */}
      {roomToInquire && (
        <InquiryModal
          isOpen={showInquiryModal}
          onClose={() => {
            setShowInquiryModal(false);
            setRoomToInquire(null);
          }}
          listingName={listingName}
          listingId={listingId}
          room={roomToInquire}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      )}
    </section>
  );
};

export default AvailableRoomsSection;
