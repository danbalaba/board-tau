import React, { useState, useEffect, useMemo } from "react";
import { Users, Maximize2, CheckCircle2, Layers, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDynamicIcon } from "@/lib/iconResolver";
import { getCachedRoomTypes, getSyncRoomTypes } from "@/lib/landlordTaxonomyCache";

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
}

interface RoomTooltipProps {
  room: Room;
  isVisible: boolean;
  onViewDetails: () => void;
}

const RoomTooltip: React.FC<RoomTooltipProps> = ({ room, isVisible, onViewDetails }) => {
  const [roomTypesList, setRoomTypesList] = useState<any[]>(() => getSyncRoomTypes() || []);

  useEffect(() => {
    getCachedRoomTypes().then(rts => { if (rts) setRoomTypesList(rts); });
  }, []);

  const roomTypeLabel = useMemo(() => {
    if (!room.roomType) return "Standard Room";
    const target = String(room.roomType).trim();
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
    return room.roomType;
  }, [room.roomType, roomTypesList]);

  const parsedAmenities = useMemo(() => {
    const rawList = Array.isArray(room.amenities) ? room.amenities : [];
    return rawList.slice(0, 3).map((item: any) => {
      let rawString = typeof item === 'string' ? item : (item?.name || item?.attribute?.name || item?.label || "Amenity");
      let cleanLabel = rawString;
      if (typeof rawString === 'string') {
        if (rawString.includes('||')) {
          cleanLabel = rawString.split('||')[0].trim();
        } else if (rawString.includes('|')) {
          cleanLabel = rawString.split('|')[0].trim();
        }
      }
      const Icon = getDynamicIcon(rawString, CheckCircle2);
      return { label: cleanLabel, Icon };
    });
  }, [room.amenities]);

  const remainingAmenitiesCount = useMemo(() => {
    const total = Array.isArray(room.amenities) ? room.amenities.length : 0;
    return total > 3 ? total - 3 : 0;
  }, [room.amenities]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 z-30 hidden lg:block pointer-events-none"
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-primary/20 p-4 shadow-2xl rounded-b-[2rem] pointer-events-auto">
            <div className="flex flex-col gap-3">
              {/* Header: Sneak Peek Label + Dynamic Room Type Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
                  <Sparkles size={11} className="opacity-70" />
                  Room Sneak Peek
                </span>
                <div className="flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-wider">
                  <Layers size={10} />
                  <span>{roomTypeLabel}</span>
                </div>
              </div>

              {/* Room Stats: Capacity + Size */}
              <div className="flex items-center gap-4 text-xs font-bold text-gray-800 dark:text-gray-200">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-primary/10 text-primary">
                    <Users size={12} />
                  </div>
                  <span>{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                {room.size && (
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-primary/10 text-primary">
                      <Maximize2 size={12} />
                    </div>
                    <span>{room.size} sq.m.</span>
                  </div>
                )}
              </div>

              {/* Amenities list with resolved dynamic icons */}
              {parsedAmenities.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/60">
                  {parsedAmenities.map((item, index) => {
                    const AmenityIcon = item.Icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300"
                      >
                        <AmenityIcon size={11} className="text-primary shrink-0" />
                        <span className="truncate max-w-[130px]">{item.label}</span>
                      </div>
                    );
                  })}
                  {remainingAmenitiesCount > 0 && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary px-1">
                      +{remainingAmenitiesCount} more
                    </span>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails();
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 group cursor-pointer"
                >
                  View Details
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoomTooltip;
