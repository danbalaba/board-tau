import React from "react";
import { FaUser, FaRulerCombined, FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
  // Get key amenities (first 3)
  const keyAmenities = room.amenities?.slice(0, 3) || [];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-0 left-0 right-0 z-20"
        >
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-primary/20 p-4 shadow-2xl rounded-b-card">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Room Sneak Peek
                </span>
                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {room.roomType}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <FaUser className="text-primary/60" size={12} />
                  <span className="text-xs font-semibold text-text-primary dark:text-gray-200">
                    {room.capacity} Full Capacity
                  </span>
                </div>
                {room.size && (
                  <div className="flex items-center gap-1.5">
                    <FaRulerCombined className="text-primary/60" size={12} />
                    <span className="text-xs font-semibold text-text-primary dark:text-gray-200">
                      {room.size} sq.m.
                    </span>
                  </div>
                )}
              </div>

              {keyAmenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {keyAmenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300"
                    >
                      <FaCheckCircle className="text-primary" size={10} />
                      <span>{amenity}</span>
                    </div>
                  ))}
                  {(room.amenities?.length || 0) > 3 && (
                    <span className="text-[10px] text-primary font-bold">
                      +{room.amenities!.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails();
                  }}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                >
                  View Details
                  <motion.span
                    animate={{ x: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
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
