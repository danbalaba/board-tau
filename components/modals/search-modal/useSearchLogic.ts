import { useState, useEffect, useMemo } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { buildSearchUrl } from "@/utils/searchUrlBuilder";

export enum STEPS {
  COLLEGE = 0,
  PROPERTY_TYPE = 1,
  ROOM_CONFIG = 2,
  BUDGET = 3,
  LOCATION = 4,
  AMENITIES = 5,
  ROOM_AMENITIES = 6,
  RULES = 7,
  ADVANCED_FEATURES = 8,
  SUMMARY = 9,
}

export function useSearchLogic(onCloseModal?: () => void) {
  const [step, setStep] = useState(STEPS.COLLEGE);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<FieldValues>({
    defaultValues: {
      college: "any",
      propertyType: [] as string[],
      roomType: [] as string[],
      bedType: "",
      capacity: "",
      availableSlots: "",
      roomSize: "",
      minPrice: "",
      maxPrice: "",
      distance: "",
      isUnlimitedDistance: true,
      amenities: [] as string[],
      roomAmenities: [] as string[],
      rules: [] as string[],
      advanced: [] as string[],
    },
  });

  const { handleSubmit, setValue, watch, getValues, register, formState: { errors } } = form;

  // Sync URL searchParams to default form state (e.g. navbar category pill click)
  useEffect(() => {
    const urlCategory = searchParams?.get("category") || searchParams?.get("propertyType");
    if (urlCategory) {
      const currentProps = (getValues("propertyType") ?? []) as string[];
      if (currentProps.length === 0) {
        setValue("propertyType", [urlCategory], { shouldDirty: true });
      }
    }
  }, [searchParams, setValue, getValues]);

  const college = watch("college");
  const propertyTypeSelected = watch("propertyType") ?? [];
  const roomTypeSelected = watch("roomType") ?? [];
  const bedType = watch("bedType");
  const capacity = watch("capacity") || "";
  const availableSlots = watch("availableSlots") || "";
  const roomSize = watch("roomSize");
  const minPrice = watch("minPrice") || "";
  const maxPrice = watch("maxPrice") || "";
  const distance = watch("distance") ?? 5;
  const isUnlimitedDistance = watch("isUnlimitedDistance");
  const amenitiesSelected = watch("amenities") ?? [];
  const roomAmenitiesSelected = watch("roomAmenities") ?? [];
  const rulesSelected = watch("rules") ?? [];
  const advancedSelected = watch("advanced") ?? [];

  const collegeOption = undefined;
  const mapCenter = undefined;

  useEffect(() => {
    // Capacity reset logic if needed
  }, [roomTypeSelected, capacity]);

  const setCustomValue = (id: string, value: unknown) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const toggleMulti = (id: "amenities" | "rules" | "advanced" | "roomAmenities" | "propertyType" | "roomType", value: string) => {
    const prev = (getValues(id) ?? []) as string[];
    const next = prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value];
    setCustomValue(id, next);
  };

  const onBack = () => {
    setStep((s) => s - 1);
  };

  const isStepFilled = () => {
    switch (step) {
      case STEPS.COLLEGE: return !!college && college !== "";
      case STEPS.PROPERTY_TYPE: return propertyTypeSelected && propertyTypeSelected.length > 0;
      case STEPS.ROOM_CONFIG: return true;
      default: return true;
    }
  };

  const onNext = () => {
    if (!isStepFilled()) return false;
    setStep((s) => s + 1);
    return true;
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
      propertyTypeSelected,
      roomTypeSelected,
      bedType,
      capacity,
      availableSlots,
      roomSize,
      minPrice,
      maxPrice,
      distance,
      isUnlimitedDistance,
      amenitiesSelected,
      roomAmenitiesSelected,
      rulesSelected,
      advancedSelected,
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
