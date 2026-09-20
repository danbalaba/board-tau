"use client";
import React, { useState, useMemo, useEffect } from "react";
import Modal from "../../modals/Modal";
import { toast } from "react-hot-toast";
import { X, Eye, Filter, ArrowUpDown, Users, Layers, CheckCircle2, XCircle, Info, ChevronDown, Check, Wrench } from "lucide-react";
import { ModernSlider } from "@/components/common/ModernSlider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/helper";
import SafeImage from "../../common/SafeImage";
import { formatCleanTitle } from "@/lib/utils";
import {
  getCachedRoomTypes,
  getSyncRoomTypes
} from "@/lib/landlordTaxonomyCache";

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

type SortOption = "price-asc" | "price-desc" | "capacity-desc";

const sortOptions = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "capacity-desc", label: "Capacity: Most Guests" },
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
        className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary/40 rounded-2xl px-4 py-2.5 transition-all group cursor-pointer"
      >
        {icon && <div className="shrink-0 text-primary/70">{icon}</div>}
        <span className="flex-1 text-left font-black tracking-tight text-gray-900 dark:text-white uppercase text-[11px] sm:text-[12px] truncate">
          {selectedOption?.label}
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
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-60 overflow-y-auto custom-scrollbar"
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
                    "w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer",
                    value === option.value 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && <span className="shrink-0 opacity-80">{option.icon}</span>}
                    <span className="font-black tracking-tight text-[11px] uppercase">{option.label}</span>
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
  user,
  onViewDetails,
  onInquire,
}) => {
  const [roomTypesList, setRoomTypesList] = useState<any[]>(() => getSyncRoomTypes() || []);
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Math.max(...rooms.map(r => r.price), 0)]);
  const [sortOption, setSortOption] = useState<SortOption>("price-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    getCachedRoomTypes().then(rts => { if (rts) setRoomTypesList(rts); });
  }, []);

  // Helper to map raw roomType strings to clean student-friendly taxonomy labels
  const getRoomTypeLabel = (rawType: string) => {
    if (!rawType) return "Standard Room";
    const target = String(rawType).trim();
    const matched = roomTypesList.find((rt: any) =>
      rt.id === target ||
      rt.code === target ||
      rt.name === target ||
      rt.name?.toLowerCase() === target.toLowerCase() ||
      rt.code?.toLowerCase() === target.toLowerCase() ||
      rt.id?.toLowerCase() === target.toLowerCase()
    );
    if (matched?.name) return matched.name;
    if (target.toUpperCase() === 'SOLO') return 'Private Solo Room';
    if (target.toUpperCase() === 'BEDSPACE') return 'Shared Bedspace';
    return rawType;
  };

  // Dynamically generate filter dropdown options from actual room data & taxonomy cache
  const roomTypeOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Room Types", icon: <Layers size={14} /> }];
    const typesInRooms = Array.from(new Set(rooms.map(r => r.roomType).filter(Boolean)));
    typesInRooms.forEach(typeCode => {
      const label = getRoomTypeLabel(typeCode);
      options.push({
        value: typeCode,
        label,
        icon: <Layers size={14} />
      });
    });
    return options;
  }, [rooms, roomTypesList]);

  // Trigger a brief loading state for UX feedback
  const triggerFilteringState = () => {
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 250);
  };

  const handleRoomTypeChange = (val: string) => {
    setRoomTypeFilter(val);
    triggerFilteringState();
  };

  const handleSortChange = (val: SortOption) => {
    setSortOption(val);
    triggerFilteringState();
  };

  const maxPrice = useMemo(() => Math.max(...rooms.map(r => r.price), 0), [rooms]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange([priceRange[0], value[0]]);
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
      result = result.filter(room => {
        if (room.roomType === roomTypeFilter) return true;
        const roomLabel = getRoomTypeLabel(room.roomType);
        const targetLabel = getRoomTypeLabel(roomTypeFilter);
        return roomLabel.toLowerCase() === targetLabel.toLowerCase();
      });
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
  }, [rooms, roomTypeFilter, priceRange, sortOption, roomTypesList]);

  const handleInquireClick = (room: Room) => {
    if (!user) {
      toast.error('Please sign in to send an inquiry.');
      return;
    }
    onInquire(room);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
      {/* Main Content Container */}
      <div className="flex flex-col max-h-[85vh] sm:max-h-[75vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 shrink-0 relative z-30 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-1">
                Available Rooms
              </h2>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest opacity-80">
                {formatCleanTitle(listingName)} • {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'} Available
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all group cursor-pointer"
            >
              <X className="text-xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
            </button>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer ${
                showFilters
                  ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary/40 bg-gray-50/80 dark:bg-gray-800/50"
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

            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-auto opacity-70">
              {filteredRooms.length} {filteredRooms.length === 1 ? 'Match' : 'Matches'} Found
            </span>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 p-5 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 relative z-40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Room Type Filter */}
                <div>
                  <label className="block text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2.5 ml-1">
                    Room Type
                  </label>
                  <ModalDropdown
                    options={roomTypeOptions}
                    value={roomTypeFilter}
                    onChange={(val) => handleRoomTypeChange(val)}
                    icon={<Layers size={16} />}
                    className="w-full"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2.5 ml-1">
                    Max Price: ₱{priceRange[1].toLocaleString()} / month
                  </label>
                  <div className="flex gap-4 items-center bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
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
                      className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors px-2 cursor-pointer"
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30 dark:bg-gray-900/20 relative">
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
                  <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                    Updating Rooms...
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
              <div className="w-14 h-14 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                 <Info size={28} className="text-gray-400" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                No rooms match your filter criteria
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 transition-all duration-300",
              isFiltering ? "opacity-50 blur-sm grayscale-[0.3]" : "opacity-100 blur-0"
            )}>
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="group bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-500 flex flex-col"
                >
                  {/* Room Image */}
                  <div className="h-44 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <SafeImage
                      src={(room.images && room.images.length > 0) ? room.images[0].url : (room.imageSrc || "/images/placeholder.jpg")}
                      alt={room.name}
                    />
                    
                    {/* Status Badge with Live Pulsing Dot */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-md shadow-md border",
                        room.status === "AVAILABLE"
                          ? "bg-[#2f7d6d] text-white border-white/30"
                          : room.status === "MAINTENANCE"
                          ? "bg-amber-600 text-white border-white/30"
                          : "bg-rose-600 text-white border-white/30"
                      )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {room.status === "AVAILABLE" ? "Available" : room.status === "MAINTENANCE" ? "Under Maintenance" : "Fully Occupied"}
                      </div>
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-black text-lg text-gray-900 dark:text-gray-100 mb-1 truncate tracking-tight">
                      {formatCleanTitle(room.name)}
                    </h3>
                    
                    <div className="flex items-baseline gap-1.5 mb-5">
                      <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                        ₱{room.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ month</span>
                    </div>

                    {/* Stats Icons without technical jargon */}
                    <div className="grid grid-cols-2 gap-2.5 mb-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                       <div className="flex items-center gap-2 bg-gray-50/70 dark:bg-gray-900/30 p-2.5 rounded-2xl border border-gray-100/80 dark:border-gray-700/40">
                         <div className="p-1 rounded-lg bg-primary/10 text-primary">
                           <Layers size={13} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 truncate">
                           {getRoomTypeLabel(room.roomType)}
                         </span>
                       </div>

                       <div className="flex items-center gap-2 bg-gray-50/70 dark:bg-gray-900/30 p-2.5 rounded-2xl border border-gray-100/80 dark:border-gray-700/40">
                         <div className="p-1 rounded-lg bg-primary/10 text-primary">
                           <Users size={13} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                           {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
                         </span>
                       </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-2.5">
                      <button
                        onClick={() => onViewDetails(room)}
                        className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Eye size={14} />
                        View Details
                      </button>

                      <button
                        onClick={() => handleInquireClick(room)}
                        disabled={room.status !== "AVAILABLE"}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          room.status === "AVAILABLE"
                            ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {room.status === "AVAILABLE" ? "Inquire" : room.status === "MAINTENANCE" ? "Under Maintenance" : "Occupied"}
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
      <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <button
          className="w-full sm:w-auto px-10 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm cursor-pointer"
          onClick={onClose}
        >
          <X size={14} /> Close
        </button>
      </div>
    </Modal>
  );
};

export default AllRoomsModal;
