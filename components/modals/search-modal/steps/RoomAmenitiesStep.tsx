import React, { useEffect, useState } from "react";
import Heading from "@/components/common/Heading";
import MultiSelectGrid from "@/components/inputs/MultiSelectGrid";
import { motion } from "framer-motion";
import { useAttributes } from "@/hooks/useAttributes";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";
import { Loader2 } from "lucide-react";

interface RoomAmenitiesStepProps {
  roomAmenitiesSelected: string[];
  propertyTypeSelected: string[];
  toggleMulti: (id: "roomAmenities", value: string) => void;
}

export default function RoomAmenitiesStep({ 
  roomAmenitiesSelected, 
  propertyTypeSelected,
  toggleMulti 
}: RoomAmenitiesStepProps) {
  const [roomAmenities, setRoomAmenities] = useState<any[]>([]);
  const { data: attributesData, isLoading: isLoadingAttributes } = useAttributes();
  const { data: propertyTypesData } = usePropertyTypes();

  useEffect(() => {
    if (attributesData) {
      const selectedTypeIds = (propertyTypesData || [])
        .filter((pt: any) => propertyTypeSelected.includes(pt.name) || propertyTypeSelected.includes(pt.id))
        .map((pt: any) => pt.id);

      const filteredData = attributesData.filter((a: any) => {
        if (!a.propertyTypeIds || a.propertyTypeIds.length === 0) return true;
        return selectedTypeIds.some((id: string) => a.propertyTypeIds.includes(id)) || propertyTypeSelected.some((name: string) => a.propertyTypeIds.includes(name));
      });

      setRoomAmenities(filteredData.filter((a: any) => a.type === 'ROOM_AMENITY').map((a: any) => ({
        label: a.name, value: a.id, icon: a.icon, description: a.description
      })));
    }
  }, [attributesData, propertyTypesData, propertyTypeSelected]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <Heading
        title="Room Amenities"
        subtitle="Specific amenities inside your room or unit."
        helpText="These are features located exclusively inside your personal room or unit (e.g. Private Bath, AC, Desk)."
      />
      <div className="mt-2">
        {isLoadingAttributes ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <MultiSelectGrid
            options={roomAmenities}
            selected={roomAmenitiesSelected}
            onToggle={(v) => toggleMulti("roomAmenities", v)}
          />
        )}
      </div>
    </motion.div>
  );
}
