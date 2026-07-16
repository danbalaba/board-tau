import Heading from "@/components/common/Heading";
import MultiSelectGrid from "@/components/inputs/MultiSelectGrid";
import { roomAmenities } from "@/data/roomAmenities";
import { ROOM_TYPES } from "@/data/roomTypes";
import { motion } from "framer-motion";

interface RoomAmenitiesStepProps {
  roomType: string;
  roomAmenitiesSelected: string[];
  toggleMulti: (id: "roomAmenities", value: string) => void;
}

export default function RoomAmenitiesStep({
  roomType,
  roomAmenitiesSelected,
  toggleMulti,
}: RoomAmenitiesStepProps) {
  const isSolo = roomType === ROOM_TYPES.SOLO;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <Heading
        title={isSolo ? "Solo Room Amenities" : "Bedspace Amenities"}
        subtitle={`Select the amenities you want in your ${isSolo ? "solo room" : "bedspace"}.`}
        helpText="These are strict requirements inside your specific room. If you check 'Air Conditioning', only rooms with AC will be shown."
      />
      <div className="mt-2">
        <MultiSelectGrid
          options={roomAmenities
            .filter(amenity => !amenity.applicableTo || amenity.applicableTo.includes(roomType as any))
            .map((a) => ({ label: a.label, value: a.value, icon: a.icon, description: a.description }))}
          selected={roomAmenitiesSelected}
          onToggle={(v) => toggleMulti("roomAmenities", v)}
        />
      </div>
    </motion.div>
  );
}
