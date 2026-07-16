import Heading from "@/components/common/Heading";
import Select from "@/components/inputs/Select";
import Input from "@/components/inputs/Input";
import Counter from "@/components/inputs/Counter";
import { bedTypeOptions } from "@/data/roomAmenities";
import { ROOM_TYPES } from "@/data/roomTypes";
import { FieldErrors, FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";
import { motion } from "framer-motion";

interface BedSetupStepProps {
  roomType: string;
  bedType: string;
  setCustomValue: (id: string, value: any) => void;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  watch: UseFormWatch<FieldValues>;
}

export default function BedSetupStep({
  roomType,
  bedType,
  setCustomValue,
  register,
  errors,
  watch
}: BedSetupStepProps) {
  if (roomType === ROOM_TYPES.SOLO) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col gap-6"
      >
        <Heading
          title="Solo Room Setup"
          subtitle="Configure the physical setup of the room."
        />
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5 rounded-xl flex flex-col gap-4 mt-2">
          <Select
            id="bedType"
            label="Bed type"
            helpText="For Solo Rooms, this is typically a Single or Double bed."
            options={[{ value: "", label: "Any bed type" }, ...bedTypeOptions.filter(option => ["SINGLE", "DOUBLE", "QUEEN"].includes(option.value))]}
            value={bedType}
            onChange={(v) => setCustomValue("bedType", v)}
          />
          <Input
            id="roomSize"
            label="Room size (sq. meters)"
            helpText="Optional: Filter by how large the physical room is."
            type="number"
            register={register}
            errors={errors}
            watch={watch}
            required={false}
            placeholder="e.g., 15"
          />
        </div>
      </motion.div>
    );
  }

  if (roomType === ROOM_TYPES.BEDSPACE) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col gap-6"
      >
        <Heading
          title="Bedspace Setup"
          subtitle="Configure your bedspace and room capacity."
        />
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5 rounded-xl flex flex-col gap-4 mt-2">
          <Select
            id="bedType"
            label="Bed type"
            helpText="Bedspaces almost always use Bunk Beds (Double Decks). If you have no preference, select 'Any'."
            options={[{ value: "", label: "Any bed type" }, ...bedTypeOptions.filter(option => ["SINGLE", "BUNK"].includes(option.value))]}
            value={bedType}
            onChange={(v) => setCustomValue("bedType", v)}
          />
          <div className="pt-2 pb-2">
            <Counter
              title="Room capacity"
              subtitle="Total number of occupants/beds in the entire room"
              helpText="Limits the maximum crowd size. If you don't want to live with more than 3 other people, set this to 4."
              watch={watch}
              onChange={setCustomValue}
              name="capacity"
              minValue={2}
            />
          </div>
          <div className="pt-2 pb-2 border-t border-gray-100 dark:border-gray-700">
            <Counter
              title="Available beds needed"
              subtitle="How many empty beds do you and your friends need right now?"
              helpText="Set this to exactly how many friends you are moving in with. If you are moving in alone, set it to 1."
              watch={watch}
              onChange={setCustomValue}
              name="availableSlots"
              minValue={1}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
