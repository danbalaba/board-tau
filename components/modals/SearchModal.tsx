"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Sparkles,
  Loader2,
  MapPin,
  Home,
  X,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { KerbyMascot, KerbyPose, OutfitMode } from "./search-modal/KerbyMascot";
import { useSearchLogic, STEPS } from "./search-modal/useSearchLogic";
import ProgressBar from "./search-modal/components/ProgressBar";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

// Import Specialized & Reusable Step Components
import CollegeStep from "./search-modal/steps/CollegeStep";
import PropertyTypeStep from "./search-modal/steps/PropertyTypeStep";
import RoomConfigStep from "./search-modal/steps/RoomConfigStep";
import BudgetStep from "./search-modal/steps/BudgetStep";
import LocationStep from "./search-modal/steps/LocationStep";
import SharedFacilitiesStep from "./search-modal/steps/SharedFacilitiesStep";
import InUnitComfortStep from "./search-modal/steps/InUnitComfortStep";
import RulesStep from "./search-modal/steps/RulesStep";
import AdvancedStep from "./search-modal/steps/AdvancedStep";
import SummaryStep from "./search-modal/steps/SummaryStep";
import { DynamicAttributeStep } from "./search-modal/steps/DynamicAttributeStep";
import { CounterStep } from "./search-modal/steps/CounterStep";

interface SearchModalProps {
  onCloseModal?: () => void;
  initialShowWizard?: boolean;
  isMapOverlay?: boolean;
}

export default function SearchModal({
  onCloseModal,
  initialShowWizard = false,
  isMapOverlay = false,
}: SearchModalProps) {
  const router = useRouter();
  const { toast } = useResponsiveToast();

  // DEFAULT TO FALSE: Spotlight AI Search opens first in compact mode!
  const [showWizard, setShowWizard] = useState(initialShowWizard);
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [dynamicSpeechOverride, setDynamicSpeechOverride] = useState<string | null>(null);
  const [dynamicPoseOverride, setDynamicPoseOverride] = useState<KerbyPose | null>(null);
  const [roomSubStep, setRoomSubStep] = useState<number>(0);
  const [sharedFacilitiesSubStep, setSharedFacilitiesSubStep] = useState<number>(0);
  const [inUnitComfortSubStep, setInUnitComfortSubStep] = useState<number>(0);
  const [rulesSubStep, setRulesSubStep] = useState<number>(0);
  const [advancedSubStep, setAdvancedSubStep] = useState<number>(0);
  const [propertyTypeValidationError, setPropertyTypeValidationError] = useState(false);
  const [roomValidationError, setRoomValidationError] = useState(false);
  const [locationValidationError, setLocationValidationError] = useState(false);
  const [hasNoRoomTypes, setHasNoRoomTypes] = useState(false);
  const [dynamicIsBranchB, setDynamicIsBranchB] = useState<boolean>(false);
  const [inUnitValidationError, setInUnitValidationError] = useState(false);
  const [rulesValidationError, setRulesValidationError] = useState(false);

  const [totalSharedSubSteps, setTotalSharedSubSteps] = useState<number>(7);
  const [totalInUnitSubSteps, setTotalInUnitSubSteps] = useState<number>(6);
  const [totalRulesSubSteps, setTotalRulesSubSteps] = useState<number>(5);
  const [totalAdvancedSubSteps, setTotalAdvancedSubSteps] = useState<number>(3);
  const dragControls = useDragControls();
  const [showMobileKerbyModal, setShowMobileKerbyModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    step,
    setStep,
    values,
    actions,
    form: { handleSubmit, register, formState: { errors }, watch },
  } = useSearchLogic(onCloseModal);

  useEffect(() => {
    setIsStepLoading(false);
  }, [step]);

  const contentBodyRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll modal content body to top on step, sub-step, or validation error change
  React.useEffect(() => {
    if (typeof contentBodyRef.current?.scrollTo === "function") {
      contentBodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [
    step,
    roomSubStep,
    sharedFacilitiesSubStep,
    inUnitComfortSubStep,
    rulesSubStep,
    advancedSubStep,
    propertyTypeValidationError,
    roomValidationError,
    inUnitValidationError,
    rulesValidationError,
  ]);

  // Reset speech override on main step transitions
  React.useEffect(() => {
    setDynamicSpeechOverride(null);
    setDynamicPoseOverride(null);
  }, [step]);

  // Dynamic Outfit Switcher: Uniform mode active ONLY when a specific college is selected!
  const outfitMode: OutfitMode = useMemo(() => {
    const c = (values.college || "").toLowerCase().trim();
    if (!c || c === "any" || c.includes("not sure") || c === "none") {
      return "casual";
    }
    return "uniform";
  }, [values.college]);

  // Determine Branch A (Boarding House / Dorm) vs Branch B (Apartment / Transient / Hostel)
  const isBranchB = useMemo(() => {
    if (dynamicIsBranchB) return true;
    const propName = (values.propertyTypeSelected[0] || "").toLowerCase();
    return (
      propName.includes("apartment") ||
      propName.includes("transient") ||
      propName.includes("hostel") ||
      propName.includes("whole house") ||
      propName.includes("unit")
    );
  }, [dynamicIsBranchB, values.propertyTypeSelected]);

  const currentPropType = values.propertyTypeSelected[0] || "";
  const prevPropTypeRef = React.useRef(currentPropType);

  const [maxUnlockedStep, setMaxUnlockedStep] = useState(STEPS.COLLEGE);

  useEffect(() => {
    setMaxUnlockedStep((prev) => Math.max(prev, step));
  }, [step]);

  useEffect(() => {
    if (prevPropTypeRef.current !== currentPropType) {
      prevPropTypeRef.current = currentPropType;

      // Reset maxUnlockedStep to current step on property type switch
      setMaxUnlockedStep(step);

      // Reset all sub-step pointers & clear validation errors when property type changes
      setDynamicIsBranchB(false);
      setRoomSubStep(0);
      setSharedFacilitiesSubStep(0);
      setInUnitComfortSubStep(0);
      setRulesSubStep(0);
      setAdvancedSubStep(0);
      setPropertyTypeValidationError(false);
      setRoomValidationError(false);
      setInUnitValidationError(false);
      setRulesValidationError(false);

      // Clear pre-filled Branch B choices if switching to Branch A (Boarding House / Dormitory)
      const isNewPropBranchB = 
        currentPropType.toLowerCase().includes("apartment") ||
        currentPropType.toLowerCase().includes("transient") ||
        currentPropType.toLowerCase().includes("hostel") ||
        currentPropType.toLowerCase().includes("whole house");

      const currentKitchenSetup = watch("kitchenSetup");
      const currentCrSetup = watch("crSetup");

      if (!isNewPropBranchB) {
        if (currentKitchenSetup === "PRIVATE_KITCHENETTE") {
          actions.setCustomValue("kitchenSetup", "");
        }
        if (currentCrSetup === "PRIVATE_CR") {
          actions.setCustomValue("crSetup", "");
        }
      }
    }
  }, [currentPropType, step]);

  // Consistent 10-Step Wizard List with Adaptive Sub-steps
  const activeSteps = useMemo(() => {
    return [
      { id: STEPS.COLLEGE, label: "College Landmark" },
      { id: STEPS.PROPERTY_TYPE, label: "Property Type" },
      { id: STEPS.ROOM_CONFIG, label: "Room & Unit Layout" },
      { id: STEPS.BUDGET, label: "Budget Range" },
      { id: STEPS.LOCATION, label: "Location & Walkability" },
      { id: STEPS.AMENITIES, label: "Property Facilities" },
      { id: STEPS.ROOM_AMENITIES, label: "Room Amenities" },
      { id: STEPS.RULES, label: "House Rules" },
      { id: STEPS.ADVANCED_FEATURES, label: "Security & Safety" },
      { id: STEPS.SUMMARY, label: "Review & Submit" },
    ];
  }, []);

  const currentStepIndex = activeSteps.findIndex((s) => s.id === step) + 1;
  const totalSteps = activeSteps.length;

  // Dynamic Kerby Pose & Speech Resolver per Step
  const kerbyState = useMemo(() => {
    const selectedPropType = values.propertyTypeSelected[0] || "Boarding House";
    const selectedRoomType = values.roomTypeSelected[0] || "";
    const propName = selectedRoomType ? `${selectedRoomType} (${selectedPropType})` : selectedPropType;

    switch (step) {
      case STEPS.COLLEGE:
        return {
          pose: "waving" as KerbyPose,
          speech: "Mabuhay! 🎓 Which college or building in TAU will you be studying at?",
          badge: "Step 1: TAU College Landmark",
        };

      case STEPS.PROPERTY_TYPE:
        return {
          pose: "pointing" as KerbyPose,
          speech: `Awesome! What property style feels like home to you?`,
          badge: "Step 2: Property Style",
        };

      case STEPS.ROOM_CONFIG:
        return {
          pose: "thinking" as KerbyPose,
          speech: isBranchB
            ? `Which unit layout do you prefer for your ${propName}?`
            : `Do you want a private Solo Room or budget Bedspace for your ${propName}?`,
          badge: "Step 3: Unit & Bed Layout",
        };

      case STEPS.BUDGET:
        return {
          pose: "thinking" as KerbyPose,
          speech: `What is your monthly budget range for a ${propName} in Camiling?`,
          badge: "Step 4: Budget Filter",
        };

      case STEPS.LOCATION:
        return {
          pose: "pointing" as KerbyPose,
          speech: `How close to TAU campus and transport terminals do you need your ${propName} to be?`,
          badge: "Step 5: Campus Walkability",
        };

      case STEPS.AMENITIES:
        return {
          pose: "pointing" as KerbyPose,
          speech: `Which daily stores or eateries do you want near your ${propName}?`,
          badge: "Step 6: Shared Facilities",
        };

      case STEPS.ROOM_AMENITIES:
        return {
          pose: "studying" as KerbyPose,
          speech: `What room appliances, aircon, and furniture do you prefer inside your ${propName}?`,
          badge: "Step 7: Room Amenities",
        };

      case STEPS.RULES:
        return {
          pose: "pointing" as KerbyPose,
          speech: `Which water supply and emergency power backup systems do you require for your ${propName}?`,
          badge: "Step 8: Water & Power Backup",
        };

      case STEPS.ADVANCED_FEATURES:
        return {
          pose: "driving" as KerbyPose,
          speech: `Are you bringing a vehicle or motorcycle to your ${propName}?`,
          badge: "Step 9: Vehicle Parking Facilities",
        };

      case STEPS.SUMMARY:
        return {
          pose: "excited" as KerbyPose,
          speech: `All set! Let's find your ideal ${propName} near TAU! 🎉`,
          badge: "Final Step: Match Results",
        };

      default:
        return {
          pose: "waving" as KerbyPose,
          speech: "Mabuhay! Let's find your ideal home near TAU!",
          badge: "BoardTAU Housing Finder",
        };
    }
  }, [step, values.propertyTypeSelected, values.roomTypeSelected, isBranchB]);

  // Handle Spotlight AI Search Submit
  const handleSpotlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = spotlightQuery.trim();
    if (!query) return;

    const cacheKey = `spotlight_ai_search_${query.toLowerCase()}`;
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          if (data.rawParamsString) {
            onCloseModal?.();
            router.push(`/?${data.rawParamsString}`);
            return;
          }
        }
      } catch (err) {}
    }

    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: spotlightQuery }),
      });

      const data = await res.json();
      if (res.ok && data.rawParamsString) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {}
        }
        onCloseModal?.();
        router.push(`/?${data.rawParamsString}`);
      } else {
        toast({
          title: "Search failed",
          description: data.error || "Could not process AI search query",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network connection error",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePrevStep = () => {
    setPropertyTypeValidationError(false);
    setRoomValidationError(false);
    setLocationValidationError(false);
    setInUnitValidationError(false);
    setRulesValidationError(false);

    if (step === STEPS.ROOM_CONFIG) {
      if (roomSubStep > 0) {
        if (roomSubStep === 2 && values.roomTypeSelected[0] === "Solo Room") {
          setRoomSubStep(0);
          return;
        }
        setRoomSubStep((prev) => prev - 1);
        return;
      }
    }

    if (step === STEPS.AMENITIES) {
      if (sharedFacilitiesSubStep > 0) {
        setSharedFacilitiesSubStep((prev) => prev - 1);
        return;
      }
    }

    if (step === STEPS.ROOM_AMENITIES) {
      const kitchenChoice = watch("kitchenChoice");
      const bathroomChoice = watch("bathroomChoice");

      if (inUnitComfortSubStep === 4 && (bathroomChoice === "Common Hallway Bathroom (CR)" || bathroomChoice === "Common CR" || bathroomChoice === "Any Bathroom Setup")) {
        setInUnitComfortSubStep(2);
        return;
      }
      if (inUnitComfortSubStep === 2 && kitchenChoice === "No Cooking Needed") {
        setInUnitComfortSubStep(0);
        return;
      }
      if (inUnitComfortSubStep > 0) {
        setInUnitComfortSubStep((prev) => prev - 1);
        return;
      }

      // Going back to Step 6 (AMENITIES): land on last sub-step of Step 6
      setSharedFacilitiesSubStep(totalSharedSubSteps - 1);
      actions.onBack();
      return;
    }

    if (step === STEPS.RULES) {
      if (rulesSubStep > 0) {
        setRulesSubStep((prev) => prev - 1);
        return;
      }
      // Going back to Step 7 (ROOM_AMENITIES): land on last sub-step of Step 7
      setInUnitComfortSubStep(totalInUnitSubSteps - 1);
      actions.onBack();
      return;
    }

    if (step === STEPS.ADVANCED_FEATURES) {
      if (advancedSubStep > 0) {
        setAdvancedSubStep((prev) => prev - 1);
        return;
      }
      // Going back to Step 8 (RULES): land on last sub-step of Step 8
      setRulesSubStep(totalRulesSubSteps - 1);
      actions.onBack();
      return;
    }

    if (step === STEPS.SUMMARY) {
      // Going back to Step 9 (ADVANCED_FEATURES): land on last sub-step of Step 9
      setAdvancedSubStep(totalAdvancedSubSteps - 1);
      actions.onBack();
      return;
    }

    if (step === STEPS.BUDGET) {
      if (hasNoRoomTypes) {
        setRoomSubStep(0);
        actions.onBack();
        return;
      }
      setRoomSubStep(isBranchB ? 1 : 2);
      actions.onBack();
      return;
    }

    actions.onBack();
  };

  const handleNextStep = () => {
    if (isStepLoading) return;

    if (step === STEPS.PROPERTY_TYPE) {
      if (!values.propertyTypeSelected || values.propertyTypeSelected.length === 0) {
        setPropertyTypeValidationError(true);
        contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setRoomSubStep(0);
      actions.onNext();
      return;
    }

    if (step === STEPS.ROOM_CONFIG) {
      if (hasNoRoomTypes) {
        actions.onNext();
        return;
      }

      if (roomSubStep === 0 && (!values.roomTypeSelected || values.roomTypeSelected.length === 0)) {
        setRoomValidationError(true);
        contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (roomSubStep === 0 && values.roomTypeSelected[0] === "Solo Room") {
        setRoomSubStep(2);
        return;
      }

      const maxRoomSubStep = isBranchB ? 1 : 2;
      if (roomSubStep < maxRoomSubStep) {
        if (roomSubStep === 1 && !isBranchB && !watch("movingWithFriends")) {
          setRoomValidationError(true);
          contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        setRoomSubStep((prev) => prev + 1);
        return;
      }

      if (roomSubStep === 2 && !isBranchB && !watch("bedType")) {
        setRoomValidationError(true);
        contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (step === STEPS.LOCATION) {
      const isUnlimited = watch("isUnlimitedDistance");
      const dist = watch("distance");

      if (!isUnlimited && (!dist || Number(dist) === 0)) {
        setLocationValidationError(true);
        contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setSharedFacilitiesSubStep(0);
      actions.onNext();
      return;
    }

    if (step === STEPS.AMENITIES) {
      const maxSubSteps = Math.max(totalSharedSubSteps, 1);
      if (sharedFacilitiesSubStep < maxSubSteps - 1) {
        setSharedFacilitiesSubStep((prev) => prev + 1);
        return;
      }
      setInUnitComfortSubStep(0);
      actions.onNext();
      return;
    }

    if (step === STEPS.ROOM_AMENITIES) {
      const kitchenChoice = watch("kitchenChoice");
      const bathroomChoice = watch("bathroomChoice");

      if (inUnitComfortSubStep === 0 && !isBranchB && !kitchenChoice) {
        setInUnitValidationError(true);
        contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (inUnitComfortSubStep === 2 && !isBranchB && !bathroomChoice) {
        setInUnitValidationError(true);
        contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const maxSubSteps = Math.max(totalInUnitSubSteps, 1);
      if (inUnitComfortSubStep < maxSubSteps - 1) {
        setInUnitComfortSubStep((prev) => prev + 1);
        return;
      }
      setRulesSubStep(0);
      actions.onNext();
      return;
    }

    if (step === STEPS.RULES) {
      const tenantType = watch("tenantType");
      const genderPolicy = watch("genderPolicy");

      if (rulesSubStep === 0 && !tenantType) {
        setRulesValidationError(true);
        contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (rulesSubStep === 1 && !genderPolicy) {
        setRulesValidationError(true);
        contentBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const maxSubSteps = Math.max(totalRulesSubSteps, 1);
      if (rulesSubStep < maxSubSteps - 1) {
        setRulesSubStep((prev) => prev + 1);
        return;
      }
      setAdvancedSubStep(0);
      actions.onNext();
      return;
    }

    if (step === STEPS.ADVANCED_FEATURES) {
      const maxSubSteps = Math.max(totalAdvancedSubSteps, 1);
      if (advancedSubStep < maxSubSteps - 1) {
        setAdvancedSubStep((prev) => prev + 1);
        return;
      }
      actions.onNext();
      return;
    }

    const isFilled = actions.isStepFilled();
    if (!isFilled) {
      toast({
        title: "Selection Required",
        description: "Please complete your selection to continue.",
        variant: "destructive",
      });
      return;
    }
    actions.onNext();
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (step) {
      case STEPS.COLLEGE:
        return (
          <CollegeStep
            college={values.college}
            setCustomValue={actions.setCustomValue}
            mapCenter={values.mapCenter}
            onLoadingChange={setIsStepLoading}
          />
        );

      case STEPS.PROPERTY_TYPE:
        return (
          <PropertyTypeStep
            propertyTypeSelected={values.propertyTypeSelected}
            setCustomValue={actions.setCustomValue}
            showValidationError={propertyTypeValidationError}
            onClearValidationError={() => setPropertyTypeValidationError(false)}
            onLoadingChange={setIsStepLoading}
          />
        );

      case STEPS.ROOM_CONFIG:
        return (
          <RoomConfigStep
            propertyTypeSelected={values.propertyTypeSelected}
            roomTypeSelected={values.roomTypeSelected}
            bedType={values.bedType}
            setCustomValue={actions.setCustomValue}
            toggleMulti={actions.toggleMulti}
            register={register}
            errors={errors}
            watch={watch}
            onUpdateKerbySpeech={(speech) => setDynamicSpeechOverride(speech)}
            subStep={roomSubStep}
            setSubStep={(val) => {
              setRoomValidationError(false);
              setRoomSubStep(val);
            }}
            showValidationError={roomValidationError}
            onClearValidationError={() => setRoomValidationError(false)}
            onHasNoRoomTypesChange={setHasNoRoomTypes}
            onIsBranchBChange={setDynamicIsBranchB}
            onLoadingChange={setIsStepLoading}
          />
        );

      case STEPS.BUDGET:
        return (
          <BudgetStep
            propertyTypeSelected={values.propertyTypeSelected}
            roomTypeSelected={values.roomTypeSelected}
            minPrice={values.minPrice}
            maxPrice={values.maxPrice}
            setCustomValue={actions.setCustomValue}
            register={register}
            watch={watch}
            errors={errors}
          />
        );

      case STEPS.LOCATION:
        return (
          <LocationStep
            propertyTypeSelected={values.propertyTypeSelected}
            distance={values.distance}
            college={values.college}
            isUnlimitedDistance={values.isUnlimitedDistance}
            setCustomValue={actions.setCustomValue}
            register={register}
            watch={watch}
            showValidationError={locationValidationError}
            onClearValidationError={() => setLocationValidationError(false)}
          />
        );

      case STEPS.AMENITIES:
        return (
          <SharedFacilitiesStep
            propertyTypeSelected={values.propertyTypeSelected}
            amenitiesSelected={values.amenitiesSelected}
            setCustomValue={actions.setCustomValue}
            toggleMulti={actions.toggleMulti}
            register={register}
            watch={watch}
            subStep={sharedFacilitiesSubStep}
            setSubStep={setSharedFacilitiesSubStep}
            onUpdateKerbySpeech={(speech, pose) => {
              setDynamicSpeechOverride(speech);
              if (pose) setDynamicPoseOverride(pose);
            }}
            onTotalSubStepsChange={(count) => setTotalSharedSubSteps(count)}
            isBranchB={dynamicIsBranchB}
            onLoadingChange={setIsStepLoading}
          />
        );

      case STEPS.ROOM_AMENITIES:
        return (
          <InUnitComfortStep
            propertyTypeSelected={values.propertyTypeSelected}
            roomTypeSelected={values.roomTypeSelected}
            roomAmenitiesSelected={values.roomAmenitiesSelected}
            setCustomValue={actions.setCustomValue}
            toggleMulti={actions.toggleMulti}
            register={register}
            watch={watch}
            subStep={inUnitComfortSubStep}
            setSubStep={setInUnitComfortSubStep}
            onUpdateKerbySpeech={(speech, pose) => {
              setDynamicSpeechOverride(speech);
              if (pose) setDynamicPoseOverride(pose);
            }}
            onTotalSubStepsChange={(count) => setTotalInUnitSubSteps(count)}
            showValidationError={inUnitValidationError}
            onClearValidationError={() => setInUnitValidationError(false)}
            isBranchB={dynamicIsBranchB}
            onLoadingChange={setIsStepLoading}
          />
        );

      case STEPS.RULES:
        return (
          <RulesStep
            propertyTypeSelected={values.propertyTypeSelected}
            rulesSelected={values.rulesSelected}
            setCustomValue={actions.setCustomValue}
            toggleMulti={actions.toggleMulti}
            register={register}
            watch={watch}
            subStep={rulesSubStep}
            setSubStep={(val) => {
              setRulesValidationError(false);
              setRulesSubStep(val);
            }}
            onUpdateKerbySpeech={(speech, pose) => {
              setDynamicSpeechOverride(speech);
              if (pose) setDynamicPoseOverride(pose);
            }}
            onTotalSubStepsChange={(count) => setTotalRulesSubSteps(count)}
            showValidationError={rulesValidationError}
            onClearValidationError={() => setRulesValidationError(false)}
            onLoadingChange={setIsStepLoading}
          />
        );

      case STEPS.ADVANCED_FEATURES:
        return (
          <AdvancedStep
            propertyTypeSelected={values.propertyTypeSelected}
            advancedSelected={values.advancedSelected}
            setCustomValue={actions.setCustomValue}
            toggleMulti={actions.toggleMulti}
            register={register}
            watch={watch}
            subStep={advancedSubStep}
            setSubStep={setAdvancedSubStep}
            onUpdateKerbySpeech={(speech, pose) => {
              setDynamicSpeechOverride(speech);
              if (pose) setDynamicPoseOverride(pose);
            }}
            onTotalSubStepsChange={(count) => setTotalAdvancedSubSteps(count)}
            isBranchB={dynamicIsBranchB}
            onLoadingChange={setIsStepLoading}
          />
        );

      case STEPS.SUMMARY:
        return (
          <SummaryStep
            {...values}
            roomType={values.roomTypeSelected.length > 0 ? values.roomTypeSelected[0] : ""}
            isBranchB={dynamicIsBranchB}
            onStepClick={(stepId) => setStep(stepId)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full h-full flex items-end md:items-center justify-center ${isMapOverlay ? 'p-0 md:p-4' : 'p-0 md:p-6 lg:p-12'}`}>
      <motion.div
        drag={isMobile ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.8 }}
        onDragEnd={(e, { offset, velocity }) => {
          if (isMobile && (offset.y > 70 || velocity.y > 250)) {
            onCloseModal?.();
          }
        }}
        className={`w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-t md:border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden font-sans rounded-t-[32px] rounded-b-none md:rounded-3xl transition-colors duration-150 h-auto max-h-[88vh] mt-auto mb-0 ${
          showWizard
            ? isMapOverlay
              ? "md:h-[80vh] md:max-h-[82vh] md:max-w-4xl mx-auto md:my-auto"
              : "md:w-full md:h-full md:max-h-full mx-auto md:my-auto"
            : "max-w-2xl mx-auto md:my-auto"
        }`}
      >
        {/* Mobile Draggable Pull Handle Line */}
        <div 
          onPointerDown={(e) => isMobile && dragControls.start(e)}
          className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 md:hidden shrink-0 cursor-grab active:cursor-grabbing touch-none" 
        />

        {/* Top Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="p-2 md:p-2.5 rounded-xl bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 border border-[#2f7d6d]/30 shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                BoardTAU Search
              </h2>
              <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
                {showWizard ? "Guided Search Wizard" : "Spotlight AI Search"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Wizard vs Spotlight */}
            <button
              type="button"
              onClick={() => setShowWizard(!showWizard)}
              className={`px-3 md:px-3.5 py-1.5 md:py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                showWizard
                  ? "bg-[#2f7d6d] text-white border-[#2f7d6d] shadow-[#2f7d6d]/20"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200"
              }`}
              title="Toggle Filter Wizard"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{showWizard ? "Spotlight Search" : "Guided Wizard"}</span>
            </button>

            {/* Close Modal Button (Desktop Only) */}
            <button
              type="button"
              onClick={onCloseModal}
              className="hidden md:flex p-1.5 md:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main View Area */}
        {!showWizard ? (
          /* VIEW 1: Compact Spotlight AI Search (~700px width) */
          <div className="p-4 md:p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
              {/* Search Input Bar */}
              <form onSubmit={handleSpotlightSubmit} className="flex gap-2.5">
                <div className="relative flex-1 min-w-0">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={spotlightQuery}
                    onChange={(e) => setSpotlightQuery(e.target.value)}
                    placeholder='Ask Kerby AI: "Studio apartment under ₱3000 near CET with WiFi..."'
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2f7d6d] transition-all text-sm font-medium"
                    disabled={isAiLoading}
                    autoFocus
                  />
                  {isAiLoading ? (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-[#2f7d6d]" />
                  ) : spotlightQuery ? (
                    <button
                      type="button"
                      onClick={() => setSpotlightQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>

                {/* Search Button (Desktop Only inside top bar) */}
                <button
                  type="submit"
                  disabled={isAiLoading || !spotlightQuery.trim()}
                  className="hidden md:flex px-5 py-3.5 rounded-2xl bg-[#2f7d6d] hover:bg-[#256659] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Search
                </button>

                {/* Toggle Wizard Button */}
                <button
                  type="button"
                  onClick={() => setShowWizard(true)}
                  className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 transition-all shrink-0"
                  title="Open Advanced Filters"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </form>

              {/* Quick AI Suggestions */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Quick AI Search Prompts
                </h3>
                
                {/* Desktop View: Horizontal Pill Chips */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {[
                    "Solo room below ₱2000",
                    "Bedspace near TAU Main Gate",
                    "Apartment with WiFi and AC",
                    "Pet-friendly studio",
                    "Hostel suite near CET",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setSpotlightQuery(prompt)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#2f7d6d]" />
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Mobile View: 1-Column Cards */}
                <div className="grid md:hidden grid-cols-1 gap-2">
                  {[
                    { text: "Solo room below ₱2000", desc: "Affordable solo room deals" },
                    { text: "Bedspace near Main Gate", desc: "Short walk to campus entrance" },
                    { text: "Apartment with WiFi & AC", desc: "Full in-unit amenities" },
                    { text: "Pet-friendly studio", desc: "Pets & animals permitted" },
                    { text: "Hostel suite near CET", desc: "Engineering & Tech area" },
                    { text: "Female-only boarding house", desc: "Safe & secured for ladies" },
                  ].map((item) => (
                    <button
                      key={item.text}
                      type="button"
                      onClick={() => setSpotlightQuery(item.text)}
                      className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 transition-all text-left group"
                    >
                      <div className="p-1.5 rounded-xl bg-[#2f7d6d]/10 group-hover:bg-[#2f7d6d]/20 text-[#2f7d6d] dark:text-emerald-400 shrink-0 transition-colors">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                          {item.text}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Locations Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  TAU College Landmarks
                </h3>

                {/* Unified 2 Landmark Cards */}
                <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                  <button
                    type="button"
                    onClick={() => setSpotlightQuery("Near CET Engineering")}
                    className="flex items-center gap-2.5 md:gap-3.5 p-2.5 md:p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className="p-2 md:p-2.5 bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 rounded-xl shrink-0">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs md:text-sm text-slate-900 dark:text-white truncate">Near CET College</div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">Engineering Area</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpotlightQuery("Near Main Gate")}
                    className="flex items-center gap-2.5 md:gap-3.5 p-2.5 md:p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className="p-2 md:p-2.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                      <Home className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs md:text-sm text-slate-900 dark:text-white truncate">Near Main Gate</div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">Access point</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile Bottom Action Bar (Full Width Search Button for Mobile Only) */}
              <div className="block md:hidden pt-2 border-t border-slate-200/80 dark:border-white/10 mt-auto shrink-0">
                <button
                  type="button"
                  onClick={handleSpotlightSubmit}
                  disabled={isAiLoading || !spotlightQuery.trim()}
                  className="w-full py-3.5 rounded-2xl bg-[#2f7d6d] hover:bg-[#256659] disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-[#2f7d6d]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <SearchIcon className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 2: Full-Size Guided Wizard with Adaptive Kerby Mascot Panel */
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              {/* DESKTOP LEFT COLUMN: Full Kerby Mascot Panel */}
              <div className={`hidden md:flex flex-col justify-between w-full ${isMapOverlay ? 'md:w-[300px] lg:w-[320px] p-3.5' : 'md:w-[380px] lg:w-[420px] p-6'} border-r border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/40 flex-shrink-0 overflow-y-auto`}>
                <KerbyMascot
                  pose={dynamicPoseOverride || kerbyState.pose}
                  outfitMode={outfitMode}
                  speechText={dynamicSpeechOverride || kerbyState.speech}
                  badgeLabel={kerbyState.badge}
                  collegeName={outfitMode === "uniform" ? values.college : undefined}
                  bubblePosition="top"
                  guideType="search"
                  showCloseButton={false}
                />
              </div>

              {/* INTERACTIVE MOBILE KERBY BANNER PILL (Mobile Only) */}
              <div className="block md:hidden px-3 py-2 bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMobileKerbyModal(true)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:border-[#2f7d6d]/50 transition-all text-left group"
                >
                  <div className="relative shrink-0 w-10 h-10 rounded-full bg-[#2f7d6d]/15 p-1 flex items-center justify-center overflow-hidden border border-[#2f7d6d]/30 group-hover:scale-105 transition-transform">
                    <img
                      src={`/assets/mascot/kerby-${outfitMode}-${dynamicPoseOverride || kerbyState.pose}.png`}
                      alt="Kerby mascot mobile avatar"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-[#2f7d6d] dark:text-emerald-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Kerby Assistant</span>
                      </span>
                      <span className="text-[10px] text-[#2f7d6d] dark:text-emerald-400 font-semibold bg-[#2f7d6d]/10 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#2f7d6d]/20">
                        Tap for full advice 💬
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {dynamicSpeechOverride || kerbyState.speech}
                    </p>
                  </div>
                </button>
              </div>

              {/* RIGHT COLUMN: Step Wizard */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950/40 overflow-hidden">
                {/* Progress Bar Header */}
                <div className="px-4 md:px-6 pt-3 md:pt-5 pb-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 shrink-0 overflow-x-auto no-scrollbar">
                  <ProgressBar
                    steps={activeSteps}
                    currentStepId={step}
                    maxUnlockedStepId={maxUnlockedStep}
                    onStepClick={(targetStepId) => setStep(targetStepId)}
                  />
                </div>

                {/* Scrollable Step Content Body */}
                <div ref={contentBodyRef} className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
                  {renderStepContent()}
                </div>

                {/* Bottom Action Footer Bar */}
                <div className="px-4 md:px-6 py-3 md:py-4 pb-safe md:pb-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
                  {step > STEPS.COLLEGE ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 md:px-5 py-2.5 md:py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs transition-all flex items-center gap-1.5 md:gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    {step < STEPS.SUMMARY ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={isStepLoading}
                        className="px-5 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 bg-[#2f7d6d] hover:bg-[#256659] text-white shadow-[#2f7d6d]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isStepLoading ? (
                          <>
                            <span>Loading...</span>
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            <span>Continue</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit(actions.onSubmit)}
                        className="px-6 md:px-8 py-3 md:py-3.5 rounded-2xl bg-[#2f7d6d] hover:bg-[#256659] text-white font-extrabold text-xs md:text-sm shadow-lg shadow-[#2f7d6d]/30 transition-all flex items-center gap-2 uppercase tracking-wider"
                      >
                        <SearchIcon className="w-4 h-4" />
                        <span>Search Properties</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* FLOATING MOBILE KERBY MASCOT MODAL OVERLAY (Portaled to document.body for 100% Full Screen Viewport Coverage) */}
        {mounted && typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {showMobileKerbyModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300 md:hidden"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2f7d6d] dark:text-emerald-400" />
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Kerby Assistant Advice
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMobileKerbyModal(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Full Kerby Component inside Mobile Popover */}
                  <KerbyMascot
                    pose={dynamicPoseOverride || kerbyState.pose}
                    outfitMode={outfitMode}
                    speechText={dynamicSpeechOverride || kerbyState.speech}
                    badgeLabel={kerbyState.badge}
                    collegeName={outfitMode === "uniform" ? values.college : undefined}
                  />

                  <button
                    type="button"
                    onClick={() => setShowMobileKerbyModal(false)}
                    className="w-full py-3 rounded-2xl bg-[#2f7d6d] hover:bg-[#256659] text-white font-bold text-xs shadow-md transition-all uppercase tracking-wider mt-1"
                  >
                    Got it! Continue Search
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </motion.div>
    </div>
  );
}
