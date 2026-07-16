import { useState, useEffect, useMemo } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { colleges } from "@/data/colleges";
import { ROOM_TYPES } from "@/data/roomTypes";
import { buildSearchUrl } from "@/utils/searchUrlBuilder";

export enum STEPS {
  COLLEGE = 0,
  BUDGET = 1,
  ROOM_TYPE = 2,
  ROOM_AMENITIES = 3,
  BED_SETUP = 4,
  LOCATION = 5,
  CATEGORY = 6,
  AMENITIES = 7,
  RULES = 8,
  ADVANCED = 9,
  SUMMARY = 10,
}

export function useSearchLogic(onCloseModal?: () => void) {
  const [step, setStep] = useState(STEPS.COLLEGE);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<FieldValues>({
    defaultValues: {
      college: "any",
      categories: [] as string[],
      distance: 5,
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
      isUnlimitedDistance: true,
    },
  });

  const { handleSubmit, setValue, watch, getValues, register, formState: { errors } } = form;

  const college = watch("college");
  const categoriesSelected = watch("categories") ?? [];
  const distance = watch("distance") ?? 5;
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

  useEffect(() => {
    if (roomType === ROOM_TYPES.SOLO) {
      if (capacity !== 1) setCustomValue("capacity", 1);
      if (availableSlots !== 1) setCustomValue("availableSlots", 1);
    } else if (roomType === ROOM_TYPES.BEDSPACE) {
      if (capacity < 2) setCustomValue("capacity", 2);
    }
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
      case STEPS.COLLEGE: return !!college;
      case STEPS.BUDGET: return minPrice <= maxPrice;
      default: return true;
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



  return {
    step,
    setStep,
    form,
    values: {
      college,
      categoriesSelected,
      distance,
      amenitiesSelected,
      rulesSelected,
      roomType,
      bedType,
      roomAmenitiesSelected,
      capacity,
      availableSlots,
      roomSize,
      minPrice,
      maxPrice,
      advancedSelected,
      isUnlimitedDistance,
      collegeOption,
      mapCenter,
    },

    actions: {
      onBack,
      onNext,
      onSubmit,
      setCustomValue,
      toggleMulti,
      isStepFilled,
    }
  };
}
