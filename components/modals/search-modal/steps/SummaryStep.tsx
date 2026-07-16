import Heading from "@/components/common/Heading";
import { colleges } from "@/data/colleges";
import { roomTypeOptions } from "@/utils/constants";
import { categories } from "@/utils/constants";
import { rulesPreferences } from "@/data/rulesPreferences";
import { advancedFilters } from "@/data/advancedFilters";
import { MapPin, Banknote, BedDouble, Tag, CheckSquare, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryStepProps {
  college: string;
  roomType: string;
  isUnlimitedDistance: boolean;
  distance: number;
  minPrice: string | number;
  maxPrice: string | number;
  bedType: string;
  capacity: number;
  roomAmenitiesSelected: string[];
  categoriesSelected: string[];
  amenitiesSelected: string[];
  rulesSelected: string[];
  advancedSelected: string[];
}

const SummaryRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 shadow-sm shadow-primary/5">{icon}</div>
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
      <div className="text-sm text-gray-700 dark:text-gray-200 font-medium">{children}</div>
    </div>
  </div>
);

export default function SummaryStep({
  college,
  roomType,
  isUnlimitedDistance,
  distance,
  minPrice,
  maxPrice,
  bedType,
  capacity,
  roomAmenitiesSelected,
  categoriesSelected,
  amenitiesSelected,
  rulesSelected,
  advancedSelected,
}: SummaryStepProps) {
  const coLabel = colleges.find((c) => c.value === college)?.label ?? "—";
  const roomLabel = roomTypeOptions.find((r) => r.value === roomType)?.label ?? "Any room type";

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <Heading 
        title="Ready to search?" 
        subtitle="Here's a summary of the boarding house you are looking for." 
      />

      <div className="glass-elevated rounded-2xl bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden shadow-md">
        {/* Location */}
        <SummaryRow icon={<MapPin className="w-5 h-5" />} label="Location">
          {isUnlimitedDistance ? "Show all boarding houses in Tarlac" : `Within ${distance} km of ${coLabel}`}
        </SummaryRow>

        {/* Budget */}
        <SummaryRow icon={<Banknote className="w-5 h-5" />} label="Budget">
          {minPrice || maxPrice
            ? `${minPrice ? `₱${Number(minPrice).toLocaleString()}` : "₱0"} – ₱${Number(maxPrice || 0).toLocaleString()} / month`
            : "Any budget"}
        </SummaryRow>

        {/* Room */}
        <SummaryRow icon={<BedDouble className="w-5 h-5" />} label="Room Requirements">
          <div className="flex flex-col gap-2">
            <span>{roomLabel}{bedType ? ` • ${bedType} Bed` : ""}{capacity > 0 ? ` • Capacity: ${capacity}` : ""}</span>
            {(roomAmenitiesSelected).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(roomAmenitiesSelected).map(v => (
                  <span key={v} className="text-[10px] px-2.5 py-1 bg-primary/10 text-primary rounded-md font-bold uppercase tracking-wide border border-primary/20">
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>
        </SummaryRow>

        {/* Categories */}
        {(categoriesSelected).length > 0 && (
          <SummaryRow icon={<Tag className="w-5 h-5" />} label="Property Type">
            <div className="flex flex-wrap gap-2">
              {(categoriesSelected).map(v => (
                <span key={v} className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold">
                  {categories.find(c => c.value === v)?.label ?? v}
                </span>
              ))}
            </div>
          </SummaryRow>
        )}

        {/* Amenities */}
        {(amenitiesSelected).length > 0 && (
          <SummaryRow icon={<CheckSquare className="w-5 h-5" />} label="House Amenities">
            <div className="flex flex-wrap gap-2">
              {(amenitiesSelected).map(v => (
                <span key={v} className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold">
                  {v}
                </span>
              ))}
            </div>
          </SummaryRow>
        )}

        {/* Rules */}
        {(rulesSelected).length > 0 && (
          <SummaryRow icon={<ShieldCheck className="w-5 h-5" />} label="House Rules">
            <div className="flex flex-wrap gap-2">
              {(rulesSelected).map(v => (
                <span key={v} className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold">
                  {rulesPreferences.find(r => r.value === v)?.label ?? v}
                </span>
              ))}
            </div>
          </SummaryRow>
        )}

        {/* Advanced / Priority */}
        {(advancedSelected).length > 0 && (
          <SummaryRow icon={<Star className="w-5 h-5" />} label="Priority Features">
            <div className="flex flex-wrap gap-2">
              {(advancedSelected).map(v => (
                <span key={v} className="text-xs px-3 py-1 bg-primary text-white rounded-lg font-semibold shadow-sm shadow-primary/20">
                  ★ {advancedFilters.find(a => a.value === v)?.label ?? v}
                </span>
              ))}
            </div>
          </SummaryRow>
        )}
      </div>
    </motion.div>
  );
}
