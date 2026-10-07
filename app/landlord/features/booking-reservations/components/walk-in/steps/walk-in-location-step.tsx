import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { WalkInFormData } from "@/app/landlord/features/booking-reservations/hooks/use-walk-in-modal";
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, DoorOpen, Search, X, Check, RotateCcw } from "lucide-react";
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

  const handleSelectProperty = (listingId: string) => {
    setValue("listingId", listingId, { shouldValidate: true });
    setValue("roomId", "", { shouldValidate: true }); // Reset room selection
  };

  const handleResetProperty = () => {
    setValue("listingId", "", { shouldValidate: true });
    setValue("roomId", "", { shouldValidate: true });
  };

  return (
    <div className="space-y-5">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Building2 size={18} />
            </div>
            <span>
              {selectedListing ? "Step 1: Select Available Room" : "Step 1: Select Property Listing"}
            </span>
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {selectedListing
              ? `Choose an available room inside ${selectedListing.title}.`
              : "Select a property listing to view its available rooms."}
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shrink-0">
          {selectedListing ? "Phase 2: Room Selection" : "Phase 1: Property Selection"}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!selectedListingId ? (
          /* PHASE 1: SELECT PROPERTY LISTING */
          <motion.div
            key="property-selection"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-4"
          >
            {/* Search Property */}
            <div className="flex items-center justify-between gap-4">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">
                Available Properties ({filteredListings.length})
              </label>
              <div className="relative w-full max-w-[220px] sm:max-w-[280px] group">
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

            {/* Property Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto custom-scrollbar p-1">
              {filteredListings.map((listing) => {
                const availableRoomCount = listing.rooms?.filter((r: any) => r.status !== 'FULL')?.length || 0;
                return (
                  <div
                    key={listing.id}
                    onClick={() => handleSelectProperty(listing.id)}
                    className="p-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5 select-none group"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 relative">
                      <SafeImage
                        src={listing.images?.[0]?.url || listing.imageSrc}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {listing.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {listing.rooms?.length || 0} Rooms
                        </span>
                        <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                          {availableRoomCount} Available
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-primary group-hover:text-white text-gray-400 flex items-center justify-center shrink-0 transition-all">
                      <DoorOpen size={16} />
                    </div>
                  </div>
                );
              })}
              {filteredListings.length === 0 && (
                <div className="p-8 text-center col-span-2 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  <Building2 size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-500">No properties found matching "{propertySearch}".</p>
                </div>
              )}
            </div>
            {errors.listingId && <p className="text-xs text-rose-500 font-bold animate-in fade-in">{errors.listingId.message}</p>}
          </motion.div>
        ) : (
          /* PHASE 2: SELECT ROOM IN SELECTED PROPERTY */
          <motion.div
            key="room-selection"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-4"
          >
            {/* Selected Property Header Banner */}
            <div className="p-3.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-primary/20 shadow-xs">
                  <SafeImage
                    src={selectedListing?.images?.[0]?.url || selectedListing?.imageSrc}
                    alt={selectedListing?.title || "Property"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-primary text-white px-2 py-0.5 rounded-full">
                      Selected Property
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate mt-0.5">
                    {selectedListing?.title}
                  </h4>
                </div>
              </div>

              {/* Action Button: Change Property */}
              <button
                type="button"
                onClick={handleResetProperty}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-200 hover:text-primary rounded-xl text-xs font-extrabold shadow-xs transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                <RotateCcw size={13} className="text-primary" />
                <span>Change Property</span>
              </button>
            </div>

            {/* Room Search & Filter */}
            <div className="flex items-center justify-between gap-4">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">
                Select Available Room ({filteredRooms.length})
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

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
              {filteredRooms.map((room: any) => (
                <div
                  key={room.id}
                  onClick={() => setValue("roomId", room.id, { shouldValidate: true })}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-2.5 select-none ${
                    selectedRoomId === room.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{room.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                        {room.roomTypeDefinition?.name || room.roomType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/20 shrink-0">
                        {room.availableSlots} Slots Left
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedRoomId === room.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-transparent'
                      }`}>
                        {selectedRoomId === room.id && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>Monthly Rate:</span>
                    <span className="text-primary font-black text-sm">₱{room.price?.toLocaleString() || 0}/mo</span>
                  </div>
                </div>
              ))}

              {filteredRooms.length === 0 && (
                <div className="p-8 text-center col-span-2 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  <DoorOpen size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-500">
                    No available rooms found{roomSearch ? ` matching "${roomSearch}"` : " in this property"}.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetProperty}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline cursor-pointer"
                  >
                    <RotateCcw size={12} /> Pick another property
                  </button>
                </div>
              )}
            </div>

            {errors.roomId && <p className="text-xs text-rose-500 font-bold animate-in fade-in">{errors.roomId.message}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalkInLocationStep;
