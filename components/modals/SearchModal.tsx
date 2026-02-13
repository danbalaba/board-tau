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
import MultiSelectGrid from "../inputs/MultiSelectGrid";
import { categories, roomTypeOptions, stayDurationOptions } from "@/utils/constants";
import { amenities } from "@/data/amenities";
import { colleges } from "@/data/colleges";
import { rulesPreferences } from "@/data/rulesPreferences";
import { advancedFilters } from "@/data/advancedFilters";

  const Map = dynamic(() => import("../common/Map"), {
    ssr: false,
    loading: () => <div className="h-[240px] rounded-lg bg-gray-100 flex items-center justify-center">Loading map...</div>
  });

enum STEPS {
  COLLEGE = 0,
  CATEGORY = 1,
  LOCATION = 2,
  MOVE_IN = 3,
  AMENITIES = 4,
  RULES = 5,
  ROOM_DETAILS = 6,
  BUDGET = 7,
  ADVANCED = 8,
  SUMMARY = 9,
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
      occupantsPerRoom: 1,
      bathroomCount: 1,
      minPrice: 0,
      maxPrice: 100000,
      advanced: [] as string[],
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
  const occupantsPerRoom = watch("occupantsPerRoom") ?? 1;
  const bathroomCount = watch("bathroomCount") ?? 1;
  const minPrice = watch("minPrice") ?? 0;
  const maxPrice = watch("maxPrice") ?? 100000;
  const advancedSelected = watch("advanced") ?? [];

  const collegeOption = useMemo(() => colleges.find((c) => c.value === college), [college]);
  const mapCenter = collegeOption?.latlng ?? undefined;

  // Smart room type logic: auto-adjust occupants based on selected room type
  useEffect(() => {
    if (roomType === "Solo") {
      // Solo rooms: occupants must be 1
      if (occupantsPerRoom !== 1) {
        setCustomValue("occupantsPerRoom", 1);
      }
    } else if (roomType === "Shared" || roomType === "Bed Spacer") {
      // Shared/Bed Spacer: occupants must be 2 or more
      if (occupantsPerRoom < 2) {
        setCustomValue("occupantsPerRoom", 2);
      }
    }
    // roomType === "" (Any): no restriction, allow any value >= 1
  }, [roomType, occupantsPerRoom]);

  const setCustomValue = (id: string, value: unknown) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const toggleMulti = (id: "categories" | "amenities" | "rules" | "advanced", value: string) => {
    const prev = (getValues(id) ?? []) as string[];
    const next = prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value];
    setCustomValue(id, next);
  };

  const onBack = () => setStep((s) => s - 1);
  const onNext = () => setStep((s) => s + 1);

  const isStepFilled = () => {
    switch (step) {
      case STEPS.COLLEGE:
        return !!college;
      case STEPS.CATEGORY:
        return true;
      case STEPS.LOCATION:
        return true;
      case STEPS.MOVE_IN:
        return true;
      case STEPS.AMENITIES:
        return true;
      case STEPS.RULES:
        return true;
      case STEPS.ROOM_DETAILS:
        return true;
      case STEPS.BUDGET:
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

    const co = colleges.find((c) => c.value === data.college);
    const origin = co?.latlng ?? null;

    let currentQuery: Record<string, unknown> = {};
    if (searchParams) currentQuery = queryString.parse(searchParams.toString()) as Record<string, unknown>;

     // Convert rules and advanced filters to boolean params for easier query handling
    const rulesMap: Record<string, string> = {
      "female-only": "femaleOnly",
      "male-only": "maleOnly",
      "visitors-allowed": "visitorsAllowed",
      "pets-allowed": "petsAllowed",
      "smoking-allowed": "smokingAllowed",
    };

    const advancedMap: Record<string, string> = {
      "24-7-security": "security24h",
      "cctv": "cctv",
      "fire-safety": "fireSafety",
      "near-public-transport": "nearTransport",
      "study-friendly": "studyFriendly",
      "quiet-environment": "quietEnvironment",
      "flexible-lease": "flexibleLease",
    };

    const updatedQuery: Record<string, unknown> = {
      ...currentQuery,
      college: data.college,
      categories: (data.categories ?? []).length ? data.categories : undefined,
      distance: data.distance,
      moveInDate: data.moveInMonth || undefined,
      stayDuration: data.stayDuration || undefined,
      amenities: (data.amenities ?? []).length ? data.amenities : undefined,
      roomType: data.roomType || undefined,
      guestCount: data.occupantsPerRoom,
      bathroomCount: data.bathroomCount,
      minPrice: data.minPrice || undefined,
      maxPrice: data.maxPrice || undefined,
      // Rules as boolean params
      femaleOnly: (data.rules ?? []).includes("female-only") ? "true" : undefined,
      maleOnly: (data.rules ?? []).includes("male-only") ? "true" : undefined,
      visitorsAllowed: (data.rules ?? []).includes("visitors-allowed") ? "true" : undefined,
      petsAllowed: (data.rules ?? []).includes("pets-allowed") ? "true" : undefined,
      smokingAllowed: (data.rules ?? []).includes("smoking-allowed") ? "true" : undefined,
      // Advanced filters as boolean params
      security24h: (data.advanced ?? []).includes("24-7-security") ? "true" : undefined,
      cctv: (data.advanced ?? []).includes("cctv") ? "true" : undefined,
      fireSafety: (data.advanced ?? []).includes("fire-safety") ? "true" : undefined,
      nearTransport: (data.advanced ?? []).includes("near-public-transport") ? "true" : undefined,
      studyFriendly: (data.advanced ?? []).includes("study-friendly") ? "true" : undefined,
      quietEnvironment: (data.advanced ?? []).includes("quiet-environment") ? "true" : undefined,
      flexibleLease: (data.advanced ?? []).includes("flexible-lease") ? "true" : undefined,
    };

    if (origin && origin.length >= 2) {
      updatedQuery.originLat = origin[0];
      updatedQuery.originLng = origin[1];
    }

    const url = queryString.stringifyUrl(
      { url: "/", query: updatedQuery as Record<string, string | string[] | number | undefined> },
      { skipNull: true }
    );
    onCloseModal?.();
    router.push(url);
  };

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

      case STEPS.CATEGORY:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="What type of boarding house are you looking for?"
              subtitle="Select all that apply."
            />
            <MultiSelectGrid
              options={categories.map((c) => ({ label: c.label, value: c.value, icon: c.icon }))}
              selected={categoriesSelected}
              onToggle={(v) => toggleMulti("categories", v)}
            />
          </div>
        );

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
            <div>
              <label className="block font-semibold text-[15px] mb-1">Move-in month</label>
              <input
                type="month"
                value={moveInMonth}
                onChange={(e) => setCustomValue("moveInMonth", e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>
            <Select
              id="stayDuration"
              label="Stay duration"
              options={stayDurationOptions}
              value={stayDuration}
              onChange={(v) => setCustomValue("stayDuration", v)}
            />
          </div>
        );

      case STEPS.AMENITIES:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Which amenities are essential to you?"
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
              title="Do you have specific rules or preferences?"
              subtitle="Select all that apply."
            />
            <MultiSelectGrid
              options={rulesPreferences.map((r) => ({ label: r.label, value: r.value, icon: r.icon }))}
              selected={rulesSelected}
              onToggle={(v) => toggleMulti("rules", v)}
            />
          </div>
        );

      case STEPS.ROOM_DETAILS:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="What room setup do you prefer?"
              subtitle="Room type, occupants, and bathrooms."
            />
            <Select
              id="roomType"
              label="Room type"
              options={roomTypeOptions}
              value={roomType}
              onChange={(v) => setCustomValue("roomType", v)}
            />
            <Counter
              title="Occupants per room"
              subtitle="Number of people per room"
              watch={watch}
              onChange={setCustomValue}
              name="occupantsPerRoom"
              disabled={roomType === "Solo"}
              minValue={roomType === "Shared" || roomType === "Bed Spacer" ? 2 : 1}
            />
            <hr />
            <Counter
              title="Bathrooms"
              subtitle="Minimum number of bathrooms"
              watch={watch}
              onChange={setCustomValue}
              name="bathroomCount"
            />
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
          </div>
        );

      case STEPS.ADVANCED:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title="Additional features or safety options?"
              subtitle="Select all that apply."
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
        const catLabels = (categoriesSelected as string[]).length
          ? (categoriesSelected as string[]).map((v) => categories.find((c) => c.value === v)?.label ?? v).join(", ")
          : "Any";
        const advLabels = (advancedSelected as string[]).length
          ? (advancedSelected as string[]).map((v) => advancedFilters.find((a) => a.value === v)?.label ?? v).join(", ")
          : "None";
        const ruleLabels = (rulesSelected as string[]).length
          ? (rulesSelected as string[]).map((v) => rulesPreferences.find((r) => r.value === v)?.label ?? v).join(", ")
          : "None";
        const roomLabel = roomTypeOptions.find((r) => r.value === roomType)?.label ?? "Any";

        return (
          <div className="flex flex-col gap-4">
            <Heading title="Summary of your filters" subtitle="Review or go back to edit." />
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">College:</span> {coLabel}</p>
              <p><span className="font-semibold">Categories:</span> {catLabels}</p>
              <p><span className="font-semibold">Distance:</span> ≤ {distance} km from campus</p>
              {(moveInMonth || stayDuration) && (
                <p><span className="font-semibold">Move-in / Duration:</span> {moveInMonth || "—"} {stayDuration ? ` · ${stayDurationOptions.find((d) => d.value === stayDuration)?.label ?? stayDuration}` : ""}</p>
              )}
              {(amenitiesSelected as string[]).length > 0 && (
                <p><span className="font-semibold">Amenities:</span> {(amenitiesSelected as string[]).join(", ")}</p>
              )}
              <p><span className="font-semibold">Rules:</span> {ruleLabels}</p>
              <p><span className="font-semibold">Room:</span> {roomLabel} · {occupantsPerRoom} occupant(s) · {bathroomCount} bathroom(s)</p>
              <p><span className="font-semibold">Budget:</span> ₱{minPrice} – ₱{maxPrice} / month</p>
              <p><span className="font-semibold">Advanced:</span> {advLabels}</p>
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
