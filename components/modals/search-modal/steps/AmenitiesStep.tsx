import React, { useEffect, useState } from "react";
import Heading from "@/components/common/Heading";
import MultiSelectGrid from "@/components/inputs/MultiSelectGrid";
import { motion } from "framer-motion";
import { useAttributes } from "@/hooks/useAttributes";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";
import { Loader2 } from "lucide-react";

interface AmenitiesStepProps {
  amenitiesSelected: string[];
  propertyTypeSelected: string[];
  toggleMulti: (id: "amenities", value: string) => void;
}

export default function AmenitiesStep({ 
  amenitiesSelected, 
  propertyTypeSelected,
  toggleMulti 
}: AmenitiesStepProps) {
  const [propertyAmenities, setPropertyAmenities] = useState<any[]>([]);
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

      setPropertyAmenities(filteredData.filter((a: any) => a.type === 'AMENITY').map((a: any) => ({
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
        title="Property Amenities"
        subtitle="Amenities shared by everyone in the building."
        helpText="These are common areas or facilities available to all tenants in the property (e.g. Shared Kitchen, Lounge)."
      />
      <div className="mt-2">
        {isLoadingAttributes ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <MultiSelectGrid
            options={propertyAmenities}
            selected={amenitiesSelected}
            onToggle={(v) => toggleMulti("amenities", v)}
          />
        )}
      </div>
    </motion.div>
  );
}
