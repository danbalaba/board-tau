"use client";

import React from "react";
import Modal from "./Modal";
import { useSearchLogic, STEPS } from "./search-modal/useSearchLogic";
import ProgressBar from "./search-modal/components/ProgressBar";
import StepButton from "./search-modal/components/StepButton";
import Button from "../common/Button";

// Import Steps
import CollegeStep from "./search-modal/steps/CollegeStep";
import BudgetStep from "./search-modal/steps/BudgetStep";
import RoomTypeStep from "./search-modal/steps/RoomTypeStep";
import RoomAmenitiesStep from "./search-modal/steps/RoomAmenitiesStep";
import BedSetupStep from "./search-modal/steps/BedSetupStep";
import LocationStep from "./search-modal/steps/LocationStep";
import CategoryStep from "./search-modal/steps/CategoryStep";
import AmenitiesStep from "./search-modal/steps/AmenitiesStep";
import RulesStep from "./search-modal/steps/RulesStep";
import AdvancedStep from "./search-modal/steps/AdvancedStep";
import SummaryStep from "./search-modal/steps/SummaryStep";

export default function SearchModal({ onCloseModal }: { onCloseModal?: () => void }) {
  const { 
    step, 
    form: { handleSubmit, register, formState: { errors }, watch },
    values,
    actions 
  } = useSearchLogic(onCloseModal);

  const activeSteps = React.useMemo(() => {
    const steps = [
      { id: STEPS.COLLEGE, label: "College" },
      { id: STEPS.BUDGET, label: "Budget" },
      { id: STEPS.ROOM_TYPE, label: "Room Type" },
    ];
    if (values.roomType) {
      steps.push({ id: STEPS.ROOM_AMENITIES, label: "Room Config" });
      steps.push({ id: STEPS.BED_SETUP, label: "Bed Setup" });
    }
    steps.push(
      { id: STEPS.LOCATION, label: "Location" },
      { id: STEPS.CATEGORY, label: "Category" },
      { id: STEPS.AMENITIES, label: "Amenities" },
      { id: STEPS.RULES, label: "Rules" },
      { id: STEPS.ADVANCED, label: "Advanced" },
      { id: STEPS.SUMMARY, label: "Summary" }
    );
    return steps;
  }, [values.roomType]);

  const currentStepIndex = activeSteps.findIndex(s => s.id === step) + 1;
  const totalSteps = activeSteps.length;

  const renderStep = () => {
    switch (step) {
      case STEPS.COLLEGE:
        return <CollegeStep college={values.college} setCustomValue={actions.setCustomValue} mapCenter={values.mapCenter} />;
      case STEPS.BUDGET:
        return <BudgetStep register={register} errors={errors} watch={watch} minPrice={values.minPrice} maxPrice={values.maxPrice} />;
      case STEPS.ROOM_TYPE:
        return <RoomTypeStep roomType={values.roomType} setCustomValue={actions.setCustomValue} />;
      case STEPS.ROOM_AMENITIES:
        return (
          <RoomAmenitiesStep 
            roomType={values.roomType} 
            roomAmenitiesSelected={values.roomAmenitiesSelected} 
            toggleMulti={actions.toggleMulti} 
          />
        );
      case STEPS.BED_SETUP:
        return (
          <BedSetupStep 
            roomType={values.roomType} 
            bedType={values.bedType} 
            setCustomValue={actions.setCustomValue} 
            register={register} 
            errors={errors} 
            watch={watch} 
          />
        );
      case STEPS.LOCATION:
        return (
          <LocationStep 
            distance={values.distance} 
            college={values.college} 
            setCustomValue={actions.setCustomValue} 
            register={register} 
            watch={watch} 
            mapCenter={values.mapCenter} 
          />
        );
      case STEPS.CATEGORY:
        return <CategoryStep categoriesSelected={values.categoriesSelected} toggleMulti={actions.toggleMulti} />;
      case STEPS.AMENITIES:
        return <AmenitiesStep amenitiesSelected={values.amenitiesSelected} toggleMulti={actions.toggleMulti} />;
      case STEPS.RULES:
        return <RulesStep rulesSelected={values.rulesSelected} toggleMulti={actions.toggleMulti} />;
      case STEPS.ADVANCED:
        return <AdvancedStep advancedSelected={values.advancedSelected} toggleMulti={actions.toggleMulti} />;
      case STEPS.SUMMARY:
        return <SummaryStep {...values} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full md:h-[660px] w-full bg-white dark:bg-gray-900 flex flex-col font-sans overflow-hidden">
      <Modal.WindowHeader title={`Step ${currentStepIndex} of ${totalSteps} · BoardTAU`} />
      
      <ProgressBar steps={activeSteps} currentStepId={step} />
      
      <form
        className="h-auto flex-1 min-h-0 border-0 relative flex flex-col w-full bg-white dark:bg-gray-900 outline-none focus:outline-none"
        onSubmit={handleSubmit(actions.onSubmit)}
      >
        <div className="relative p-6 overflow-y-auto flex-1 custom-scrollbar flex flex-col pt-4">
          {renderStep()}
        </div>
        
        <div className="flex flex-col gap-2 px-6 pb-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
          <div className="flex justify-between items-center gap-4">
            {step > STEPS.COLLEGE && (
              <button 
                type="button" 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 font-bold text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm active:scale-95" 
                onClick={actions.onBack}
              >
                BACK
              </button>
            )}
            
            <div className="flex-1">
              <StepButton 
                step={currentStepIndex} 
                totalSteps={totalSteps} 
                isFilled={actions.isStepFilled()} 
                onNext={actions.onNext} 
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
