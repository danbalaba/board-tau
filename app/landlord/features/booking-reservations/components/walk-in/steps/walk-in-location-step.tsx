import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { WalkInFormData } from "../../../hooks/use-walk-in-modal";
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, DoorOpen, Search, X } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";

interface WalkInLocationStepProps {
  listings: any[]; // The landlord's listings
  register: UseFormRegister<WalkInFormData>;
  errors: FieldErrors<WalkInFormData>;
  setValue: UseFormSetValue<WalkInFormData>;
  watch: UseFormWatch<WalkInFormData>;
}

const WalkInLocationStep: React.FC<WalkInLocationStepProps> = ({ listings, register, errors, setValue, watch }) => {
  const selectedListingId = watch("listingId");
  const selectedRoomId = watch("roomId");

  const selectedListing = listings.find((l) => l.id === selectedListingId);
  const rooms = selectedListing?.rooms || [];

  const [propertySearch, setPropertySearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const filteredRooms = rooms.filter((r: any) => 
    r.status !== 'FULL' && r.name.toLowerCase().includes(roomSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Building2 className="text-primary" size={20} />
          Step 1: Select Property & Room
        </h3>
        <p className="text-xs text-gray-500">Choose the listing and room for the walk-in guest.</p>
      </div>

      <div className="space-y-4">
        {/* Listing Selection */}
        <div>
          <div className="flex items-center justify-between mb-2 gap-4">
            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">
              Select Property
            </label>
            <div className="relative w-full max-w-[200px] sm:max-w-[250px] group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search properties..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium"
              />
              <AnimatePresence>
                {propertySearch && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => setPropertySearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={12} strokeWidth={3} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => {
                  setValue("listingId", listing.id, { shouldValidate: true });
                  setValue("roomId", "", { shouldValidate: true }); // Reset room
                }}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  selectedListingId === listing.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-gray-100 dark:border-gray-800 hover:border-primary/50"
                }`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                  <SafeImage
                    src={listing.images?.[0]?.url || listing.imageSrc}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {listing.title}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">{listing.rooms.length} Rooms</p>
                </div>
              </div>
            ))}
            {filteredListings.length === 0 && (
              <p className="text-sm text-gray-500 italic p-4 text-center col-span-2">
                No properties found matching "{propertySearch}".
              </p>
            )}
          </div>
          {errors.listingId && <p className="text-xs text-rose-500 mt-2 font-bold">{errors.listingId.message}</p>}
        </div>

        {/* Room Selection */}
        {selectedListingId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-4 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-2 gap-4">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">
                Select Room
              </label>
              <div className="relative w-full max-w-[200px] sm:max-w-[250px] group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={14} />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                />
                <AnimatePresence>
                  {roomSearch && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={() => setRoomSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X size={12} strokeWidth={3} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
              {filteredRooms.map((room: any) => (
                <div
                  key={room.id}
                  onClick={() => setValue("roomId", room.id, { shouldValidate: true })}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-2 ${
                    selectedRoomId === room.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-100 dark:border-gray-800 hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{room.name}</p>
                    <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">
                      {room.availableSlots} Slots Left
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1">
                      <DoorOpen size={14} /> {room.roomType}
                    </span>
                    <span className="text-primary">₱{room.reservationFee} Fee</span>
                  </div>
                </div>
              ))}
              {filteredRooms.length === 0 && (
                <p className="text-sm text-gray-500 italic p-4 text-center col-span-2">
                  No available rooms found{roomSearch ? ` matching "${roomSearch}"` : " in this property"}.
                </p>
              )}
            </div>
            {errors.roomId && <p className="text-xs text-rose-500 mt-2 font-bold">{errors.roomId.message}</p>}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WalkInLocationStep;
