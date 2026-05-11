"use client";
import React, { useState, useMemo } from "react";
import Button from "@/components/common/Button";
import Modal from "../../modals/Modal";
import { toast } from "react-hot-toast";
import { X, Eye, Filter, ArrowUpDown, DollarSign, Users, Layers, DoorOpen, CheckCircle2, XCircle, Info, ChevronDown, Check } from "lucide-react";
import { ModernSlider } from "@/components/common/ModernSlider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/helper";
import SafeImage from "../../common/SafeImage";

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
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "capacity-desc", label: "Capacity: High to Low" },
];

const roomTypeOptions = [
  { value: "all", label: "All Types", icon: <Layers size={14} /> },
  { value: "SOLO", label: "Solo Room", icon: <Layers size={14} /> },
  { value: "BEDSPACE", label: "Bedspace", icon: <Layers size={14} /> },
];

// Local Modal-Safe Dropdown Component
const ModalDropdown = ({ 
  options, 
  value, 
  onChange, 
  icon, 
  className 
}: { 
  options: any[], 
  value: string, 
  onChange: (val: string) => void, 
  icon?: React.ReactNode,
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary/40 rounded-2xl px-4.5 py-2.5 transition-all group"
      >
        {icon && <div className="shrink-0 text-primary/60">{icon}</div>}
        <span className="flex-1 text-left font-black tracking-tight text-gray-900 dark:text-white uppercase text-[11px] sm:text-[13px] truncate">
          {selectedOption.label}
        </span>
        <div className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-primary",
          isOpen && "bg-primary/20 text-primary rotate-180"
        )}>
          <ChevronDown size={12} strokeWidth={3} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden py-2"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4.5 py-3 transition-colors",
                    value === option.value 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && <span className="shrink-0 opacity-80">{option.icon}</span>}
                    <span className="font-black tracking-tight text-[12px] uppercase">{option.label}</span>
                  </div>
                  {value === option.value && (
                    <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check size={10} className="text-primary" strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [isFiltering, setIsFiltering] = useState(false);
  const lastInquiryToastTime = React.useRef<number>(0);

  // Trigger a brief loading state for UX feedback
  const triggerFilteringState = () => {
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleRoomTypeChange = (val: RoomTypeFilter) => {
    setRoomTypeFilter(val);
    triggerFilteringState();
  };

  const handleSortChange = (val: SortOption) => {
    setSortOption(val);
    triggerFilteringState();
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([priceRange[0], value[0]]);
    // Use a smaller timeout for the slider to keep it snappy
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 200);
    return () => clearTimeout(timer);
  };

  const handleClearFilters = () => {
    setRoomTypeFilter("all");
    setPriceRange([0, maxPrice]);
    triggerFilteringState();
  };

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
        result.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        break;
      case "capacity-desc":
        result.sort((a, b) => b.capacity - a.capacity || a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        break;
    }

    return result;
  }, [rooms, roomTypeFilter, priceRange, sortOption]);

  // Get max price for range slider
  const maxPrice = Math.max(...rooms.map(r => r.price), 0);

  const handleInquireClick = (room: Room) => {
    if (!user) {
      const now = Date.now();
      if (now - lastInquiryToastTime.current > 5000) {
        toast.error("Please log in to inquire");
        lastInquiryToastTime.current = now;
      }
      return;
    }
    onInquire(room);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
      {/* Main Content Container - Matches 85vh Sibling-Footer Pattern */}
      <div className="flex flex-col max-h-[85vh] sm:max-h-[75vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 shrink-0 relative z-30 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-gray-100 uppercase tracking-tight">
                Available Rooms
              </h2>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest opacity-60">
                {listingName} • {rooms.length} Units Total
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all group"
            >
              <X className="text-xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
            </button>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                showFilters
                  ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                  : "border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
              }`}
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2">
              <ModalDropdown
                options={sortOptions}
                value={sortOption}
                onChange={(val) => handleSortChange(val as SortOption)}
                icon={<ArrowUpDown size={16} />}
                className="w-full sm:w-max sm:min-w-[220px]"
              />
            </div>

            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-auto opacity-60">
              {filteredRooms.length} Matches Found
            </span>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 p-5 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 relative z-40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Room Type Filter */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Room Type
                  </label>
                  <ModalDropdown
                    options={roomTypeOptions}
                    value={roomTypeFilter}
                    onChange={(val) => handleRoomTypeChange(val as RoomTypeFilter)}
                    icon={<Layers size={16} />}
                    className="w-full"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Price Range: ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
                  </label>
                  <div className="flex gap-4 items-center bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <ModernSlider
                      min={0}
                      max={maxPrice}
                      step={100}
                      value={[priceRange[1]]}
                      onValueChange={handlePriceChange}
                      className="flex-1"
                    />
                    <button
                      onClick={handleClearFilters}
                      className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors px-2"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Room Grid Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/20 dark:bg-gray-900/10 relative">
          <AnimatePresence mode="wait">
            {isFiltering ? (
              <motion.div
                key="filtering-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                    Filtering...
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                 <Info size={32} className="text-gray-400" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-gray-500">
                No rooms match your filters
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 transition-all duration-300",
              isFiltering ? "opacity-50 blur-sm grayscale-[0.5]" : "opacity-100 blur-0"
            )}>
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="group bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col"
                >
                  {/* Room Image */}
                  <div className="h-44 w-full relative overflow-hidden">
                    <SafeImage
                      src={(room.images && room.images.length > 0) ? room.images[0].url : (room.imageSrc || "/images/placeholder.jpg")}
                      alt={room.name}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div
                        className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 ${
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
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-black text-lg text-gray-900 dark:text-gray-100 mb-1 truncate tracking-tight">
                      {room.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                        ₱{room.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/mo</span>
                    </div>

                    {/* Stats Icons */}
                    <div className="grid grid-cols-2 gap-3 mb-6 pt-5 border-t border-gray-50 dark:border-gray-700/50">
                       <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/30 p-2.5 rounded-xl border border-gray-100/50 dark:border-gray-700/30">
                         <Layers size={14} className="text-primary/60" />
                         <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 truncate">{room.roomType}</span>
                       </div>
                       <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/30 p-2.5 rounded-xl border border-gray-100/50 dark:border-gray-700/30">
                         <Users size={14} className="text-primary/60" />
                         <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">{room.capacity} Pax</span>
                       </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-3">
                      <button
                        onClick={() => onViewDetails(room)}
                        className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Eye size={14} />
                        Details
                      </button>

                      <button
                        onClick={() => handleInquireClick(room)}
                        disabled={room.status !== "AVAILABLE"}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          room.status === "AVAILABLE"
                            ? "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50"
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
      </div>

      {/* Footer - Sibling for 85vh Alignment */}
      <div className="p-4 sm:p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <button
          className="w-full sm:w-auto px-10 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
          onClick={onClose}
        >
          <X size={14} /> Close
        </button>
      </div>
    </Modal>
  );
};

export default AllRoomsModal;
