'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import Input from '@/components/inputs/Input';
import Checkbox from '@/components/inputs/Checkbox';
import { 
  Bath, Check, CheckCircle, ShieldCheck, ListChecks, Info, PlusCircle, HelpCircle, 
  PenTool, FileText, Sparkles, Shield, Star, Utensils, Refrigerator, Coffee,
  Flame, Wifi, Car, WashingMachine, ChevronRight, ChevronLeft, Lock, PawPrint, VolumeX, Users, PawPrint as PawIcon, Clock, AlertTriangle, Eye, UploadCloud, Building2, RotateCcw, AlertCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SignatureModal from './SignatureModal';
import FileUpload from '@/components/common/FileUpload';
import { motion, AnimatePresence } from 'framer-motion';
import SignaturePad from '@/components/common/SignaturePad';
import { getCachedAttributes, getSyncAttributes, getCachedSubGroups, getSyncSubGroups, getSyncPropertyTypes, getCachedPropertyTypes, getCachedRoomTypes, getSyncRoomTypes } from '@/lib/landlordTaxonomyCache';
import { cn } from '@/utils/helper';
import { generateLeaseContractPDF } from '@/utils/contractPdfGenerator';

interface PropertyConfigStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
  getValues: any;
  setValue: any;
  setError?: any;
  clearErrors?: any;
  isEditMode?: boolean;
  onCustomNavChange?: (nav: { nextLabel: string; backLabel: string; onNext: () => void; onBack: () => void } | null) => void;
  onMainNext?: () => void;
  onMainBack?: () => void;
}

const getSafeLucideIcon = (iconName: string, defaultIcon: any = Sparkles) => {
  if (!iconName) return defaultIcon;
  const IconObj = (LucideIcons as Record<string, any>)[iconName];
  if (IconObj && (typeof IconObj === 'function' || typeof IconObj === 'object')) {
    return IconObj;
  }
  return defaultIcon;
};

export default function PropertyConfigStep({
  register,
  errors,
  watch,
  getValues,
  setValue,
  setError,
  clearErrors,
  isEditMode = false,
  onCustomNavChange,
  onMainNext,
  onMainBack
}: PropertyConfigStepProps) {
  // Navigation Sub-Step State (1 to 5) with Auto-Save Draft Persistence
  const savedSubStep = watch('propertyConfig.subStep');
  const savedMaxUnlockedSubStep = watch('propertyConfig.maxUnlockedSubStep');
  const savedActiveAmenityTab = watch('propertyConfig.activeAmenityTab');
  const savedMaxUnlockedAmenityIndex = watch('propertyConfig.maxUnlockedAmenityIndex');
  const savedActiveRuleTab = watch('propertyConfig.activeRuleTab');
  const savedMaxUnlockedRuleIndex = watch('propertyConfig.maxUnlockedRuleIndex');
  const savedActiveFeatureTab = watch('propertyConfig.activeFeatureTab');
  const savedMaxUnlockedFeatureIndex = watch('propertyConfig.maxUnlockedFeatureIndex');

  const [subStep, setSubStep] = useState<number>(() => (typeof savedSubStep === 'number' && savedSubStep >= 1 && savedSubStep <= 5 ? savedSubStep : 1));
  const [maxUnlockedSubStep, setMaxUnlockedSubStep] = useState<number>(() => (isEditMode ? 5 : typeof savedMaxUnlockedSubStep === 'number' && savedMaxUnlockedSubStep >= 1 ? savedMaxUnlockedSubStep : 1));

  // Sub-Group Active Tab & Unlocked Index State
  const [activeAmenityTab, setActiveAmenityTab] = useState<string>(() => (typeof savedActiveAmenityTab === 'string' && savedActiveAmenityTab ? savedActiveAmenityTab : 'KITCHEN_APP'));
  const [maxUnlockedAmenityIndex, setMaxUnlockedAmenityIndex] = useState<number>(() => (isEditMode ? 999 : typeof savedMaxUnlockedAmenityIndex === 'number' ? savedMaxUnlockedAmenityIndex : 0));

  const [activeRuleTab, setActiveRuleTab] = useState<string>(() => (typeof savedActiveRuleTab === 'string' && savedActiveRuleTab ? savedActiveRuleTab : 'GENDER_POLICY'));
  const [maxUnlockedRuleIndex, setMaxUnlockedRuleIndex] = useState<number>(() => (isEditMode ? 999 : typeof savedMaxUnlockedRuleIndex === 'number' ? savedMaxUnlockedRuleIndex : 0));

  const [activeFeatureTab, setActiveFeatureTab] = useState<string>(() => (typeof savedActiveFeatureTab === 'string' && savedActiveFeatureTab ? savedActiveFeatureTab : 'SECURITY'));
  const [maxUnlockedFeatureIndex, setMaxUnlockedFeatureIndex] = useState<number>(() => (isEditMode ? 999 : typeof savedMaxUnlockedFeatureIndex === 'number' ? savedMaxUnlockedFeatureIndex : 0));

  useEffect(() => {
    if (isEditMode) {
      setMaxUnlockedSubStep(5);
      setMaxUnlockedAmenityIndex(999);
      setMaxUnlockedRuleIndex(999);
      setMaxUnlockedFeatureIndex(999);
    }
  }, [isEditMode]);

  const [showRuleValidationError, setShowRuleValidationError] = useState<boolean>(false);



  // Sync state changes safely to FormProvider inside useEffect (outside render phase, avoiding redundant updates)
  useEffect(() => {
    if (!setValue || !watch) return;
    if (watch('propertyConfig.subStep') !== subStep) {
      setValue('propertyConfig.subStep', subStep, { shouldTouch: false });
    }
    if (watch('propertyConfig.maxUnlockedSubStep') !== maxUnlockedSubStep) {
      setValue('propertyConfig.maxUnlockedSubStep', maxUnlockedSubStep, { shouldTouch: false });
    }
    if (watch('propertyConfig.activeAmenityTab') !== activeAmenityTab) {
      setValue('propertyConfig.activeAmenityTab', activeAmenityTab, { shouldTouch: false });
    }
    if (watch('propertyConfig.maxUnlockedAmenityIndex') !== maxUnlockedAmenityIndex) {
      setValue('propertyConfig.maxUnlockedAmenityIndex', maxUnlockedAmenityIndex, { shouldTouch: false });
    }
    if (watch('propertyConfig.activeRuleTab') !== activeRuleTab) {
      setValue('propertyConfig.activeRuleTab', activeRuleTab, { shouldTouch: false });
    }
    if (watch('propertyConfig.maxUnlockedRuleIndex') !== maxUnlockedRuleIndex) {
      setValue('propertyConfig.maxUnlockedRuleIndex', maxUnlockedRuleIndex, { shouldTouch: false });
    }
    if (watch('propertyConfig.activeFeatureTab') !== activeFeatureTab) {
      setValue('propertyConfig.activeFeatureTab', activeFeatureTab, { shouldTouch: false });
    }
    if (watch('propertyConfig.maxUnlockedFeatureIndex') !== maxUnlockedFeatureIndex) {
      setValue('propertyConfig.maxUnlockedFeatureIndex', maxUnlockedFeatureIndex, { shouldTouch: false });
    }
  }, [
    subStep,
    maxUnlockedSubStep,
    activeAmenityTab,
    maxUnlockedAmenityIndex,
    activeRuleTab,
    maxUnlockedRuleIndex,
    activeFeatureTab,
    maxUnlockedFeatureIndex,
    setValue,
    watch,
  ]);

  // Modals
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // Custom Clause Input
  const [customClauseText, setCustomClauseText] = useState('');
  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);
  const [isLoadingAttrs, setIsLoadingAttrs] = useState<boolean>(() => !getSyncAttributes() || getSyncAttributes()!.length === 0);

  // Fetch Taxonomy & Sub-Groups
  useEffect(() => {
    const syncAttrs = getSyncAttributes();
    if (syncAttrs && syncAttrs.length > 0) {
      setDynamicAttributes(syncAttrs);
      setIsLoadingAttrs(false);
    } else {
      getCachedAttributes().then(attrs => {
        setDynamicAttributes(attrs);
        setIsLoadingAttrs(false);
      });
    }

    const syncSgs = getSyncSubGroups();
    if (syncSgs && syncSgs.length > 0) {
      setDbSubGroups(syncSgs);
    } else {
      getCachedSubGroups().then(sgs => {
        setDbSubGroups(sgs);
      });
    }
  }, []);

  // Sub-step setup choices
  const kitchenSetup = watch('propertyConfig.kitchenSetup') || ''; // '' (unselected), 'SHARED' or 'IN_UNIT'
  const bathroomSetup = watch('propertyConfig.bathroomSetup') || ''; // '' (unselected), 'SHARED' or 'PRIVATE'
  const contractMode = watch('propertyConfig.contractMode') || 'AUTO_GEN'; // 'AUTO_GEN' or 'CUSTOM_PDF'
  const selectedPropertyTypeId = watch('propertyInfo.propertyTypeId') || watch('businessInfo.businessType') || '';
  const watchCategory = watch('propertyInfo.category') || '';

  // Ensure default contract mode is explicitly synced into react-hook-form state
  useEffect(() => {
    if (!getValues('propertyConfig.contractMode')) {
      setValue('propertyConfig.contractMode', 'AUTO_GEN', { shouldValidate: true });
    }
  }, [getValues, setValue]);

  // Ensure propertyTypes cache is populated
  useEffect(() => {
    if (!getSyncPropertyTypes()) {
      getCachedPropertyTypes();
    }
  }, []);

  const cachedPropertyTypes = getSyncPropertyTypes() || [];
  const matchedPropertyType = cachedPropertyTypes.find(
    (pt: any) => pt.id === selectedPropertyTypeId || pt.name === selectedPropertyTypeId
  );

  const resolvedCategoryName = matchedPropertyType?.name || watchCategory || selectedPropertyTypeId || '';

  // Fetch room types for selected property type to determine if pricing mode is flat rate
  const [propRoomTypes, setPropRoomTypes] = useState<any[]>(() => 
    selectedPropertyTypeId ? getSyncRoomTypes(selectedPropertyTypeId) || [] : []
  );

  useEffect(() => {
    if (selectedPropertyTypeId) {
      const syncRoomTypes = getSyncRoomTypes(selectedPropertyTypeId);
      if (syncRoomTypes) {
        setPropRoomTypes(syncRoomTypes);
        return;
      }
      getCachedRoomTypes(selectedPropertyTypeId).then((options: any[]) => {
        setPropRoomTypes(options);
      });
    }
  }, [selectedPropertyTypeId]);

  const isApartmentOrFlatRate = useMemo(() => {
    // 1. Primary DB Check: Check if room types for this PropertyType in database are flat rate
    if (propRoomTypes && propRoomTypes.length > 0) {
      const hasFlatRate = propRoomTypes.some((rt: any) => rt.isFlatRate === true);
      if (hasFlatRate) return true;
    }

    // 2. Name Check: Match flat-rate property categories (Apartment, Transient House, Agri-Hostel, etc.)
    const lowerName = (resolvedCategoryName || '').toLowerCase();
    const lowerCategory = (watchCategory || '').toLowerCase();
    const lowerId = (selectedPropertyTypeId || '').toLowerCase();
    const combined = `${lowerName} ${lowerCategory} ${lowerId}`;

    return (
      combined.includes('apartment') ||
      combined.includes('flat') ||
      combined.includes('transient') ||
      combined.includes('agri') ||
      combined.includes('hostel') ||
      combined.includes('unit') ||
      combined.includes('suite') ||
      combined.includes('villa') ||
      combined.includes('apt') ||
      combined.includes('trans')
    );
  }, [propRoomTypes, resolvedCategoryName, watchCategory, selectedPropertyTypeId]);

  const isAttrMatchingPropertyType = useMemo(() => {
    return (attr: any) => {
      if (attr.isUniversal) return true;
      if (!selectedPropertyTypeId && !resolvedCategoryName) return true;

      const typeIds: string[] = Array.isArray(attr.propertyTypeIds) ? attr.propertyTypeIds : [];
      const typeNames: string[] = Array.isArray(attr.propertyTypeNames)
        ? attr.propertyTypeNames
        : Array.isArray(attr.propertyTypes)
        ? attr.propertyTypes.map((pt: any) => (pt.name || pt).toString())
        : [];

      if (typeIds.length === 0 && typeNames.length === 0) return true;

      if (selectedPropertyTypeId && typeIds.includes(selectedPropertyTypeId)) return true;
      if (matchedPropertyType?.id && typeIds.includes(matchedPropertyType.id)) return true;

      const targetCategory = (resolvedCategoryName || matchedPropertyType?.name || '').toLowerCase();
      if (targetCategory && typeNames.length > 0) {
        return typeNames.some((n: string) => {
          const lowerName = n.toLowerCase();
          return lowerName.includes(targetCategory) || targetCategory.includes(lowerName);
        });
      }

      if (cachedPropertyTypes.length > 0 && typeIds.length > 0) {
        const matchedPropTypes = cachedPropertyTypes.filter((pt: any) => typeIds.includes(pt.id));
        if (matchedPropTypes.length > 0) {
          return matchedPropTypes.some((pt: any) => {
            const pName = (pt.name || '').toLowerCase();
            return pName.includes(targetCategory) || targetCategory.includes(pName);
          });
        }
      }

      return false;
    };
  }, [selectedPropertyTypeId, resolvedCategoryName, matchedPropertyType, cachedPropertyTypes]);

  const SINGLE_SELECT_RULE_SUBGROUPS = useMemo(() => ['GENDER_POLICY', 'CURFEW', 'VISITOR_POLICY', 'PET_POLICY', 'SMOKING_POLICY', 'ALCOHOL_POLICY'], []);
  const REQUIRED_RULE_SUBGROUPS = useMemo(() => ['GENDER_POLICY', 'CURFEW', 'VISITOR_POLICY', 'PET_POLICY', 'SMOKING_POLICY', 'ALCOHOL_POLICY'], []);

  const selectedAmenities = watch('propertyConfig.amenities') || [];
  const currentRules = watch('propertyConfig.rules') || {};

  const isSingleGenderProperty = useMemo(() => {
    const amenitiesArr: string[] = Array.isArray(selectedAmenities) ? selectedAmenities : [];
    const rulesObj = currentRules || {};
    if (rulesObj.femaleOnly || rulesObj.maleOnly) return true;

    return dynamicAttributes.some(a => {
      if (a.subGroupKey !== 'GENDER_POLICY') return false;
      const isSelected = amenitiesArr.includes(a.id) || amenitiesArr.includes(String(a.id)) || amenitiesArr.includes(a.name);
      if (!isSelected) return false;
      const nameLower = (a.name || '').toLowerCase();
      return nameLower.includes('female-only') || nameLower.includes('female only') || nameLower.includes('male-only') || nameLower.includes('male only');
    });
  }, [selectedAmenities, currentRules, dynamicAttributes]);

  const isVisitorAttrVisible = useCallback((attr: any) => {
    if (attr.subGroupKey !== 'VISITOR_POLICY') return true;
    if (!isSingleGenderProperty) return true;
    const nameLower = (attr.name || '').toLowerCase();
    const keyLower = (attr.key || attr.id || '').toLowerCase();
    if (
      nameLower.includes('restricted from female') ||
      nameLower.includes('restricted from male') ||
      keyLower.includes('restricted')
    ) {
      return false;
    }
    return true;
  }, [isSingleGenderProperty]);

  const checkRuleSubGroupHasSelection = useCallback((subGroupKey: string) => {
    if (!REQUIRED_RULE_SUBGROUPS.includes(subGroupKey)) return true;

    const amenitiesArr: string[] = Array.isArray(getValues('propertyConfig.amenities'))
      ? getValues('propertyConfig.amenities')
      : Array.isArray(selectedAmenities)
      ? selectedAmenities
      : [];
    const rulesObj = getValues('propertyConfig.rules') || currentRules || {};

    const groupAttrs = dynamicAttributes.filter(
      a => isAttrMatchingPropertyType(a) && a.type === 'RULE' && a.subGroupKey === subGroupKey && isVisitorAttrVisible(a)
    );

    if (groupAttrs.length === 0) return true;

    const hasAttrSelected = groupAttrs.some(a =>
      amenitiesArr.includes(a.id) ||
      amenitiesArr.includes(String(a.id)) ||
      amenitiesArr.includes(a.name)
    );

    if (hasAttrSelected) return true;

    if (subGroupKey === 'GENDER_POLICY') {
      if (rulesObj.femaleOnly || rulesObj.maleOnly) return true;
    }
    if (subGroupKey === 'CURFEW') {
      if (rulesObj.noCurfew) return true;
    }
    if (subGroupKey === 'VISITOR_POLICY') {
      if (rulesObj.visitorsAllowed !== undefined && rulesObj.visitorsAllowed !== null) return true;
    }
    if (subGroupKey === 'PET_POLICY') {
      if (rulesObj.petsAllowed !== undefined && rulesObj.petsAllowed !== null) return true;
    }

    return false;
  }, [selectedAmenities, currentRules, dynamicAttributes, isAttrMatchingPropertyType, isVisitorAttrVisible, getValues, REQUIRED_RULE_SUBGROUPS]);

  useEffect(() => {
    if (checkRuleSubGroupHasSelection(activeRuleTab)) {
      setShowRuleValidationError(false);
    }
  }, [activeRuleTab, checkRuleSubGroupHasSelection]);

  const handleAttributeToggle = (attr: any) => {
    const isSingleSelect = SINGLE_SELECT_RULE_SUBGROUPS.includes(attr.subGroupKey);
    const currentAmenitiesArr: string[] = Array.isArray(getValues('propertyConfig.amenities'))
      ? getValues('propertyConfig.amenities')
      : Array.isArray(selectedAmenities)
      ? selectedAmenities
      : [];

    const groupAttrIds = dynamicAttributes
      .filter(a => a.subGroupKey === attr.subGroupKey)
      .map(a => a.id);
    const groupAttrNames = dynamicAttributes
      .filter(a => a.subGroupKey === attr.subGroupKey)
      .map(a => a.name);

    let newAmenities: string[] = [];

    if (isSingleSelect) {
      const filtered = currentAmenitiesArr.filter(
        val => !groupAttrIds.includes(val) && !groupAttrIds.includes(String(val)) && !groupAttrNames.includes(val)
      );
      newAmenities = [...filtered, attr.id];
    } else {
      const exists = currentAmenitiesArr.includes(attr.id) || currentAmenitiesArr.includes(String(attr.id));
      if (exists) {
        newAmenities = currentAmenitiesArr.filter(val => val !== attr.id && val !== String(attr.id));
      } else {
        newAmenities = [...currentAmenitiesArr, attr.id];
      }
    }

    setValue('propertyConfig.amenities', newAmenities, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

    if (attr.subGroupKey === 'GENDER_POLICY') {
      const nameLower = (attr.name || '').toLowerCase();
      if (nameLower.includes('female-only') || nameLower.includes('female only')) {
        setValue('propertyConfig.rules.femaleOnly', true, { shouldValidate: true });
        setValue('propertyConfig.rules.maleOnly', false, { shouldValidate: true });
      } else if (nameLower.includes('male-only') || nameLower.includes('male only')) {
        setValue('propertyConfig.rules.maleOnly', true, { shouldValidate: true });
        setValue('propertyConfig.rules.femaleOnly', false, { shouldValidate: true });
      } else {
        setValue('propertyConfig.rules.femaleOnly', false, { shouldValidate: true });
        setValue('propertyConfig.rules.maleOnly', false, { shouldValidate: true });
      }
    } else if (attr.subGroupKey === 'CURFEW') {
      const nameLower = (attr.name || '').toLowerCase();
      if (nameLower.includes('no curfew') || nameLower.includes('24/7')) {
        setValue('propertyConfig.rules.noCurfew', true, { shouldValidate: true });
      } else {
        setValue('propertyConfig.rules.noCurfew', false, { shouldValidate: true });
      }
    } else if (attr.subGroupKey === 'VISITOR_POLICY') {
      const nameLower = (attr.name || '').toLowerCase();
      if (nameLower.includes('allowed') && !nameLower.includes('no visitor')) {
        setValue('propertyConfig.rules.visitorsAllowed', true, { shouldValidate: true });
      } else {
        setValue('propertyConfig.rules.visitorsAllowed', false, { shouldValidate: true });
      }
    } else if (attr.subGroupKey === 'PET_POLICY') {
      const nameLower = (attr.name || '').toLowerCase();
      if (nameLower.includes('pets allowed') && !nameLower.includes('no pet')) {
        setValue('propertyConfig.rules.petsAllowed', true, { shouldValidate: true });
      } else {
        setValue('propertyConfig.rules.petsAllowed', false, { shouldValidate: true });
      }
    }

    setShowRuleValidationError(false);
  };

  // Auto-default kitchenSetup and bathroomSetup for Apartments
  useEffect(() => {
    if (isApartmentOrFlatRate) {
      if (getValues('propertyConfig.kitchenSetup') !== 'IN_UNIT') {
        setValue('propertyConfig.kitchenSetup', 'IN_UNIT', { shouldValidate: true });
        if (clearErrors) clearErrors('propertyConfig.kitchenSetup');
      }
      if (getValues('propertyConfig.bathroomSetup') !== 'PRIVATE') {
        setValue('propertyConfig.bathroomSetup', 'PRIVATE', { shouldValidate: true });
        if (clearErrors) clearErrors('propertyConfig.bathroomSetup');
      }
      if (getValues('propertyConfig.bathroomCount') !== 0) {
        setValue('propertyConfig.bathroomCount', 0, { shouldValidate: true });
      }
    }
  }, [isApartmentOrFlatRate, setValue, getValues, clearErrors]);

  const dynamicRoomLabel = useMemo(() => {
    const lower = (resolvedCategoryName || '').toLowerCase();
    if (lower.includes('apartment') || lower.includes('flat') || lower.includes('complex')) {
      return 'Total Units / Apartments Available';
    }
    if (lower.includes('dorm') || lower.includes('dormitory') || lower.includes('boarding house') || lower.includes('hostel') || lower.includes('bh')) {
      return 'Total Rooms Available';
    }
    if (lower.includes('transient')) {
      return 'Total Rental Rooms Available';
    }
    return 'Total Rooms / Units Available';
  }, [resolvedCategoryName]);

  // Dynamic Icon Resolver Helper
  const resolveLucideIcon = (iconName?: string | null, Fallback: any = Sparkles) => {
    if (!iconName) return Fallback;
    const Comp = (LucideIcons as Record<string, any>)[iconName];
    return Comp || Fallback;
  };

  // Dynamic Sub-Groups (100% Database Driven & Filtered by Matching Attributes)
  const amenitySubGroups = useMemo(() => {
    const list: any[] = [];
    if (kitchenSetup === 'SHARED') {
      list.push({ key: 'KITCHEN_APP', label: 'Shared Kitchen', icon: Utensils });
    }
    if (bathroomSetup === 'SHARED') {
      list.push({ key: 'COMMON_CR', label: 'Common CR', icon: Bath });
    }

    const dbAmenitySgs = dbSubGroups
      .filter((sg: any) => {
        if (sg.type !== 'AMENITY' || sg.key === 'KITCHEN_APP' || sg.key === 'COMMON_CR') return false;

        const matchingAttrs = dynamicAttributes.filter((a: any) => {
          if (!a.isActive && a.status !== 'ACTIVE') return false;
          if (a.subGroupKey !== sg.key) return false;
          return isAttrMatchingPropertyType(a);
        });

        return matchingAttrs.length > 0;
      })
      .map((sg: any) => ({
        key: sg.key,
        label: sg.tabLabel || sg.title || sg.key,
        icon: resolveLucideIcon(sg.icon, Sparkles),
      }));

    list.push(...dbAmenitySgs);
    return list;
  }, [dbSubGroups, kitchenSetup, bathroomSetup, dynamicAttributes, isAttrMatchingPropertyType]);

  const ruleSubGroups = useMemo(() => {
    return dbSubGroups
      .filter((sg: any) => {
        if (sg.type !== 'RULE' || sg.key === 'SMOKE_ALCOHOL') return false;

        const matchingAttrs = dynamicAttributes.filter((a: any) => {
          if (!a.isActive && a.status !== 'ACTIVE') return false;
          if (a.subGroupKey !== sg.key) return false;
          return isAttrMatchingPropertyType(a);
        });

        return matchingAttrs.length > 0;
      })
      .map((sg: any) => ({
        key: sg.key,
        label: sg.tabLabel || sg.title || sg.key,
        icon: resolveLucideIcon(sg.icon, Shield),
      }));
  }, [dbSubGroups, dynamicAttributes, isAttrMatchingPropertyType]);

  const featureSubGroups = useMemo(() => {
    return dbSubGroups
      .filter((sg: any) => {
        if (sg.type !== 'FEATURE') return false;

        const matchingAttrs = dynamicAttributes.filter((a: any) => {
          if (!a.isActive && a.status !== 'ACTIVE') return false;
          if (a.subGroupKey !== sg.key) return false;
          return isAttrMatchingPropertyType(a);
        });

        return matchingAttrs.length > 0;
      })
      .map((sg: any) => ({
        key: sg.key,
        label: sg.tabLabel || sg.title || sg.key,
        icon: resolveLucideIcon(sg.icon, ShieldCheck),
      }));
  }, [dbSubGroups, dynamicAttributes, isAttrMatchingPropertyType]);

  // Auto-sync activeAmenityTab & clamp unlocked index ONLY if out of bounds (when property type changes)
  useEffect(() => {
    if (isLoadingAttrs) return;
    if (amenitySubGroups.length > 0) {
      const currIndex = amenitySubGroups.findIndex(g => g.key === activeAmenityTab);
      if (currIndex === -1) {
        setActiveAmenityTab(amenitySubGroups[0].key);
      }
      if (maxUnlockedAmenityIndex >= amenitySubGroups.length) {
        setMaxUnlockedAmenityIndex(Math.max(0, amenitySubGroups.length - 1));
      }
    }
  }, [isLoadingAttrs, amenitySubGroups, activeAmenityTab, maxUnlockedAmenityIndex]);

  // Auto-sync activeRuleTab & clamp unlocked index ONLY if out of bounds
  useEffect(() => {
    if (isLoadingAttrs) return;
    if (ruleSubGroups.length > 0) {
      const currIndex = ruleSubGroups.findIndex(g => g.key === activeRuleTab);
      if (currIndex === -1) {
        setActiveRuleTab(ruleSubGroups[0].key);
      }
      if (maxUnlockedRuleIndex >= ruleSubGroups.length) {
        setMaxUnlockedRuleIndex(Math.max(0, ruleSubGroups.length - 1));
      }
    }
  }, [isLoadingAttrs, ruleSubGroups, activeRuleTab, maxUnlockedRuleIndex]);

  // Auto-sync activeFeatureTab & clamp unlocked index ONLY if out of bounds
  useEffect(() => {
    if (isLoadingAttrs) return;
    if (featureSubGroups.length > 0) {
      const currIndex = featureSubGroups.findIndex(g => g.key === activeFeatureTab);
      if (currIndex === -1) {
        setActiveFeatureTab(featureSubGroups[0].key);
      }
      if (maxUnlockedFeatureIndex >= featureSubGroups.length) {
        setMaxUnlockedFeatureIndex(Math.max(0, featureSubGroups.length - 1));
      }
    }
  }, [isLoadingAttrs, featureSubGroups, activeFeatureTab, maxUnlockedFeatureIndex]);

  const handleSubStepChange = (targetSubStep: number) => {
    // If attempting to move forward to a higher subStep, validate current subStep first
    if (targetSubStep > subStep) {
      if (subStep === 1) {
        const kSetup = getValues('propertyConfig.kitchenSetup');
        const bSetup = getValues('propertyConfig.bathroomSetup');
        const totalRStr = getValues('propertyConfig.totalRooms');
        const bCountStr = getValues('propertyConfig.bathroomCount');
        let hasError = false;

        const totalR = parseInt(totalRStr, 10);
        if (!totalRStr || isNaN(totalR) || totalR < 1) {
          if (setError) setError('propertyConfig.totalRooms', { type: 'manual', message: 'Total rooms must be at least 1 unit' });
          hasError = true;
        } else if (totalR > 50) {
          if (setError) setError('propertyConfig.totalRooms', { type: 'manual', message: 'Maximum limit is 50 rooms' });
          hasError = true;
        } else {
          if (clearErrors) clearErrors('propertyConfig.totalRooms');
        }

        if (!kSetup) {
          if (setError) setError('propertyConfig.kitchenSetup', { type: 'required', message: 'Please select a kitchen setup option' });
          hasError = true;
        }

        if (!bSetup) {
          if (setError) setError('propertyConfig.bathroomSetup', { type: 'required', message: 'Please select a bathroom setup option' });
          hasError = true;
        }

        if (bSetup === 'SHARED') {
          const bCount = parseInt(bCountStr, 10);
          if (!bCountStr || isNaN(bCount) || bCount < 1) {
            if (setError) setError('propertyConfig.bathroomCount', { type: 'manual', message: 'Shared setup requires at least 1 common CR' });
            hasError = true;
          } else if (bCount > 6) {
            if (setError) setError('propertyConfig.bathroomCount', { type: 'manual', message: 'Common CRs cannot exceed 6' });
            hasError = true;
          } else if (totalR > 0 && bCount > totalR) {
            if (setError) setError('propertyConfig.bathroomCount', { type: 'manual', message: `Common CRs (${bCount}) cannot exceed total rooms (${totalR})` });
            hasError = true;
          } else {
            if (clearErrors) clearErrors('propertyConfig.bathroomCount');
          }
        }

        if (hasError) {
          return;
        }
      }

      if (subStep === 3) {
        if (!checkRuleSubGroupHasSelection(activeRuleTab)) {
          setShowRuleValidationError(true);
          return;
        }
      }

      // Do not allow jumping further than 1 step beyond the current max unlocked step
      if (targetSubStep > maxUnlockedSubStep + 1) {
        return;
      }
    }

    setMaxUnlockedSubStep(prev => Math.max(prev, targetSubStep));
    setSubStep(targetSubStep);
  };

  const handleAddClause = () => {
    if (!customClauseText.trim()) return;
    const currentClauses = watch('propertyConfig.customContractClauses') || [];
    setValue('propertyConfig.customContractClauses', [...currentClauses, customClauseText.trim()]);
    setCustomClauseText('');
  };

  const handleRemoveClause = (index: number) => {
    const currentClauses = watch('propertyConfig.customContractClauses') || [];
    setValue('propertyConfig.customContractClauses', currentClauses.filter((_: any, i: number) => i !== index));
  };

  const currentSignature = watch('propertyConfig.landlordSignatureBase64');

  const subStepHeaderRef = useRef<HTMLDivElement>(null);
  const amenityTabsRef = useRef<HTMLDivElement>(null);
  const ruleTabsRef = useRef<HTMLDivElement>(null);
  const featureTabsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active horizontal sub-step tab into view
  useEffect(() => {
    const timer = setTimeout(() => {
      if (subStepHeaderRef.current) {
        const activeEl = subStepHeaderRef.current.querySelector('[data-active="true"]');
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [subStep]);

  // Auto-scroll active horizontal amenity tab into view
  useEffect(() => {
    if (subStep === 2) {
      const timer = setTimeout(() => {
        if (amenityTabsRef.current) {
          const activeEl = amenityTabsRef.current.querySelector('[data-active="true"]');
          if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeAmenityTab, subStep]);

  // Auto-scroll active horizontal rule tab into view
  useEffect(() => {
    if (subStep === 3) {
      const timer = setTimeout(() => {
        if (ruleTabsRef.current) {
          const activeEl = ruleTabsRef.current.querySelector('[data-active="true"]');
          if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeRuleTab, subStep]);

  // Auto-scroll active horizontal feature tab into view
  useEffect(() => {
    if (subStep === 4) {
      const timer = setTimeout(() => {
        if (featureTabsRef.current) {
          const activeEl = featureTabsRef.current.querySelector('[data-active="true"]');
          if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeFeatureTab, subStep]);

  // Navigation handlers for Amenities Sub-groups
  const currentAmenityIndex = amenitySubGroups.findIndex(g => g.key === activeAmenityTab);

  const handleNextAmenity = () => {
    if (currentAmenityIndex >= 0 && currentAmenityIndex < amenitySubGroups.length - 1) {
      const nextIndex = currentAmenityIndex + 1;
      setMaxUnlockedAmenityIndex(prev => Math.max(prev, nextIndex));
      setActiveAmenityTab(amenitySubGroups[nextIndex].key);
    } else {
      if (maxUnlockedSubStep < 3) setMaxUnlockedSubStep(3);
      handleSubStepChange(3);
    }
  };

  const handleBackAmenity = () => {
    if (currentAmenityIndex > 0) {
      setActiveAmenityTab(amenitySubGroups[currentAmenityIndex - 1].key);
    } else {
      handleSubStepChange(1);
    }
  };

  // Navigation handlers for Rules Sub-groups
  const currentRuleIndex = ruleSubGroups.findIndex(g => g.key === activeRuleTab);

  const handleNextRule = () => {
    if (!checkRuleSubGroupHasSelection(activeRuleTab)) {
      setShowRuleValidationError(true);
      return;
    }
    setShowRuleValidationError(false);

    if (currentRuleIndex >= 0 && currentRuleIndex < ruleSubGroups.length - 1) {
      const nextIndex = currentRuleIndex + 1;
      setMaxUnlockedRuleIndex(prev => Math.max(prev, nextIndex));
      setActiveRuleTab(ruleSubGroups[nextIndex].key);
    } else {
      if (maxUnlockedSubStep < 4) setMaxUnlockedSubStep(4);
      handleSubStepChange(4);
    }
  };

  const handleBackRule = () => {
    if (currentRuleIndex > 0) {
      setActiveRuleTab(ruleSubGroups[currentRuleIndex - 1].key);
    } else {
      handleSubStepChange(2);
      if (amenitySubGroups.length > 0) {
        setActiveAmenityTab(amenitySubGroups[amenitySubGroups.length - 1].key);
      }
    }
  };

  // Navigation handlers for Security Sub-groups
  const currentFeatureIndex = featureSubGroups.findIndex(g => g.key === activeFeatureTab);

  const handleNextFeature = () => {
    if (currentFeatureIndex >= 0 && currentFeatureIndex < featureSubGroups.length - 1) {
      const nextIndex = currentFeatureIndex + 1;
      setMaxUnlockedFeatureIndex(prev => Math.max(prev, nextIndex));
      setActiveFeatureTab(featureSubGroups[nextIndex].key);
    } else {
      if (maxUnlockedSubStep < 5) setMaxUnlockedSubStep(5);
      handleSubStepChange(5);
    }
  };

  const handleBackFeature = () => {
    if (currentFeatureIndex > 0) {
      setActiveFeatureTab(featureSubGroups[currentFeatureIndex - 1].key);
    } else {
      handleSubStepChange(3);
      if (ruleSubGroups.length > 0) {
        setActiveRuleTab(ruleSubGroups[ruleSubGroups.length - 1].key);
      }
    }
  };

  const [modeError, setModeError] = useState(false);
  const [detailsError, setDetailsError] = useState(false);
  const [detailsErrorMessage, setDetailsErrorMessage] = useState('');
  const [signatureError, setSignatureError] = useState(false);

  const depositVal = watch('propertyConfig.depositAmount');
  const noticeVal = watch('propertyConfig.moveOutNoticeDays');
  const customPdfVal = watch('propertyConfig.customPdfUrl');

  // Real-time clearance of details section error as user types valid inputs
  useEffect(() => {
    if (!detailsError) return;
    const mode = watch('propertyConfig.contractMode');
    if (mode === 'AUTO_GEN') {
      const depNum = Number(depositVal);
      const notNum = Number(noticeVal);
      if (
        depositVal !== undefined && depositVal !== null && depositVal !== '' &&
        !isNaN(depNum) && depNum >= 500 && depNum <= 50000 &&
        noticeVal !== undefined && noticeVal !== null && noticeVal !== '' &&
        !isNaN(notNum) && notNum >= 7 && notNum <= 90
      ) {
        setDetailsError(false);
        setDetailsErrorMessage('');
      }
    } else if (mode === 'CUSTOM_PDF') {
      if (customPdfVal) {
        setDetailsError(false);
        setDetailsErrorMessage('');
      }
    }
  }, [depositVal, noticeVal, customPdfVal, detailsError, watch]);

  const handleNextContract = () => {
    const mode = getValues('propertyConfig.contractMode') || watch('propertyConfig.contractMode') || '';
    const sig = getValues('propertyConfig.landlordSignatureBase64') || watch('propertyConfig.landlordSignatureBase64');
    const pdfUrl = getValues('propertyConfig.customPdfUrl') || watch('propertyConfig.customPdfUrl');
    const deposit = getValues('propertyConfig.depositAmount');
    const noticeDays = getValues('propertyConfig.moveOutNoticeDays');

    let hasError = false;

    if (!mode) {
      setModeError(true);
      hasError = true;
    } else {
      setModeError(false);
    }

    if (mode === 'CUSTOM_PDF') {
      if (!pdfUrl) {
        setDetailsError(true);
        setDetailsErrorMessage('Please upload your custom lease contract PDF document before proceeding to Room Setup.');
        hasError = true;
      } else {
        setDetailsError(false);
      }
    } else if (mode === 'AUTO_GEN') {
      const depNum = Number(deposit);
      const notNum = Number(noticeDays);
      if (deposit === undefined || deposit === null || deposit === '' || isNaN(depNum) || depNum < 500 || depNum > 50000) {
        setDetailsError(true);
        setDetailsErrorMessage('Standard Security Deposit must be a valid amount between ₱500 and ₱50,000.');
        hasError = true;
      } else if (noticeDays === undefined || noticeDays === null || noticeDays === '' || isNaN(notNum) || notNum < 7 || notNum > 90) {
        setDetailsError(true);
        setDetailsErrorMessage('Move-Out Notice Period must be between 7 and 90 days.');
        hasError = true;
      } else {
        setDetailsError(false);
      }
    }

    if (mode === 'AUTO_GEN' && !sig) {
      setSignatureError(true);
      hasError = true;
    } else {
      setSignatureError(false);
    }

    if (hasError) {
      setTimeout(() => {
        const firstErrorEl = document.querySelector('.border-rose-500');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    setModeError(false);
    setDetailsError(false);
    setSignatureError(false);
    if (onMainNext) onMainNext();
  };

  const lastNavKeyRef = useRef<string | null>(null);

  // Dynamic navigation handler broadcasting to main bottom footer
  useEffect(() => {
    if (!onCustomNavChange) return;

    let nextLabel = 'Continue to Room Setup';
    let backLabel = 'Back to Security';
    let handleNextAction = () => {};
    let handleBackAction = () => {};

    if (subStep === 1) {
      nextLabel = 'Next: Shared Amenities';
      backLabel = 'Back: Location';
      handleNextAction = () => handleSubStepChange(2);
      handleBackAction = () => onMainBack && onMainBack();
    } else if (subStep === 2) {
      const idx = currentAmenityIndex;
      nextLabel = idx < amenitySubGroups.length - 1 ? `Next: ${amenitySubGroups[idx + 1]?.label}` : 'Next: House Rules';
      backLabel = idx > 0 ? `Back: ${amenitySubGroups[idx - 1]?.label}` : 'Back: Structure';
      handleNextAction = handleNextAmenity;
      handleBackAction = handleBackAmenity;
    } else if (subStep === 3) {
      const idx = currentRuleIndex;
      nextLabel = idx < ruleSubGroups.length - 1 ? `Next: ${ruleSubGroups[idx + 1]?.label}` : 'Next: Security & Safety';
      backLabel = idx > 0 ? `Back: ${ruleSubGroups[idx - 1]?.label}` : 'Back: Amenities';
      handleNextAction = handleNextRule;
      handleBackAction = handleBackRule;
    } else if (subStep === 4) {
      const idx = currentFeatureIndex;
      nextLabel = idx < featureSubGroups.length - 1 ? `Next: ${featureSubGroups[idx + 1]?.label}` : 'Next: Lease Contract';
      backLabel = idx > 0 ? `Back: ${featureSubGroups[idx - 1]?.label}` : 'Back: Rules';
      handleNextAction = handleNextFeature;
      handleBackAction = handleBackFeature;
    } else if (subStep === 5) {
      nextLabel = 'Next: Room Setup';
      backLabel = 'Back: Security';
      handleNextAction = handleNextContract;
      handleBackAction = () => handleSubStepChange(4);
    }

    const currentNavKey = `${subStep}-${activeAmenityTab}-${activeRuleTab}-${activeFeatureTab}-${nextLabel}-${backLabel}`;
    if (lastNavKeyRef.current === currentNavKey) {
      return;
    }
    lastNavKeyRef.current = currentNavKey;

    onCustomNavChange({
      nextLabel,
      backLabel,
      onNext: handleNextAction,
      onBack: handleBackAction,
    });
  }, [
    subStep,
    activeAmenityTab,
    activeRuleTab,
    activeFeatureTab,
    amenitySubGroups,
    ruleSubGroups,
    featureSubGroups,
    onCustomNavChange,
    onMainNext,
    onMainBack
  ]);

  if (isLoadingAttrs) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* 🧭 Sub-Step Breadcrumb Navigation Bar (Edge-to-Edge Draggable Pill Bar on Mobile) */}
      <div ref={subStepHeaderRef} className="bg-white dark:bg-gray-800 p-2 rounded-none sm:rounded-2xl border-x-0 sm:border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth select-none">
        {[
          { num: 1, label: '1. Structure', icon: Sparkles },
          { num: 2, label: '2. Amenities', icon: ListChecks },
          { num: 3, label: '3. Rules', icon: Shield },
          { num: 4, label: '4. Security', icon: Star },
          { num: 5, label: '5. Contract', icon: FileText },
        ].map(step => {
          const Icon = step.icon;
          const isActive = subStep === step.num;
          const isDone = subStep > step.num;
          const isUnlocked = step.num <= maxUnlockedSubStep;

          return (
            <button
              key={step.num}
              type="button"
              disabled={!isUnlocked && step.num > subStep}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => {
                if (isUnlocked || step.num <= subStep) {
                  handleSubStepChange(step.num);
                }
              }}
              className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]'
                  : isDone
                  ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer'
                  : isUnlocked
                  ? 'bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
                  : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/40 cursor-not-allowed opacity-50'
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{step.label}</span>
              {isDone && <CheckCircle size={12} className="text-primary shrink-0" />}
              {!isUnlocked && step.num > subStep && <Lock size={11} className="text-gray-400 dark:text-gray-500 shrink-0 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* 🏢 SUB-STEP 1: COMPOUND STRUCTURE */}
      {subStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 sm:space-y-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-10 pb-8 sm:pb-12 border-x-0 sm:border-2 border-gray-200 dark:border-gray-700 shadow-sm space-y-5 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 sm:pb-5">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span>Compound Structure & Setup Options</span>
                </h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-0.5">
                  Configure your overall building capacity and facility arrangements.
                </p>
              </div>

              {(Boolean(kitchenSetup) || Boolean(bathroomSetup) || Boolean(watch('propertyConfig.totalRooms'))) && (
                <button
                  type="button"
                  onClick={() => {
                    setValue('propertyConfig.totalRooms', '', { shouldValidate: false });
                    setValue('propertyConfig.kitchenSetup', '', { shouldValidate: false });
                    setValue('propertyConfig.bathroomSetup', '', { shouldValidate: false });
                    setValue('propertyConfig.bathroomCount', '', { shouldValidate: false });
                    if (clearErrors) {
                      clearErrors('propertyConfig.totalRooms');
                      clearErrors('propertyConfig.kitchenSetup');
                      clearErrors('propertyConfig.bathroomSetup');
                      clearErrors('propertyConfig.bathroomCount');
                    }
                  }}
                  className="self-start sm:self-auto text-xs font-extrabold text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 flex items-center gap-1.5 transition-all px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700/80 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm"
                >
                  <RotateCcw size={12} strokeWidth={2.5} />
                  <span>Clear Selection</span>
                </button>
              )}
            </div>

            {/* 📊 Section A: Building Capacity Counts (Balanced Grid) */}
            <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 sm:space-y-4">
              <h4 className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-primary shrink-0" />
                <span>Building Capacity & Quantity</span>
              </h4>
              <div className={cn("grid grid-cols-1 gap-4 sm:gap-6 items-end", bathroomSetup === 'SHARED' ? "md:grid-cols-2" : "")}>
                <Input
                  label={dynamicRoomLabel}
                  id="propertyConfig.totalRooms"
                  type="number"
                  register={register}
                  errors={errors}
                  watch={watch}
                  required
                  placeholder="e.g., 10"
                  useStaticLabel={true}
                  min={1}
                  max={50}
                  onKeyDown={(e: any) => { if (['e', 'E', '+', '.', ','].includes(e.key)) e.preventDefault(); }}
                  validationRules={{
                    required: "Total rooms is required",
                    validate: (val: any) => {
                      if (val === '' || val === undefined || val === null) return "Total rooms is required";
                      const num = Number(val);
                      if (isNaN(num) || num < 1) return "Total rooms must be at least 1 unit";
                      if (num > 50) return "Maximum limit is 50 rooms";
                      return true;
                    }
                  }}
                />

                {bathroomSetup === 'SHARED' && (
                  <Input
                    label="Total Common Hallway CRs"
                    id="propertyConfig.bathroomCount"
                    type="number"
                    register={register}
                    errors={errors}
                    watch={watch}
                    required
                    placeholder="e.g., 2"
                    icon={Bath}
                    useStaticLabel={true}
                    min={1}
                    max={6}
                    onKeyDown={(e: any) => { if (['e', 'E', '+', '.', ','].includes(e.key)) e.preventDefault(); }}
                    validationRules={{
                      required: "Shared setup requires at least 1 common CR",
                      validate: (val: any) => {
                        if (val === '' || val === undefined || val === null) return "Shared setup requires at least 1 common CR";
                        const num = Number(val);
                        if (isNaN(num) || num < 1) return "Common CRs must be at least 1";
                        if (num > 6) return "Common CRs cannot exceed 6";
                        const totalR = Number(getValues('propertyConfig.totalRooms'));
                        if (totalR > 0 && num > totalR) return `Common CRs (${num}) cannot exceed total rooms (${totalR})`;
                        return true;
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* 🎛️ Section B: Facility Setup Choices (Dynamically adapts for Apartments vs Boarding Houses) */}
            {isApartmentOrFlatRate ? (
              <div className="bg-primary/10 dark:bg-primary/15 border border-primary/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-primary text-white rounded-xl sm:rounded-2xl shadow-md shadow-primary/20 shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                      Apartment Unit Facilities (Pre-Configured)
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                      All apartment units automatically include private in-unit kitchenette and private en-suite bathroom facilities.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                  <div className="p-3.5 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-primary/20 shadow-sm flex items-center gap-3.5">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                      <Flame size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-primary dark:text-primary uppercase tracking-widest block">Kitchen Setup</span>
                      <span className="text-xs font-black text-gray-800 dark:text-gray-200">In-Unit Private Kitchenette</span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-primary/20 shadow-sm flex items-center gap-3.5">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-primary dark:text-primary uppercase tracking-widest block">Bathroom Setup</span>
                      <span className="text-xs font-black text-gray-800 dark:text-gray-200">Private En-Suite Bathroom</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Kitchen Setup Column */}
                <div id="propertyConfig.kitchenSetup" className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={cn(
                      "text-[10px] sm:text-[11px] font-black uppercase tracking-widest block",
                      errors?.propertyConfig?.kitchenSetup ? "text-rose-500" : "text-gray-400"
                    )}>
                      Kitchen Facility Setup <span className="text-rose-500">*</span>
                    </label>
                    {errors?.propertyConfig?.kitchenSetup && (
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <AlertTriangle size={12} /> Selection Required
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 h-full p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl transition-all",
                    errors?.propertyConfig?.kitchenSetup ? "border-2 border-rose-500 bg-rose-500/5 ring-4 ring-rose-500/10" : ""
                  )}>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('propertyConfig.kitchenSetup', 'SHARED', { shouldValidate: true });
                        if (clearErrors) clearErrors('propertyConfig.kitchenSetup');
                        setActiveAmenityTab('KITCHEN_APP');
                      }}
                      className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all flex items-center sm:flex-col sm:items-start justify-start sm:justify-between gap-3.5 sm:gap-2 ${
                        kitchenSetup === 'SHARED'
                          ? 'border-primary bg-primary/10 dark:bg-primary/25 text-primary dark:text-primary font-bold shadow-md shadow-primary/10 ring-2 ring-primary/30'
                          : 'border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${kitchenSetup === 'SHARED' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        <Utensils size={20} />
                      </div>
                      <div>
                        <h5 className="font-black text-xs uppercase tracking-wider">Shared Kitchen</h5>
                        <p className="text-[10px] font-bold opacity-75 mt-0.5">Communal kitchen for boarders</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setValue('propertyConfig.kitchenSetup', 'IN_UNIT', { shouldValidate: true });
                        if (clearErrors) clearErrors('propertyConfig.kitchenSetup');
                      }}
                      className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all flex items-center sm:flex-col sm:items-start justify-start sm:justify-between gap-3.5 sm:gap-2 ${
                        kitchenSetup === 'IN_UNIT'
                          ? 'border-primary bg-primary/10 dark:bg-primary/25 text-primary dark:text-primary font-bold shadow-md shadow-primary/10 ring-2 ring-primary/30'
                          : 'border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${kitchenSetup === 'IN_UNIT' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        <Flame size={20} />
                      </div>
                      <div>
                        <h5 className="font-black text-xs uppercase tracking-wider">In-Unit Kitchen</h5>
                        <p className="text-[10px] font-bold opacity-75 mt-0.5">Private kitchenette inside rooms</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Bathroom Setup Column */}
                <div id="propertyConfig.bathroomSetup" className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={cn(
                      "text-[10px] sm:text-[11px] font-black uppercase tracking-widest block",
                      errors?.propertyConfig?.bathroomSetup ? "text-rose-500" : "text-gray-400"
                    )}>
                      Bathroom (CR) Facility Setup <span className="text-rose-500">*</span>
                    </label>
                    {errors?.propertyConfig?.bathroomSetup && (
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <AlertTriangle size={12} /> Selection Required
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 h-full p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl transition-all",
                    errors?.propertyConfig?.bathroomSetup ? "border-2 border-rose-500 bg-rose-500/5 ring-4 ring-rose-500/10" : ""
                  )}>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('propertyConfig.bathroomSetup', 'SHARED', { shouldValidate: true });
                        if (clearErrors) clearErrors('propertyConfig.bathroomSetup');
                      }}
                      className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all flex items-center sm:flex-col sm:items-start justify-start sm:justify-between gap-3.5 sm:gap-2 ${
                        bathroomSetup === 'SHARED'
                          ? 'border-primary bg-primary/10 dark:bg-primary/25 text-primary dark:text-primary font-bold shadow-md shadow-primary/10 ring-2 ring-primary/30'
                          : 'border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${bathroomSetup === 'SHARED' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        <Bath size={20} />
                      </div>
                      <div>
                        <h5 className="font-black text-xs uppercase tracking-wider">Shared Common Bathrooms</h5>
                        <p className="text-[10px] font-bold opacity-75 mt-0.5">Common bathrooms in hallway</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setValue('propertyConfig.bathroomSetup', 'PRIVATE', { shouldValidate: true });
                        setValue('propertyConfig.bathroomCount', 0);
                        if (clearErrors) clearErrors('propertyConfig.bathroomSetup');
                      }}
                      className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all flex items-center sm:flex-col sm:items-start justify-start sm:justify-between gap-3.5 sm:gap-2 ${
                        bathroomSetup === 'PRIVATE'
                          ? 'border-primary bg-primary/10 dark:bg-primary/25 text-primary dark:text-primary font-bold shadow-md shadow-primary/10 ring-2 ring-primary/30'
                          : 'border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${bathroomSetup === 'PRIVATE' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h5 className="font-black text-xs uppercase tracking-wider">Private Bathrooms</h5>
                        <p className="text-[10px] font-bold opacity-75 mt-0.5">Private bathroom inside each room</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 📶 SUB-STEP 2: SHARED COMPOUND AMENITIES (1 Sub-Group at a Time) */}
      {subStep === 2 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border-2 border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-0 sm:min-h-[540px] space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                    <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                    <span>Shared Compound Amenities</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-0.5">
                    Select shared amenities available to all residents. (1 Sub-group at a time)
                  </p>
                </div>
              </div>

              {/* Sub-Group Tab Pills */}
              <div ref={amenityTabsRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-2 border-b border-gray-100 dark:border-gray-700 select-none">
                {amenitySubGroups.map((sg, idx) => {
                  const Icon = sg.icon;
                  const isActive = activeAmenityTab === sg.key;
                  const isUnlocked = idx <= maxUnlockedAmenityIndex;

                  return (
                    <button
                      key={sg.key}
                      type="button"
                      disabled={!isUnlocked}
                      data-active={isActive ? 'true' : 'false'}
                      onClick={() => {
                        if (isUnlocked) {
                          setActiveAmenityTab(sg.key);
                        }
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isUnlocked
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer'
                          : 'bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span>{sg.label}</span>
                      {!isUnlocked && <Lock size={10} className="ml-1 opacity-60 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Sub-Group Item Grid (2 Column on Mobile with 2-line Text Wrap) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 py-2 sm:py-4">
                {dynamicAttributes
                  .filter(a => {
                    if (!isAttrMatchingPropertyType(a)) return false;
                    if (activeAmenityTab === 'KITCHEN_APP') {
                      return a.subGroupKey === 'KITCHEN_APP' && a.setupContext === 'SHARED';
                    }
                    if (activeAmenityTab === 'COMMON_CR') {
                      return (a.subGroupKey === 'BATHROOM_FIX' || a.subGroupKey === 'COMMON_CR') && a.setupContext === 'COMMON_CR';
                    }
                    return a.type === 'AMENITY' && a.subGroupKey === activeAmenityTab;
                  })
                  .map(attr => {
                    const isSelected = selectedAmenities.includes(attr.id) || selectedAmenities.includes(String(attr.id)) || selectedAmenities.includes(attr.name);
                    const Icon = getSafeLucideIcon(attr.icon, Sparkles);
                    return (
                      <div
                        key={attr.id}
                        onClick={() => handleAttributeToggle(attr)}
                        className={`p-3.5 sm:p-4 min-h-[64px] rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between gap-2 sm:gap-3 group min-w-0 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600/10 dark:border-blue-400 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                            : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-blue-500/40 hover:bg-blue-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`p-2 sm:p-2.5 rounded-xl transition-colors shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-blue-500 group-hover:bg-blue-500/10'
                          }`}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className={`text-[12px] sm:text-xs font-bold leading-tight line-clamp-2 min-w-0 ${
                            isSelected ? 'text-blue-600 dark:text-blue-300 font-extrabold' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {attr.name}
                          </span>
                        </div>

                        <div className={`w-5 h-5 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 📜 SUB-STEP 3: HOUSE RULES (1 Sub-Group at a Time) */}
      {subStep === 3 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border-2 border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-0 sm:min-h-[540px] space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 shrink-0" />
                    <span>House Rules & Policies</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-0.5">
                    Specify rules and tenant expectations. (1 Sub-group at a time)
                  </p>
                </div>
              </div>

              {/* Sub-Group Tab Pills */}
              <div ref={ruleTabsRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-2 border-b border-gray-100 dark:border-gray-700 select-none">
                {ruleSubGroups.map((sg, idx) => {
                  const Icon = sg.icon;
                  const isActive = activeRuleTab === sg.key;
                  const isUnlocked = idx <= maxUnlockedRuleIndex;

                  return (
                    <button
                      key={sg.key}
                      type="button"
                      disabled={!isUnlocked}
                      data-active={isActive ? 'true' : 'false'}
                      onClick={() => {
                        const targetIndex = ruleSubGroups.findIndex(g => g.key === sg.key);
                        if (targetIndex > currentRuleIndex) {
                          if (!checkRuleSubGroupHasSelection(activeRuleTab)) {
                            setShowRuleValidationError(true);
                            return;
                          }
                        }
                        setShowRuleValidationError(false);
                        if (isUnlocked) {
                          setActiveRuleTab(sg.key);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-sm'
                          : isUnlocked
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer'
                          : 'bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span>{sg.label}</span>
                      {!isUnlocked && <Lock size={10} className="ml-1 opacity-60 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Section Field Container with Inline Validation */}
              <div className={`p-2 sm:p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
                showRuleValidationError && !checkRuleSubGroupHasSelection(activeRuleTab)
                  ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                  : "border-transparent"
              }`}>
                {showRuleValidationError && !checkRuleSubGroupHasSelection(activeRuleTab) && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <Sparkles size={16} />
                      <span>{ruleSubGroups.find(g => g.key === activeRuleTab)?.label || 'Policy'} Selection</span>
                    </span>
                    <span className="text-[10px] font-black text-white bg-red-600 dark:bg-red-700 px-2 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                      Selection Required
                    </span>
                  </div>
                )}

                {/* Sub-Group Item Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-1">
                  {dynamicAttributes
                    .filter(a => isAttrMatchingPropertyType(a) && a.type === 'RULE' && a.subGroupKey === activeRuleTab && isVisitorAttrVisible(a))
                    .map(attr => {
                      const isSelected = selectedAmenities.includes(attr.id) || selectedAmenities.includes(String(attr.id)) || selectedAmenities.includes(attr.name);
                      const Icon = getSafeLucideIcon(attr.icon, Shield);
                      const isSingleSelect = SINGLE_SELECT_RULE_SUBGROUPS.includes(attr.subGroupKey);

                      return (
                        <div
                          key={attr.id}
                          onClick={() => handleAttributeToggle(attr)}
                          className={`p-4 sm:p-5 min-h-[64px] rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 group min-w-0 ${
                            isSelected
                              ? 'border-purple-600 bg-purple-600/10 dark:border-purple-400 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-500/20'
                              : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-purple-500/40 hover:bg-purple-500/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                              isSelected ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-purple-500 group-hover:bg-purple-500/10'
                            }`}>
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <h4 className={`text-xs font-black uppercase tracking-wider truncate ${
                                isSelected ? 'text-purple-600 dark:text-purple-300 font-extrabold' : 'text-gray-900 dark:text-white'
                              }`}>
                                {attr.name}
                              </h4>
                              {attr.description && (
                                <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-0.5 leading-tight truncate">{attr.description}</p>
                              )}
                            </div>
                          </div>

                          {isSingleSelect ? (
                            <div className={`w-5 h-5 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                          ) : (
                            <div className={`w-5 h-5 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected ? 'border-purple-600 bg-purple-600 text-white shadow-sm' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {showRuleValidationError && !checkRuleSubGroupHasSelection(activeRuleTab) && (
                  <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Please select a {(ruleSubGroups.find(g => g.key === activeRuleTab)?.label || 'policy').toLowerCase()} option above before clicking Next.</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ⭐ SUB-STEP 4: SECURITY & SAFETY (1 Sub-Group at a Time) */}
      {subStep === 4 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border-2 border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-0 sm:min-h-[540px] space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                    <span>Security & Safety Features</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-0.5">
                    Highlight security measures to boost student trust. (1 Sub-group at a time)
                  </p>
                </div>
              </div>

              {/* Sub-Group Tab Pills */}
              <div ref={featureTabsRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-2 border-b border-gray-100 dark:border-gray-700 select-none">
                {featureSubGroups.map((sg, idx) => {
                  const Icon = sg.icon;
                  const isActive = activeFeatureTab === sg.key;
                  const isUnlocked = idx <= maxUnlockedFeatureIndex;

                  return (
                    <button
                      key={sg.key}
                      type="button"
                      disabled={!isUnlocked}
                      data-active={isActive ? 'true' : 'false'}
                      onClick={() => {
                        if (isUnlocked) {
                          setActiveFeatureTab(sg.key);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-sm'
                          : isUnlocked
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer'
                          : 'bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span>{sg.label}</span>
                      {!isUnlocked && <Lock size={10} className="ml-1 opacity-60 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Sub-Group Item Grid (2 Column on Mobile) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 py-2 sm:py-4">
                {dynamicAttributes
                  .filter(a => isAttrMatchingPropertyType(a) && a.type === 'FEATURE' && a.subGroupKey === activeFeatureTab)
                  .map(attr => {
                    const isSelected = selectedAmenities.includes(attr.id) || selectedAmenities.includes(String(attr.id)) || selectedAmenities.includes(attr.name);
                    const Icon = getSafeLucideIcon(attr.icon, Star);
                    return (
                      <div
                        key={attr.id}
                        onClick={() => handleAttributeToggle(attr)}
                        className={`p-3.5 sm:p-4 min-h-[64px] rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between gap-2 sm:gap-3 group min-w-0 ${
                          isSelected
                            ? 'border-amber-600 bg-amber-600/10 dark:border-amber-400 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-500/20'
                            : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-amber-500/40 hover:bg-amber-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`p-2 sm:p-2.5 rounded-xl transition-colors shrink-0 ${
                            isSelected ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-amber-500 group-hover:bg-amber-500/10'
                          }`}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className={`text-[12px] sm:text-xs font-bold leading-tight line-clamp-2 min-w-0 ${
                            isSelected ? 'text-amber-600 dark:text-amber-300 font-extrabold' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {attr.name}
                          </span>
                        </div>

                        <div className={`w-5 h-5 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected ? 'border-amber-600 bg-amber-600 text-white shadow-sm' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 📜 SUB-STEP 5: LEASE CONTRACT & CLAUSES */}
      {subStep === 5 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border-2 border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-0 sm:min-h-[540px] space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 shrink-0" />
                    <span>Lease Contract & Digital Signature</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-0.5">
                    Choose lease contract mode and provide your official digital signature.
                  </p>
                </div>
              </div>

              {/* 1. CONTRACT GENERATION MODE SECTION CARD */}
              <div
                id="contract-mode-section"
                className={`p-3.5 sm:p-6 rounded-xl sm:rounded-[2.5rem] border-2 transition-all space-y-3.5 sm:space-y-4 ${
                  modeError
                    ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 shadow-rose-500/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 gap-2">
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                    <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${modeError ? "bg-rose-500/10 text-rose-500" : "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"}`}>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-black uppercase tracking-wider sm:tracking-[0.2em] truncate ${modeError ? "text-rose-500" : "text-gray-900 dark:text-white"}`}>
                        1. Contract Generation Mode <span className="text-rose-500">*</span>
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">
                        Select how your lease agreement will be generated
                      </p>
                    </div>
                  </div>
                  <span className={`hidden sm:inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shrink-0 ${modeError ? "bg-rose-500/20 text-rose-500" : "bg-teal-50 dark:bg-teal-900/30 text-teal-600"}`}>
                    Contract Setup
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setValue('propertyConfig.contractMode', 'AUTO_GEN', { shouldValidate: true });
                      setModeError(false);
                    }}
                    className={`p-3.5 sm:p-5 rounded-xl sm:rounded-3xl border-2 text-left transition-all flex items-start gap-3 sm:gap-4 ${
                      contractMode === 'AUTO_GEN'
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-600 shadow-md ring-2 ring-teal-500/20 scale-[1.01]'
                        : modeError
                        ? 'border-rose-400/60 bg-rose-500/5 hover:border-rose-500'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-gray-500 hover:border-teal-500/40 hover:bg-teal-500/5'
                    }`}
                  >
                    <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shrink-0 ${contractMode === 'AUTO_GEN' ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-teal-500'}`}>
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white truncate">BoardTAU Smart Lease Contract</h5>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${contractMode === 'AUTO_GEN' ? 'border-teal-500 bg-teal-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {contractMode === 'AUTO_GEN' && <Check size={12} className="stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-1 leading-relaxed">Automatically generates a legal PDF lease contract using your rules & amenities.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setValue('propertyConfig.contractMode', 'CUSTOM_PDF', { shouldValidate: true });
                      setModeError(false);
                    }}
                    className={`p-3.5 sm:p-5 rounded-xl sm:rounded-3xl border-2 text-left transition-all flex items-start gap-3 sm:gap-4 ${
                      contractMode === 'CUSTOM_PDF'
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-600 shadow-md ring-2 ring-teal-500/20 scale-[1.01]'
                        : modeError
                        ? 'border-rose-400/60 bg-rose-500/5 hover:border-rose-500'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-gray-500 hover:border-teal-500/40 hover:bg-teal-500/5'
                    }`}
                  >
                    <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shrink-0 ${contractMode === 'CUSTOM_PDF' ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-teal-500'}`}>
                      <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white truncate">Custom PDF Document</h5>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${contractMode === 'CUSTOM_PDF' ? 'border-teal-500 bg-teal-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {contractMode === 'CUSTOM_PDF' && <Check size={12} className="stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-1 leading-relaxed">Upload your own standard lease contract PDF document.</p>
                    </div>
                  </button>
                </div>

                {modeError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-rose-300 dark:border-rose-800 flex items-center gap-2 shadow-sm">
                    <AlertCircle size={16} className="text-rose-500 shrink-0" />
                    <span>Please click and select a Contract Generation Mode above before continuing.</span>
                  </p>
                )}
              </div>

              {/* 2. CONTRACT DETAILS / PDF FILE UPLOAD SECTION CARD */}
              {contractMode && (
                <div
                  id="contract-details-section"
                  className={`p-3.5 sm:p-6 rounded-xl sm:rounded-[2.5rem] border-2 transition-all space-y-4 sm:space-y-6 ${
                    detailsError
                      ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 shadow-rose-500/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 gap-2">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${detailsError ? "bg-rose-500/10 text-rose-500" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
                        {contractMode === 'CUSTOM_PDF' ? <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5" /> : <Info className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-xs font-black uppercase tracking-wider sm:tracking-[0.2em] truncate ${detailsError ? "text-rose-500" : "text-gray-900 dark:text-white"}`}>
                          2. {contractMode === 'CUSTOM_PDF' ? 'Upload Custom Contract PDF' : 'Contract Financial & Notice Terms'} <span className="text-rose-500">*</span>
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">
                          {contractMode === 'CUSTOM_PDF' ? 'Upload standard PDF lease document' : 'Define security deposit and move-out notice period'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Terms & Deposit Notice (Auto-Generated Mode Only) */}
                  {contractMode === 'AUTO_GEN' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <Input
                          label="Standard Security Deposit (₱)"
                          id="propertyConfig.depositAmount"
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          required
                          placeholder="e.g., 2000"
                          icon={Info}
                          useStaticLabel={true}
                          onKeyDown={(e: any) => { if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault(); }}
                          validationRules={{
                            required: "Security deposit must be between ₱500 and ₱50,000",
                            min: { value: 500, message: "Security deposit must be at least ₱500" },
                            max: { value: 50000, message: "Security deposit cannot exceed ₱50,000" }
                          }}
                        />

                        <Input
                          label="Move-Out Notice Period (Days)"
                          id="propertyConfig.moveOutNoticeDays"
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          required
                          placeholder="e.g., 30"
                          icon={Clock}
                          useStaticLabel={true}
                          onKeyDown={(e: any) => { if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault(); }}
                          validationRules={{
                            required: "Notice period must be between 7 and 90 days",
                            min: { value: 7, message: "Move-out notice period must be at least 7 days" },
                            max: { value: 90, message: "Move-out notice period cannot exceed 90 days" }
                          }}
                        />
                      </div>

                      {/* Custom Clauses */}
                      <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest block">
                          Custom Landlord Clauses (Optional)
                        </label>
                        
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={customClauseText}
                              onChange={(e) => setCustomClauseText(e.target.value)}
                              placeholder="Add custom clause (e.g. Mandatory monthly aircon checkup)..."
                              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddClause();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddClause}
                              className="w-full sm:w-auto px-4 py-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-black text-xs uppercase tracking-wider rounded-xl border border-teal-100 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                            >
                              <PlusCircle size={14} />
                              <span>Add Clause</span>
                            </button>
                          </div>
                          
                          <ul className="space-y-2">
                            {(watch('propertyConfig.customContractClauses') || []).map((clause: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/50 p-2.5 sm:p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                                <span className="text-teal-600 font-bold">{i + 1}.</span>
                                <span className="flex-1 text-gray-700 dark:text-gray-300 font-medium">{clause}</span>
                                <button type="button" onClick={() => handleRemoveClause(i)} className="text-gray-400 hover:text-red-500 p-1">
                                  <LucideIcons.X size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom PDF Upload Section */}
                  {contractMode === 'CUSTOM_PDF' && (() => {
                    const rawPropName = watch('basicInfo.name') || getValues('basicInfo.name') || 'Property';
                    const cleanPropName = rawPropName.trim().replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
                    const storedName = watch('propertyConfig.customPdfName');
                    const displayFileName = watch('propertyConfig.customPdfUrl')
                      ? (storedName || `${cleanPropName}_Custom_Lease_Agreement.pdf`)
                      : undefined;

                    return (
                      <div className="space-y-4">
                        <FileUpload
                          id="propertyConfig.customPdfUrl"
                          label="Upload Custom Lease Contract PDF *"
                          description="Upload your standard lease agreement PDF (PDF format strictly, max. 5MB)."
                          accept=".pdf,.doc,.docx"
                          fileUrl={watch('propertyConfig.customPdfUrl')}
                          fileName={displayFileName}
                          onPreview={() => {
                            const url = watch('propertyConfig.customPdfUrl');
                            if (url) window.open(url, '_blank');
                          }}
                          onFileSelect={(file: File) => {
                            if (file) {
                              const fakeUrl = URL.createObjectURL(file);
                              setValue('propertyConfig.customPdfUrl', fakeUrl, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              setValue('propertyConfig.customPdfName', file.name, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              setValue('documents.customContract', fakeUrl, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              setDetailsError(false);
                              setDetailsErrorMessage('');
                            } else {
                              setValue('propertyConfig.customPdfUrl', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              setValue('propertyConfig.customPdfName', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              setValue('documents.customContract', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                            }
                          }}
                        />
                        {watch('propertyConfig.customPdfUrl') && (
                          <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-200 min-w-0">
                              <FileText size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
                              <span className="truncate">{displayFileName || 'Custom Lease Agreement PDF Ready'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const url = watch('propertyConfig.customPdfUrl');
                                if (url) window.open(url, '_blank');
                              }}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Preview Document</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {detailsError && (
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-rose-300 dark:border-rose-800 flex items-center gap-2 shadow-sm">
                      <AlertCircle size={16} className="text-rose-500 shrink-0" />
                      <span>{detailsErrorMessage || 'Please complete all required contract details before continuing.'}</span>
                    </p>
                  )}
                </div>
              )}

              {/* 3. LANDLORD OFFICIAL DIGITAL SIGNATURE SECTION CARD (Auto-Generated Mode Only) */}
              {contractMode === 'AUTO_GEN' && (
                <div
                  id="contract-signature-section"
                  className={`p-3.5 sm:p-6 rounded-xl sm:rounded-[2.5rem] border-2 transition-all space-y-3.5 sm:space-y-4 ${
                    signatureError
                      ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 shadow-rose-500/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 gap-2">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${signatureError ? "bg-rose-500/10 text-rose-500" : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"}`}>
                        <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-xs font-black uppercase tracking-wider sm:tracking-[0.2em] truncate ${signatureError ? "text-rose-500" : "text-gray-900 dark:text-white"}`}>
                          3. Landlord Digital Signature <span className="text-rose-500">*</span>
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">Draw signature or tap expand canvas</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSignatureModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-all shrink-0"
                    >
                      <LucideIcons.Maximize2 size={12} />
                      <span className="hidden sm:inline">Expand Canvas</span>
                      <span className="inline sm:hidden">Expand</span>
                    </button>
                  </div>

                  <SignaturePad
                    onSave={(dataUrl: string) => {
                      setValue('propertyConfig.landlordSignatureBase64', dataUrl, { shouldValidate: true });
                      if (dataUrl) setSignatureError(false);
                    }}
                    onClear={() => {
                      setValue('propertyConfig.landlordSignatureBase64', '', { shouldValidate: true });
                      setSignatureError(true);
                    }}
                    initialDataUrl={currentSignature}
                    autoSaveOnEnd={true}
                    label=""
                  />

                  {currentSignature ? (
                    <div className="space-y-3 pt-1">
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-teal-500 shrink-0" />
                        <span>Official digital signature captured & valid</span>
                      </p>

                      <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-200 min-w-0">
                          <Sparkles size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
                          <span className="truncate">BoardTAU Smart Lease Contract Ready</span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const propName = watch('basicInfo.name') || 'Boarding House Property';
                            const propAddress = watch('location.address') || 'Property Address';
                            const deposit = Number(watch('propertyConfig.depositAmount')) || 0;
                            const noticeDays = Number(watch('propertyConfig.moveOutNoticeDays')) || 30;
                            const clauses = watch('propertyConfig.customContractClauses') || [];
                            const pdfBlob = await generateLeaseContractPDF('Sample_Smart_Lease_Contract.pdf', {
                              contractHash: `DRAFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                              landlordName: 'Property Owner / Landlord',
                              tenantName: '[TENANT NAME APPLICANT]',
                              propertyName: propName,
                              roomName: 'Standard Unit / Room',
                              propertyAddress: propAddress,
                              moveInDate: 'Effective Upon Signing',
                              checkOutDate: 'Per Lease Agreement Duration',
                              depositAmount: deposit,
                              rentAmount: 0,
                              moveOutNoticeDays: noticeDays,
                              customClauses: clauses,
                              landlordSignatureBase64: currentSignature,
                              tenantSignatureBase64: ''
                            }, true);
                            if (pdfBlob) {
                              window.open(URL.createObjectURL(pdfBlob as Blob), '_blank');
                            }
                          }}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Preview Smart Lease PDF</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5 pt-1">
                      <AlertCircle size={14} className="text-rose-500 shrink-0" />
                      <span>Official signature is required for contract validity</span>
                    </p>
                  )}

                  {signatureError && (
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-rose-300 dark:border-rose-800 flex items-center gap-2 shadow-sm">
                      <AlertCircle size={16} className="text-rose-500 shrink-0" />
                      <span>Please draw and save your official digital signature above before proceeding to Room Setup.</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Main wizard footer handles navigation */}
          </div>
        </motion.div>
      )}

      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        currentSignature={currentSignature}
        onConfirm={(dataUrl: string) => setValue('propertyConfig.landlordSignatureBase64', dataUrl)}
      />
    </div>
  );
}
