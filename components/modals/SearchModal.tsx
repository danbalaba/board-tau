"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";

import Modal from "./Modal";
import Button from "../common/Button";
import Heading from "../common/Heading";
import Counter from "../inputs/Counter";
import Input from "../inputs/Input";
import Select from "../inputs/Select";
import Slider from "../inputs/Slider";
import Checkbox from "../inputs/Checkbox";
import MonthPicker from "../inputs/MonthPicker";
import MultiSelectGrid from "../inputs/MultiSelectGrid";
import { FaMapMarkerAlt, FaBed, FaMoneyBillWave, FaListUl, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { Check } from "lucide-react";
import { categories, roomTypeOptions, stayDurationOptions } from "@/utils/constants";
import { amenities } from "@/data/amenities";
import { roomAmenities, bedTypeOptions } from "@/data/roomAmenities";
import { ROOM_TYPES } from "@/data/roomTypes";
import { colleges } from "@/data/colleges";
import { rulesPreferences } from "@/data/rulesPreferences";
import { advancedFilters } from "@/data/advancedFilters";
import { buildSearchUrl } from "@/utils/searchUrlBuilder";

  const Map = dynamic(() => import("../common/Map"), {
    ssr: false,
    loading: () => <div className="h-[240px] rounded-lg bg-gray-100 flex items-center justify-center">Loading map...</div>
  });

enum STEPS {
  COLLEGE = 0,
  BUDGET = 1,
  ROOM_TYPE = 2,
  ROOM_CONFIGURATION = 3,
  LOCATION = 4,
  MOVE_IN = 5,
  CATEGORY = 6,
  AMENITIES = 7,
  RULES = 8,
  ADVANCED = 9,
  SUMMARY = 10,
}

const SearchModal = ({ onCloseModal }: { onCloseModal?: () => void }) => {
  const [step, setStep] = useState(STEPS.COLLEGE);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { handleSubmit, setValue, watch, getValues, register, formState: { errors } } = useForm<FieldValues>({
    defaultValues: {
      college: "any",
      categories: [] as string[],
      distance: 5,
      moveInMonth: "",
      stayDuration: "",
      amenities: [] as string[],
      rules: [] as string[],
      roomType: "",
      bedType: "",
      roomAmenities: [] as string[],
      capacity: "",
      availableSlots: "",
      roomSize: "",
      minPrice: "",
      maxPrice: "",
      advanced: [] as string[],
      isUnlimitedDistance: false,
    },
  });

  const college = watch("college");
  const categoriesSelected = watch("categories") ?? [];
  const distance = watch("distance") ?? 5;
  const moveInMonth = watch("moveInMonth");
  const stayDuration = watch("stayDuration");
  const amenitiesSelected = watch("amenities") ?? [];
  const rulesSelected = watch("rules") ?? [];
  const roomType = watch("roomType");
  const bedType = watch("bedType");
  const roomAmenitiesSelected = watch("roomAmenities") ?? [];
  const capacity = watch("capacity") || "";
  const availableSlots = watch("availableSlots") || "";
  const roomSize = watch("roomSize");
  const minPrice = watch("minPrice") || "";
  const maxPrice = watch("maxPrice") || "";
  const advancedSelected = watch("advanced") ?? [];
  const isUnlimitedDistance = watch("isUnlimitedDistance");

  const collegeOption = useMemo(() => colleges.find((c) => c.value === college), [college]);
  const mapCenter = collegeOption?.latlng ?? undefined;

  // Smart room type logic: auto-adjust capacity based on selected room type
  useEffect(() => {
    if (roomType === ROOM_TYPES.SOLO) {
      // Solo rooms: capacity must be 1
      if (capacity !== 1) {
        setCustomValue("capacity", 1);
      }
      if (availableSlots !== 1) {
        setCustomValue("availableSlots", 1);
      }
    } else if (roomType === ROOM_TYPES.BEDSPACE) {
      // Bed Spacer: capacity must be 2 or more
      if (capacity < 2) {
        setCustomValue("capacity", 2);
      }
    }
    // roomType === "" (Choose room type): no restriction, allow any value >= 1
  }, [roomType, capacity]);

  const setCustomValue = (id: string, value: unknown) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const toggleMulti = (id: "categories" | "amenities" | "rules" | "advanced" | "roomAmenities", value: string) => {
    const prev = (getValues(id) ?? []) as string[];
    const next = prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value];
    setCustomValue(id, next);
  };

  const onBack = () => {
    if (step === STEPS.LOCATION && !roomType) setStep(STEPS.ROOM_TYPE);
    else setStep((s) => s - 1);
  };

  const onNext = () => {
    if (step === STEPS.ROOM_TYPE && !roomType) setStep(STEPS.LOCATION);
    else setStep((s) => s + 1);
  };

  const isStepFilled = () => {
    switch (step) {
      case STEPS.COLLEGE:
        return !!college;
      case STEPS.BUDGET:
        // Validate min price <= max price
        return minPrice <= maxPrice;
      case STEPS.ROOM_TYPE:
        return true; // Made this non-mandatory so users can skip to 'Any' room type
      case STEPS.ROOM_CONFIGURATION:
        return true;
      case STEPS.LOCATION:
        return true;
      case STEPS.MOVE_IN:
        return true;
      case STEPS.CATEGORY:
        return true;
      case STEPS.AMENITIES:
        return true;
      case STEPS.RULES:
        return true;
      case STEPS.ADVANCED:
        return true;
      case STEPS.SUMMARY:
        return true;
      default:
        return true;
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.SUMMARY) {
      onNext();
      return;
    }

    const url = buildSearchUrl(data, searchParams as any);
    onCloseModal?.();
    router.push(url);
  };

  const renderSoloRoomConfig = () => (
    <div className="flex flex-col gap-6">
      <Heading
        title="Solo Room Configuration"
        subtitle="Customize your solo room preferences."
      />
      <MultiSelectGrid
        options={roomAmenities
          .filter(amenity => !amenity.applicableTo || amenity.applicableTo.includes(ROOM_TYPES.SOLO))
          .map((a) => ({ label: a.label, value: a.value, icon: a.icon }))}
        selected={roomAmenitiesSelected}
        onToggle={(v) => toggleMulti("roomAmenities", v)}
      />
      <Select
        id="bedType"
        label="Bed type"
        options={[{ value: "", label: "Any bed type" }, ...bedTypeOptions.filter(option => ["Single", "Double", "Queen"].includes(option.value))]}
        value={bedType}
        onChange={(v) => setCustomValue("bedType", v)}
      />
      <Input
        id="roomSize"
        label="Room size (sq. meters)"
        type="number"
        register={register}
        errors={errors}
        watch={watch}
        required={false}
        placeholder="e.g., 15"
      />
    </div>
  );

  const renderBedspaceConfig = () => (
    <div className="flex flex-col gap-6">
      <Heading
        title="Bedspace Configuration"
        subtitle="Customize your bedspace preferences."
      />
      <MultiSelectGrid
        options={roomAmenities
          .filter(amenity => !amenity.applicableTo || amenity.applicableTo.includes(ROOM_TYPES.BEDSPACE))
          .map((a) => ({ label: a.label, value: a.value, icon: a.icon }))}
        selected={roomAmenitiesSelected}
        onToggle={(v) => toggleMulti("roomAmenities", v)}
      />
      <Select
        id="bedType"
        label="Bed type"
        options={[{ value: "", label: "Any bed type" }, ...bedTypeOptions.filter(option => ["Single", "Bunk"].includes(option.value))]}
        value={bedType}
        onChange={(v) => setCustomValue("bedType", v)}
      />
      <Counter
        title="Room capacity"
        subtitle="Minimum number of people required per room"
        watch={watch}
        onChange={setCustomValue}
        name="capacity"
        minValue={0}
      />
      <Counter
        title="Available slots"
        subtitle="Minimum number of available beds required"
        watch={watch}
        onChange={setCustomValue}
        name="availableSlots"
        minValue={0}
      />
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case STEPS.COLLEGE:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Which college are you affiliated with?"
              subtitle="We'll use this to show distance from campus."
            />
            <Select
              id="college"
              label="College"
              options={colleges.map((c) => ({ value: c.value, label: c.label }))}
              value={college}
              onChange={(v) => setCustomValue("college", v)}
            />
            <div className="h-[240px] rounded-lg overflow-hidden">
              <Map center={mapCenter} />
            </div>
          </div>
        );

      case STEPS.BUDGET:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="What is your monthly budget range?"
              subtitle="Price in Philippine Peso (₱)."
            />
            <Input
              id="minPrice"
              label="Minimum (₱)"
              type="number"
              register={register}
              errors={errors}
              watch={watch}
              required={false}
            />
            <Input
              id="maxPrice"
              label="Maximum (₱)"
              type="number"
              register={register}
              errors={errors}
              watch={watch}
              required={false}
            />
            {minPrice > maxPrice && (
              <div className="text-red-500 text-sm">
                Minimum price cannot be greater than maximum price
              </div>
            )}
          </div>
        );

      case STEPS.ROOM_TYPE:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Select Room Type"
              subtitle="Choose between solo room or bedspace."
            />
            <Select
              id="roomType"
              label="Room type"
              options={[{ value: "", label: "Any room type" }, ...roomTypeOptions.filter(option => option.value !== "")]}
              value={roomType}
              onChange={(v) => setCustomValue("roomType", v)}
            />
          </div>
        );

      case STEPS.ROOM_CONFIGURATION:
        if (roomType === ROOM_TYPES.SOLO) {
          return renderSoloRoomConfig();
        } else if (roomType === ROOM_TYPES.BEDSPACE) {
          return renderBedspaceConfig();
        } else {
          return (
            <div className="flex flex-col gap-6">
              <Heading
                title="Select Room Type First"
                subtitle="Please go back and select a room type to configure."
              />
            </div>
          );
        }

      case STEPS.LOCATION:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Where should the boarding house be located?"
              subtitle="Distance from your selected college. Map centers on campus."
            />
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold text-zinc-500">Location</label>
              <div className="px-3 py-3 bg-neutral-100 border border-neutral-300 rounded-lg text-[15px] text-neutral-700">
                Tarlac Agricultural University
              </div>
            </div>
            <Slider
              id="distance"
              label="Distance from college"
              subtitle="Maximum distance in km"
              min={0}
              max={20}
              step={0.5}
              value={Number(distance)}
              onChange={(v) => setCustomValue("distance", v)}
              unit="km"
            />
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl transition-all hover:bg-primary/10">
              <Checkbox
                id="isUnlimitedDistance"
                label={`Show all listings (Ignore ${distance}km distance cap)`}
                register={register as any}
                watch={watch as any}
              />
            </div>
            <div className="h-[240px] rounded-lg overflow-hidden">
              <Map center={mapCenter} />
            </div>
          </div>
        );

      case STEPS.MOVE_IN:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="When do you plan to move in?"
              subtitle="Optional — for availability (if implemented)."
            />
            <MonthPicker
              id="moveInMonth"
              label="Move-in month"
              value={moveInMonth}
              onChange={(value) => setCustomValue("moveInMonth", value)}
              placeholder="Select a move-in date"
            />
            <Select
              id="stayDuration"
              label="Stay duration"
              options={stayDurationOptions}
              value={stayDuration}
              onChange={(v) => setCustomValue("stayDuration", v)}
            />
          </div>
        );

      case STEPS.CATEGORY:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Listing Categories"
              subtitle="Select all that apply."
            />
            <MultiSelectGrid
              options={categories.map((c) => ({ label: c.label, value: c.value, icon: c.icon }))}
              selected={categoriesSelected}
              onToggle={(v) => toggleMulti("categories", v)}
            />
          </div>
        );

      case STEPS.AMENITIES:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Listing Amenities"
              subtitle="Select all that apply."
            />
            <MultiSelectGrid
              options={amenities.map((a) => ({ label: a.label, value: a.value, icon: a.icon }))}
              selected={amenitiesSelected}
              onToggle={(v) => toggleMulti("amenities", v)}
            />
          </div>
        );

      case STEPS.RULES:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Rules / Preferences"
              subtitle="Select all that apply."
            />
            <MultiSelectGrid
              options={rulesPreferences.map((r) => ({ label: r.label, value: r.value, icon: r.icon }))}
              selected={rulesSelected}
              onToggle={(v) => toggleMulti("rules", v)}
            />
          </div>
        );

      case STEPS.ADVANCED:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Advanced Features (Scoring Only)"
              subtitle="These features affect search ranking but don't filter results."
            />
            <MultiSelectGrid
              options={advancedFilters.map((a) => ({ label: a.label, value: a.value, icon: a.icon }))}
              selected={advancedSelected}
              onToggle={(v) => toggleMulti("advanced", v)}
            />
          </div>
        );

      case STEPS.SUMMARY: {
        const coLabel = colleges.find((c) => c.value === college)?.label ?? "—";
        const roomLabel = roomTypeOptions.find((r) => r.value === roomType)?.label ?? "Any room type";

        const SummaryRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
          <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary mt-0.5 shrink-0">{icon}</div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
              <div className="text-sm text-gray-700 dark:text-gray-200">{children}</div>
            </div>
          </div>
        );

        return (
          <div className="flex flex-col gap-4">
            <Heading title="Ready to search?" subtitle="Here's a summary of the boarding house you are looking for." />

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">

              {/* Location */}
              <SummaryRow icon={<FaMapMarkerAlt className="w-3.5 h-3.5" />} label="Location">
                {isUnlimitedDistance ? "Show all boarding houses in Tarlac" : `Within ${distance} km of ${coLabel}`}
              </SummaryRow>

              {/* Budget */}
              <SummaryRow icon={<FaMoneyBillWave className="w-3.5 h-3.5" />} label="Budget">
                {minPrice || maxPrice
                  ? `${minPrice ? `₱${Number(minPrice).toLocaleString()}` : "₱0"} – ₱${Number(maxPrice || 0).toLocaleString()} / month`
                  : "Any budget"}
              </SummaryRow>

              {/* Room */}
              <SummaryRow icon={<FaBed className="w-3.5 h-3.5" />} label="Room Requirements">
                <div className="flex flex-col gap-1.5">
                  <span>{roomLabel}{bedType ? ` • ${bedType} Bed` : ""}{capacity > 0 ? ` • Capacity: ${capacity}` : ""}</span>
                  {(roomAmenitiesSelected as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(roomAmenitiesSelected as string[]).map(v => (
                        <span key={v} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded font-semibold border border-primary/20">
                          IN-ROOM: {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </SummaryRow>

              {/* Categories */}
              {(categoriesSelected as string[]).length > 0 && (
                <SummaryRow icon={<FaListUl className="w-3.5 h-3.5" />} label="Property Type">
                  <div className="flex flex-wrap gap-1.5">
                    {(categoriesSelected as string[]).map(v => (
                      <span key={v} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium">
                        {categories.find(c => c.value === v)?.label ?? v}
                      </span>
                    ))}
                  </div>
                </SummaryRow>
              )}

              {/* Amenities */}
              {(amenitiesSelected as string[]).length > 0 && (
                <SummaryRow icon={<Check className="w-3.5 h-3.5" />} label="House Amenities">
                  <div className="flex flex-wrap gap-1.5">
                    {(amenitiesSelected as string[]).map(v => (
                      <span key={v} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium">
                        {v}
                      </span>
                    ))}
                  </div>
                </SummaryRow>
              )}

              {/* Rules */}
              {(rulesSelected as string[]).length > 0 && (
                <SummaryRow icon={<FaShieldAlt className="w-3.5 h-3.5" />} label="House Rules">
                  <div className="flex flex-wrap gap-1.5">
                    {(rulesSelected as string[]).map(v => (
                      <span key={v} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium">
                        {rulesPreferences.find(r => r.value === v)?.label ?? v}
                      </span>
                    ))}
                  </div>
                </SummaryRow>
              )}

              {/* Advanced / Priority */}
              {(advancedSelected as string[]).length > 0 && (
                <SummaryRow icon={<Check className="w-3.5 h-3.5" />} label="Priority Features (Scored)">
                  <div className="flex flex-wrap gap-1.5">
                    {(advancedSelected as string[]).map(v => (
                      <span key={v} className="text-xs px-2 py-0.5 bg-primary text-white rounded-lg font-semibold">
                        ★ {advancedFilters.find(a => a.value === v)?.label ?? v}
                      </span>
                    ))}
                  </div>
                </SummaryRow>
              )}

            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-800 flex flex-col">
      <Modal.WindowHeader title="Find a boarding house · BoardTAU" />
      <form
        className="h-auto flex-1 border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-gray-800 outline-none focus:outline-none"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative p-6 overflow-y-auto max-h-[60vh]">{renderStep()}</div>
        <div className="flex flex-col gap-2 px-6 pb-6 pt-3 border-t">
          <div className="flex flex-row items-center gap-4 w-full">
            {step > STEPS.COLLEGE ? (
              <Button type="button" className="flex items-center gap-2 justify-center" onClick={onBack} outline>
                Back
              </Button>
            ) : null}
            <Button
              type="submit"
              className="flex items-center gap-2 justify-center"
              disabled={!isStepFilled()}
            >
              {step === STEPS.SUMMARY ? "Apply filters" : "Next"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchModal;
