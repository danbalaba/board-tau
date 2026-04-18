"use client";
import React, { useState, useMemo } from "react";
import Button from "@/components/common/Button";
import Modal from "../../modals/Modal";
import { toast } from "react-hot-toast";
import { X, Eye, Filter, ArrowUpDown, DollarSign, Users, Layers, DoorOpen, CheckCircle2, XCircle, Info } from "lucide-react";
import ModernSelect from "@/components/common/ModernSelect";
import { ModernSlider } from "@/components/common/ModernSlider";

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

interface AllRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  listingName: string;
  listingId: string;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  user?: any;
  onViewDetails: (room: Room) => void;
  onInquire: (room: Room) => void;
}

type RoomTypeFilter = "all" | "SOLO" | "BEDSPACE";
type SortOption = "price-asc" | "price-desc" | "capacity-desc";

const sortOptions = [
  { value: "price-asc", label: "Price: Low to High", icon: <DollarSign size={16} className="opacity-50" /> },
  { value: "price-desc", label: "Price: High to Low", icon: <DollarSign size={16} /> },
  { value: "capacity-desc", label: "Capacity: High to Low", icon: <Info size={16} /> },
];

const roomTypeOptions = [
  { value: "all", label: "All Types", icon: <Filter size={16} className="opacity-50" /> },
  { value: "SOLO", label: "Solo Room", icon: <Filter size={16} /> },
  { value: "BEDSPACE", label: "Bedspace", icon: <Filter size={16} /> },
];

const AllRoomsModal: React.FC<AllRoomsModalProps> = ({
  isOpen,
  onClose,
  rooms,
  listingName,
  listingId,
  onSubmit,
  isLoading,
  user,
  onViewDetails,
  onInquire,
}) => {
  const [roomTypeFilter, setRoomTypeFilter] = useState<RoomTypeFilter>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Math.max(...rooms.map(r => r.price), 0)]);
  const [sortOption, setSortOption] = useState<SortOption>("price-asc");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    // Apply room type filter
    if (roomTypeFilter !== "all") {
      result = result.filter(room => room.roomType === roomTypeFilter);
    }

    // Apply price filter
    result = result.filter(
      room => room.price >= priceRange[0] && room.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "capacity-desc":
        result.sort((a, b) => b.capacity - a.capacity);
        break;
    }

    return result;
  }, [rooms, roomTypeFilter, priceRange, sortOption]);

  // Get max price for range slider
  const maxPrice = Math.max(...rooms.map(r => r.price), 0);

  const handleInquireClick = (room: Room) => {
    if (!user) {
      toast.error("Please log in to inquire");
      return;
    }
    onInquire(room);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
      <div className="max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-gray-100">
                Available Rooms
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {listingName} - {rooms.length} rooms total
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="text-xl text-gray-500" />
            </button>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showFilters
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Filter size={16} />
              <span className="text-sm font-medium">Filters</span>
            </button>

            <div className="flex items-center gap-2">
              <ModernSelect
                instanceId="sort-rooms"
                options={sortOptions}
                value={sortOption}
                onChange={(val) => setSortOption(val as SortOption)}
                icon={<ArrowUpDown size={18} />}
                className="md:w-max min-w-[280px]"
              />
            </div>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredRooms.length} rooms shown
            </span>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Type
                  </label>
                  <ModernSelect
                    instanceId="room-type-filter"
                    options={roomTypeOptions}
                    value={roomTypeFilter}
                    onChange={(val) => setRoomTypeFilter(val as RoomTypeFilter)}
                    icon={<Filter size={18} />}
                    className="w-full"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range: ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
                  </label>
                  <div className="flex gap-2 items-center">
                    <ModernSlider
                      min={0}
                      max={maxPrice}
                      step={100}
                      value={[priceRange[1]]}
                      onValueChange={(value: number[]) => setPriceRange([priceRange[0], value[0]])}
                      className="flex-1"
                    />
                    <button
                      onClick={() => setPriceRange([0, maxPrice])}
                      className="text-sm text-primary hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Room Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <Info className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No rooms match your filters
              </p>
              <button
                onClick={() => {
                  setRoomTypeFilter("all");
                  setPriceRange([0, maxPrice]);
                }}
                className="mt-4 text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="group bg-white dark:bg-gray-800 rounded-[1.5rem] overflow-hidden border border-gray-100 dark:border-gray-700/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl relative flex flex-col"
                >
                  {/* Room Image */}
                  <div className="h-40 w-full relative overflow-hidden">
                    <img
                      src={(room.images && room.images.length > 0) ? room.images[0].url : "/images/placeholder.jpg"}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1 ${
                          room.status === "AVAILABLE"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-rose-500/90 text-white"
                        }`}
                      >
                        {room.status === "AVAILABLE" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {room.status === "AVAILABLE" ? "Available" : "Full"}
                      </div>
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[14px] text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {room.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-lg font-black text-primary dark:text-primary">
                        ₱{room.price.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500">/mo</span>
                    </div>

                    {/* Stats Icons */}
                    <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-gray-50 dark:border-gray-700/50">
                       <div className="flex items-center gap-1.5">
                         <Layers size={13} className="text-primary/60" />
                         <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{room.roomType}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <Users size={13} className="text-primary/60" />
                         <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{room.capacity} Pax</span>
                       </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => onViewDetails(room)}
                        className="flex-1 py-2 text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100 dark:border-gray-600/50 flex items-center justify-center gap-1.5"
                      >
                        <Eye size={13} />
                        Details
                      </button>

                      <button
                        onClick={() => handleInquireClick(room)}
                        disabled={room.status !== "AVAILABLE"}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
                          room.status === "AVAILABLE"
                            ? "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/10"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {room.status === "AVAILABLE" ? "Inquire" : "Full"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 flex justify-end shrink-0">
          <Button
            className="w-auto px-10 flex items-center gap-2"
            variant="secondary"
            outline
            onClick={onClose}
          >
            <X size={16} /> Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AllRoomsModal;
