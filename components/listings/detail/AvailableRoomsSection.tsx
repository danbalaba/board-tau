"use client";
import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import Modal from "../../modals/Modal";
import InquiryModal from "../../modals/InquiryModal";
import AuthModal from "../../modals/AuthModal";
import { useRouter, useSearchParams } from "next/navigation";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AllRoomsModal from "./AllRoomsModal";
import RoomDetailsModal from "./RoomDetailsModal";
import { Eye, Users, Layers, Info, CheckCircle2, XCircle, DoorOpen, ArrowRight } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import RoomTooltip from "./RoomTooltip";

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
  imageSrc?: string;
}

interface AvailableRoomsSectionProps {
  rooms: Room[];
  listingId: string;
  landlordId: string;
  listingName: string;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  user?: any; // User object or null if not logged in (optional)
  activeStay?: { endDate: string; status: string; listing: { title: string } } | null;
}

const AvailableRoomsSection: React.FC<AvailableRoomsSectionProps> = ({
  rooms,
  listingId,
  landlordId,
  listingName,
  onSubmit,
  isLoading,
  user,
  activeStay,
}) => {
  const soloRooms = React.useMemo(() => [...rooms].filter(r => r.roomType === 'SOLO').sort((a, b) => 
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  ), [rooms]);
  
  const bedspaceRooms = React.useMemo(() => [...rooms].filter(r => r.roomType === 'BEDSPACE').sort((a, b) => 
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  ), [rooms]);

  const [activeTab, setActiveTab] = useState<'SOLO' | 'BEDSPACE'>(
    soloRooms.length > 0 ? 'SOLO' : 'BEDSPACE'
  );

  // The active rooms being displayed in the carousel
  const activeRooms = React.useMemo(() => activeTab === 'SOLO' ? soloRooms : bedspaceRooms, [activeTab, soloRooms, bedspaceRooms]);
  
  const handledAutoInquire = useRef<string | null>(null);
  const router = useRouter();
  const [showAllRoomsModal, setShowAllRoomsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [roomToInquire, setRoomToInquire] = useState<Room | null>(null);
  const { error: toastError } = useResponsiveToast();
  const lastInquiryToastTime = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleMouseEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    // Add a small delay before showing (Hover Intent)
    // This prevents the tooltip from blocking the "Inquire" button immediately
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRoomId(id);
    }, 2000); 
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    // Snappy exit to get out of the way of other buttons
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRoomId(null);
    }, 200); 
  };

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
  }, [activeRooms]);

  // Handle Auto-Inquiry from Deep Links
  useEffect(() => {
    const roomId = searchParams.get('room');
    const autoInquire = searchParams.get('autoInquire');

    if (!autoInquire) {
      handledAutoInquire.current = null;
    }

    if (user && autoInquire === 'true' && roomId && activeRooms.length > 0) {
      if (handledAutoInquire.current === roomId) return; // Prevent infinite loop on re-renders

      const room = [...soloRooms, ...bedspaceRooms].find(r => r.id === roomId);
      if (room && room.status === "AVAILABLE") {
        handledAutoInquire.current = roomId; // Mark as handled so it won't force reopen

        // Switch tab to the correct one before opening modal
        if (room.roomType === 'SOLO') setActiveTab('SOLO');
        if (room.roomType === 'BEDSPACE') setActiveTab('BEDSPACE');
        
        // Scroll to section
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Open modal
        setRoomToInquire(room);
        setShowInquiryModal(true);

        // Clear the URL immediately to prevent any re-triggers on background renders
        const newUrl = window.location.pathname;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [searchParams, soloRooms, bedspaceRooms, activeRooms, user, router]);

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
      // Update URL with intent so it survives OAuth or page reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('autoInquire', 'true');
      newUrl.searchParams.set('room', room.id);
      window.history.replaceState({}, '', newUrl.toString());

      const now = Date.now();
      if (now - lastInquiryToastTime.current > 5000) {
        toastError("Please sign in to send your inquiry.");
        lastInquiryToastTime.current = now;
      }
      setShowAuthModal(true);
      return;
    }

    setRoomToInquire(room);
    setShowInquiryModal(true);
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  // Show View All button only when there are more than 5 rooms
  const showViewAllButton = activeRooms.length > 5;

  return (
    <section ref={sectionRef} className="scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Available Rentals
        </h2>

        {/* Tabs UI */}
        {(soloRooms.length > 0 && bedspaceRooms.length > 0) && (
          <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-max">
            <button
              onClick={() => setActiveTab('SOLO')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'SOLO'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <DoorOpen size={16} />
              Private Solo Rooms
            </button>
            <button
              onClick={() => setActiveTab('BEDSPACE')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'BEDSPACE'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Users size={16} />
              Shared Bedspaces
            </button>
          </div>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
            No rooms available for this listing
          </p>
        </div>
      ) : activeRooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            There are no {activeTab === 'SOLO' ? 'Solo Rooms' : 'Bedspaces'} available in this property.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Navigation Arrows */}
          {activeRooms.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 border border-gray-100/50 dark:border-gray-700/50 ${
                  canScrollLeft
                    ? "bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-primary hover:bg-white/90 dark:hover:bg-gray-700/90"
                    : "bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-400 cursor-not-allowed border-transparent"
                }`}
                aria-label="Scroll left"
              >
                <FaChevronLeft size={20} />
              </button>

              {/* Right Arrow */}
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 border border-gray-100/50 dark:border-gray-700/50 ${
                  canScrollRight
                    ? "bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-primary hover:bg-white/90 dark:hover:bg-gray-700/90"
                    : "bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-400 cursor-not-allowed border-transparent"
                }`}
                aria-label="Scroll right"
              >
                <FaChevronRight size={20} />
              </button>
            </>
          )}

          {/* Mobile Swipe Hint */}
          <div className="flex md:hidden items-center gap-2 mb-4">
            <div className="bg-[#2f7d6d]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                <ArrowRight size={14} className="text-[#2f7d6d]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#2f7d6d]">Swipe to explore</span>
            </div>
          </div>

          {/* Rooms Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(showViewAllButton ? activeRooms.slice(0, 5) : activeRooms).map((room) => (
              <div
                key={room.id}
                className="flex-shrink-0 w-80 group bg-white dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 relative"
                onMouseEnter={() => handleMouseEnter(room.id)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Sneak Peek Tooltip */}
                <RoomTooltip 
                  room={room} 
                  isVisible={hoveredRoomId === room.id} 
                  onViewDetails={() => handleViewDetails(room)} 
                />
                {/* Room Image */}
                <div className="h-48 w-full relative overflow-hidden">
                  <SafeImage
                    src={(room.images && room.images.length > 0) ? room.images[0].url : (room.imageSrc || "/images/placeholder.jpg")}
                    alt={room.name}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border shadow-lg flex items-center gap-1.5 ${
                        room.status === "AVAILABLE"
                          ? "bg-primary/60 border-white/30 text-white"
                          : "bg-rose-500/60 border-white/30 text-white"
                      }`}
                    >
                      {room.status === "AVAILABLE" ? (
                        <>
                          <CheckCircle2 size={12} />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          Full
                        </>
                      )}
                    </div>
                  </div>

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Quick View Button */}
                  <button
                    onClick={() => handleViewDetails(room)}
                    className="absolute bottom-4 left-4 p-2.5 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-xl transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex items-center gap-2 text-xs font-bold"
                  >
                    <Eye size={14} className="text-primary" />
                    Preview
                  </button>
                </div>

                {/* Room Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 
                      className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate flex-1"
                      title={room.name}
                    >
                      {room.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      ₱{room.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      / month
                    </span>
                  </div>

                  {/* Icon Stats Row */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-gray-100 dark:border-gray-700/50 pt-4 mb-6">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/80">
                         <Layers size={14} className="text-primary" />
                       </div>
                       <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none">Type</p>
                         <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">{room.roomType}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/80">
                         <Users size={14} className="text-primary" />
                       </div>
                       <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none">Capacity</p>
                         <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">{room.capacity} Pax</p>
                       </div>
                    </div>

                    {room.roomType === "BEDSPACE" && (
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/80">
                           <DoorOpen size={14} className="text-primary" />
                         </div>
                         <div>
                           <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none">Slots</p>
                           <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">{room.availableSlots} Avail.</p>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Inquire Button */}
                  <button
                    onClick={(e) => handleInquireClick(e, room)}
                    disabled={room.status !== "AVAILABLE"}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/10 ${
                      room.status === "AVAILABLE"
                        ? "bg-primary hover:bg-primary/90 text-white hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {room.status === "AVAILABLE" ? (
                      <>Inquire Now</>
                    ) : (
                      <>Room Full</>
                    )}
                  </button>
                </div>
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
                    {activeRooms.length} rooms available
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
        rooms={activeRooms}
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
            handleInquireClick(undefined, selectedRoom);
          }}
          user={user}
        />
      )}

      {/* Central Inquiry Modal */}
      <InquiryModal
        isOpen={showInquiryModal}
        onClose={() => {
          setShowInquiryModal(false);
          // Delay clearing the room so the exit animation can play
          setTimeout(() => setRoomToInquire(null), 300);
        }}
        listingName={listingName}
        listingId={listingId}
        landlordId={landlordId}
        room={roomToInquire || activeRooms[0] || rooms[0]} // Fallback to prevent crashes during exit animation
        onSubmit={onSubmit}
        isLoading={isLoading}
        activeStay={activeStay}
      />

      {/* Auth Modal for Guests */}
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} width="sm" noPadding>
        <AuthModal name="Login" onCloseModal={() => setShowAuthModal(false)} />
      </Modal>
    </section>
  );
};

export default AvailableRoomsSection;
