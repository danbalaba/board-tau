import Heading from "@/components/common/Heading";
import { roomTypeOptions } from "@/utils/constants";
import { motion } from "framer-motion";
import { User, Users } from "lucide-react";
import HelpTooltip from "@/components/common/HelpTooltip";

interface RoomTypeStepProps {
  roomType: string;
  setCustomValue: (id: string, value: any) => void;
}

export default function RoomTypeStep({ roomType, setCustomValue }: RoomTypeStepProps) {
  const options = [{ value: "", label: "Any room type", description: "Search for all available properties regardless of room type." }, ...roomTypeOptions.filter(option => option.value !== "")];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <Heading
        title="Select Room Type"
        subtitle="Choose between solo room or bedspace."
        helpText="A Solo Room is entirely yours. A Bedspace means you are renting a single bed inside a shared room."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {options.map((opt) => {
          const isSelected = roomType === opt.value;
          const isSolo = opt.value === "Solo";
          const isAny = opt.value === "";
          
          return (
            <div 
              key={opt.value}
              onClick={() => setCustomValue("roomType", opt.value)}
              className={`
                flex items-center justify-between p-4 cursor-pointer rounded-xl transition-all duration-200 border bg-white dark:bg-gray-800
                ${isSelected 
                  ? 'border-primary ring-1 ring-primary shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isSelected ? 'text-primary bg-primary/10' : 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}>
                  {isAny ? <Users className="w-5 h-5" /> : isSolo ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {opt.label}
                  </span>
                  {opt.description && <HelpTooltip text={opt.description} />}
                </div>
              </div>
              
              {/* Radio Button Indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
