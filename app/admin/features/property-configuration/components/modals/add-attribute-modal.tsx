"use client";

import React, { useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Modal, { ModalContext } from "@/components/modals/Modal";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Search, Sparkles, HelpCircle, Check, ArrowRight, ArrowLeft, Plus, X, SearchX, Loader2, AlertCircle, Lock, Home, Users, ShowerHead, DoorClosed, Globe, Target, Building } from "lucide-react";
import { cn } from "@/utils/helper";
import { toast } from "@/app/admin/components/ui/sonner";
import { Label } from "@/app/admin/components/ui/label";
import { Switch } from "@/app/admin/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/ui/select";
import Input from "@/components/inputs/Input";

import { clearTaxonomyCache } from "@/lib/taxonomyCache";

interface AddAttributeModalProps {
  initialData?: any;
  existingAttributes?: any[];
  initialCategory?: string;
  initialSubGroupKey?: string;
  initialPropertyTypeNames?: string[];
  subGroups?: any[];
  onClose?: () => void;
  onSuccess?: (createdData?: any) => void;
}

const subGroupsCacheMap = new Map<string, { data: any[]; timestamp: number }>();
export const invalidateSubGroupsCache = () => subGroupsCacheMap.clear();

const PROPERTY_TYPES_PRESETS = [
  { id: "Apartment", label: "Apartment" },
  { id: "Boarding House", label: "Boarding House" },
  { id: "Dormitory", label: "Dormitory" },
  { id: "Transient House", label: "Transient House" },
  { id: "Agri-Hostel", label: "Agri-Hostel" },
];

const SUB_GROUPS_PRESETS = [
  { key: "STORES", label: "Stores & Essentials", type: "AMENITY" },
  { key: "WIFI", label: "Internet & Connectivity", type: "AMENITY" },
  { key: "POWER_WATER", label: "Backup Power & Water", type: "AMENITY" },
  { key: "PARKING", label: "Parking Facilities", type: "AMENITY" },
  { key: "LAUNDRY", label: "Laundry & Drying", type: "AMENITY" },
  { key: "STUDY_LOUNGE", label: "Study & Lounge", type: "AMENITY" },
  { key: "CARETAKER", label: "Caretaker & Housekeeping", type: "AMENITY" },
  { key: "GARDEN", label: "Outdoor, Garden & Green Spaces", type: "AMENITY" },

  { key: "KITCHEN_APP", label: "Cooking & Kitchen Appliances", type: "ROOM_AMENITY" },
  { key: "BATHROOM_FIX", label: "CR Features & Fixtures", type: "ROOM_AMENITY" },
  { key: "COOLING", label: "Aircon & Cooling", type: "ROOM_AMENITY" },
  { key: "FURNITURE", label: "Furniture & Storage", type: "ROOM_AMENITY" },

  { key: "GENDER_POLICY", label: "Gender Policy Rules", type: "RULE" },
  { key: "CURFEW", label: "Curfew & Gate Rules", type: "RULE" },
  { key: "SECURITY", label: "Security & Gate Access", type: "FEATURE" },
  { key: "DISASTER_PREP", label: "Disaster Safety & Fire", type: "FEATURE" },
];

const getSafeLucideIcon = (iconName: string) => {
  if (!iconName || iconName === "default" || iconName === "createLucideIcon" || iconName.startsWith("Lucide") || iconName === "Icon") {
    return HelpCircle;
  }
  const IconObj = (LucideIcons as Record<string, any>)[iconName];
  if (!IconObj) return HelpCircle;
  if (typeof IconObj === "function" && IconObj.name === "createLucideIcon") {
    return HelpCircle;
  }
  if (typeof IconObj === "function" || typeof IconObj === "object") {
    return IconObj;
  }
  return HelpCircle;
};

export const AddAttributeModal: React.FC<AddAttributeModalProps> = ({
  initialData,
  existingAttributes,
  initialCategory,
  initialSubGroupKey,
  initialPropertyTypeNames,
  subGroups,
  onClose,
  onSuccess,
}) => {
  const modalContext = React.useContext(ModalContext);
  const contextClose = modalContext?.close || (() => {});

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [name, setName] = useState(initialData?.name || "");

  const safeInitialSubGroupKey = useMemo(() => {
    if (initialData?.subGroupKey) return initialData.subGroupKey;
    if (!initialSubGroupKey) return "";
    return initialSubGroupKey.toUpperCase().trim();
  }, [initialData, initialSubGroupKey]);

  const inferredType = useMemo(() => {
    if (initialData?.type) return initialData.type;
    if (initialCategory && initialCategory !== "ALL") return initialCategory;
    if (safeInitialSubGroupKey) {
      const preset = SUB_GROUPS_PRESETS.find((sg) => sg.key === safeInitialSubGroupKey);
      if (preset) return preset.type;
      const dbSg = (subGroups || []).find((sg) => sg.key === safeInitialSubGroupKey);
      if (dbSg) return dbSg.type;
    }
    return "";
  }, [initialData, initialCategory, safeInitialSubGroupKey, subGroups]);

  const [type, setType] = useState<string>(inferredType);
  const [subGroupKey, setSubGroupKey] = useState<string>(safeInitialSubGroupKey);
  const [setupContext, setSetupContext] = useState<string>(initialData?.setupContext || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [availabilityMode, setAvailabilityMode] = useState<"UNIVERSAL" | "TARGETED" | null>(
    initialData
      ? (!initialData.propertyTypeNames || initialData.propertyTypeNames.length === 0 ? "UNIVERSAL" : "TARGETED")
      : initialPropertyTypeNames && initialPropertyTypeNames.length > 0
      ? "TARGETED"
      : null
  );
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    initialData?.propertyTypeNames || initialPropertyTypeNames || []
  );

  React.useEffect(() => {
    if (!initialData) {
      if (inferredType && !type) setType(inferredType);
      if (safeInitialSubGroupKey && !subGroupKey) setSubGroupKey(safeInitialSubGroupKey);
      if (initialPropertyTypeNames && initialPropertyTypeNames.length > 0) {
        setAvailabilityMode("TARGETED");
        setSelectedPropertyTypes((prev) => (prev.length === 0 ? initialPropertyTypeNames : prev));
      }
    }
  }, [initialData, inferredType, safeInitialSubGroupKey, initialPropertyTypeNames]);
  const [dbPropertyTypes, setDbPropertyTypes] = useState<any[]>([]);

  React.useEffect(() => {
    axios
      .get(`/api/admin/property-types?t=${Date.now()}`)
      .then((res) => {
        if (res.data?.data) {
          setDbPropertyTypes(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isIconSearching, setIsIconSearching] = useState(false);

  React.useEffect(() => {
    if (!searchQuery) {
      setIsIconSearching(false);
      return;
    }
    setIsIconSearching(true);
    const timer = setTimeout(() => {
      setIsIconSearching(false);
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleClose = () => {
    if (onClose) onClose();
    else contextClose();
  };

  const filteredIcons = useMemo(() => {
    const validKeys = Object.keys(LucideIcons).filter((k) => {
      if (k === "default" || k === "createLucideIcon" || k.startsWith("Lucide") || k.endsWith("Icon") || k === "Icon") return false;
      const comp = (LucideIcons as any)[k];
      if (!comp || (typeof comp !== "function" && typeof comp !== "object")) return false;
      return true;
    });

    let list: string[] = [];
    if (!searchQuery) {
      list = ["Wifi", "Zap", "Droplet", "Utensils", "Lock", "Bed", "Shield", "Sparkles", "Car", "Sun", "Flame", "Refrigerator", "Trees", "Wind", "Coffee", "Tv", "Laptop"];
    } else {
      const query = searchQuery.toLowerCase();
      list = validKeys.filter((k) => k.toLowerCase().includes(query)).slice(0, 36);
    }

    if (selectedIcon && !list.includes(selectedIcon) && validKeys.includes(selectedIcon)) {
      return [selectedIcon, ...list];
    }
    return list;
  }, [searchQuery, selectedIcon]);

  const [dbSubGroups, setDbSubGroups] = useState<any[]>(subGroups || []);
  const [isCreatingSubGroup, setIsCreatingSubGroup] = useState(false);
  const [newSubGroupTabLabel, setNewSubGroupTabLabel] = useState("");
  const [newSubGroupKey, setNewSubGroupKey] = useState("");
  const [newSubGroupTitle, setNewSubGroupTitle] = useState("");
  const [newSubGroupSubtitle, setNewSubGroupSubtitle] = useState("");
  const [isSavingSubGroup, setIsSavingSubGroup] = useState(false);
  const [subGroupError, setSubGroupError] = useState<string | null>(null);

  const fetchSubGroups = React.useCallback((force = false) => {
    if (!force && subGroups && subGroups.length > 0) {
      setDbSubGroups((prev) => {
        const merged = [...subGroups];
        prev.forEach((p) => {
          if (!merged.some((m) => m.key === p.key)) {
            merged.push(p);
          }
        });
        return merged;
      });
      return;
    }
    if (!force) {
      const cached = subGroupsCacheMap.get(type);
      if (cached && Date.now() - cached.timestamp < 300000) {
        setDbSubGroups(cached.data);
        return;
      }
    }

    axios
      .get(`/api/admin/sub-groups?type=${type}&t=${Date.now()}`)
      .then((res) => {
        if (res.data?.data) {
          setDbSubGroups(res.data.data);
          subGroupsCacheMap.set(type, { data: res.data.data, timestamp: Date.now() });
        }
      })
      .catch(() => {});
  }, [type, subGroups]);

  React.useEffect(() => {
    if (subGroups && subGroups.length > 0) {
      setDbSubGroups((prev) => {
        const merged = [...subGroups];
        prev.forEach((p) => {
          if (!merged.some((m) => m.key === p.key)) {
            merged.push(p);
          }
        });
        return merged;
      });
    }
  }, [subGroups]);

  React.useEffect(() => {
    fetchSubGroups();
  }, [fetchSubGroups]);

  const availableSubGroups = useMemo(() => {
    const presets = SUB_GROUPS_PRESETS.filter((sg) => sg.type === type);
    const dbList = dbSubGroups.map((sg) => ({
      key: sg.key,
      label: sg.tabLabel || sg.title || sg.key,
      type: sg.type,
    }));

    const combined = [...presets];
    dbList.forEach((dbSg) => {
      if (!combined.some((p) => p.key === dbSg.key)) {
        combined.push(dbSg);
      }
    });

    return combined;
  }, [type, dbSubGroups]);

  const handleSaveSubGroupInline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newSubGroupTabLabel.trim()) {
      setSubGroupError("Sub-step Tab Label is required (e.g. 'Sports & Fitness')");
      toast.error("Sub-step Tab Label is required");
      return;
    }

    setSubGroupError(null);

    const keyToSave = (newSubGroupKey || newSubGroupTabLabel).trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");

    const existingSg = availableSubGroups.find(
      (sg) => sg.key === keyToSave || sg.label.trim().toLowerCase() === newSubGroupTabLabel.trim().toLowerCase()
    );

    if (existingSg) {
      toast.info(`Sub-step "${existingSg.label}" already exists and has been auto-selected!`);
      setSubGroupKey(existingSg.key);
      setErrors((prev) => ({ ...prev, subGroupKey: undefined }));
      setIsCreatingSubGroup(false);
      setNewSubGroupTabLabel("");
      setNewSubGroupKey("");
      setNewSubGroupTitle("");
      setNewSubGroupSubtitle("");
      setSubGroupError(null);
      return;
    }

    try {
      setIsSavingSubGroup(true);
      const res = await axios.post("/api/admin/sub-groups", {
        key: keyToSave,
        type,
        tabLabel: newSubGroupTabLabel.trim(),
        title: newSubGroupTitle.trim() || `Step: ${newSubGroupTabLabel.trim()}`,
        subtitle: newSubGroupSubtitle.trim() || `Select your ${newSubGroupTabLabel.trim()} preferences`,
      });

      if (res.data?.success) {
        const createdSubGroup = res.data.data || {
          key: keyToSave,
          type,
          tabLabel: newSubGroupTabLabel.trim(),
          title: newSubGroupTitle.trim() || `Step: ${newSubGroupTabLabel.trim()}`,
          subtitle: newSubGroupSubtitle.trim() || `Select your ${newSubGroupTabLabel.trim()} preferences`,
        };

        invalidateSubGroupsCache();
        clearTaxonomyCache();

        // Immediately update dbSubGroups state so it appears in the dropdown right now!
        setDbSubGroups((prev) => {
          if (prev.some((sg) => sg.key === createdSubGroup.key)) return prev;
          return [...prev, createdSubGroup];
        });

        toast.success(`Sub-step "${newSubGroupTabLabel}" created successfully!`);
        setSubGroupKey(keyToSave);
        setErrors((prev) => ({ ...prev, subGroupKey: undefined }));
        setIsCreatingSubGroup(false);
        setNewSubGroupTabLabel("");
        setNewSubGroupKey("");
        setNewSubGroupTitle("");
        setNewSubGroupSubtitle("");
        setSubGroupError(null);

        // Force refetch to ensure sync with DB
        fetchSubGroups(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create sub-group");
    } finally {
      setIsSavingSubGroup(false);
    }
  };

  const togglePropertyType = (ptName: string) => {
    if (selectedPropertyTypes.includes(ptName)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== ptName));
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, ptName]);
    }
  };

  const IconComponent = useMemo(() => {
    return getSafeLucideIcon(selectedIcon);
  }, [selectedIcon]);

  const [fetchedAttributes, setFetchedAttributes] = useState<any[]>([]);

  React.useEffect(() => {
    if (!existingAttributes || existingAttributes.length === 0) {
      axios
        .get(`/api/admin/attributes?t=${Date.now()}`)
        .then((res) => {
          if (res.data?.data) {
            setFetchedAttributes(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [existingAttributes]);

  const allAttributesToCheck = useMemo(() => {
    return existingAttributes && existingAttributes.length > 0 ? existingAttributes : fetchedAttributes;
  }, [existingAttributes, fetchedAttributes]);

  const [errors, setErrors] = useState<{
    type?: string;
    subGroupKey?: string;
    name?: string;
    description?: string;
    setupContext?: string;
    icon?: string;
    availabilityMode?: string;
    propertyTypes?: string;
  }>({});

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newErrors: {
      type?: string;
      subGroupKey?: string;
      name?: string;
      description?: string;
      setupContext?: string;
      icon?: string;
      availabilityMode?: string;
      propertyTypes?: string;
    } = {};

    if (currentStep === 1) {
      if (!type) newErrors.type = "Please select a Category Type";
      if (!subGroupKey) newErrors.subGroupKey = "Please select a Sub-Group Category";

      if (newErrors.type || newErrors.subGroupKey) {
        setErrors(newErrors);
        toast.error("Please complete all required selection fields");
        return;
      }
    }

    if (currentStep === 2) {
      const cleanName = name.trim().replace(/\s+/g, " ");
      const cleanDesc = description.trim().replace(/\s+/g, " ");

      if (!cleanName) {
        newErrors.name = "Attribute Name is required";
      } else if (cleanName.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      } else if (allAttributesToCheck && Array.isArray(allAttributesToCheck)) {
        const normalizedTarget = cleanName.toLowerCase();
        const isDuplicate = allAttributesToCheck.some(
          (attr: any) => attr.name.trim().replace(/\s+/g, " ").toLowerCase() === normalizedTarget && attr.id !== initialData?.id
        );
        if (isDuplicate) {
          newErrors.name = `A dynamic attribute named '${cleanName}' already exists`;
        }
      }

      if (!cleanDesc) newErrors.description = "Attribute Description is required";
      else if (cleanDesc.length < 5) newErrors.description = "Description must be at least 5 characters";

      if (type === "ROOM_AMENITY" && !setupContext) {
        newErrors.setupContext = "Please select a Setup Context Scope for this Room Amenity";
      }

      if (newErrors.name || newErrors.description || newErrors.setupContext) {
        setErrors(newErrors);
        toast.error(newErrors.name || newErrors.setupContext || "Please fill in all required fields on Step 2");
        return;
      }
    }

    if (currentStep === 3) {
      if (!selectedIcon) {
        newErrors.icon = "Please select an icon for this dynamic attribute";
      }

      if (!availabilityMode) {
        newErrors.availabilityMode = "Please select an Availability Scope Mode (Universal or Targeted)";
      } else if (availabilityMode === "TARGETED" && selectedPropertyTypes.length === 0) {
        newErrors.propertyTypes = "Please select at least 1 property category for targeted scoping";
      }

      if (newErrors.icon || newErrors.availabilityMode || newErrors.propertyTypes) {
        setErrors(newErrors);
        toast.error(newErrors.icon || newErrors.availabilityMode || newErrors.propertyTypes || "Please complete all Step 3 selections");
        return;
      }
    }

    setErrors({});
    setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as any) : 4));
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1));
  };

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmAndPublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (!cleanName) {
      toast.error("Attribute name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      // If targeted mode checked all available property categories, treat logically as Universal (All)
      const allPropTypeNames = dbPropertyTypes.length > 0
        ? dbPropertyTypes.map((pt: any) => pt.name)
        : PROPERTY_TYPES_PRESETS.map((pt: any) => pt.label);

      const isTargetedAll = availabilityMode === "TARGETED" && 
        selectedPropertyTypes.length >= allPropTypeNames.length && 
        allPropTypeNames.every((name: string) => selectedPropertyTypes.includes(name));

      const finalIsUniversal = availabilityMode === "UNIVERSAL" || isTargetedAll;
      const finalPropertyTypeNames = finalIsUniversal ? [] : selectedPropertyTypes;

      const payload = {
        name: cleanName,
        type,
        subGroupKey,
        setupContext: type === "ROOM_AMENITY" ? setupContext : undefined,
        description: description.trim().replace(/\s+/g, " "),
        icon: selectedIcon,
        isActive,
        isUniversal: finalIsUniversal,
        propertyTypeNames: finalPropertyTypeNames,
      };

      const targetId = initialData?.id || initialData?._id;
      let savedData = null;
      if (initialData || targetId) {
        if (!targetId) {
          toast.error("Attribute ID missing. Please refresh the page and try again.");
          return;
        }
        const res = await axios.put(`/api/admin/attributes/${targetId}`, payload);
        savedData = res.data?.data;
        toast.success(`Dynamic Attribute "${cleanName}" updated successfully!`);
      } else {
        const res = await axios.post("/api/admin/attributes", payload);
        savedData = res.data?.data;
        toast.success(`Dynamic Attribute "${cleanName}" published successfully!`);
      }

      handleClose();
      if (onSuccess) onSuccess(savedData || payload);
    } catch (error: any) {
      console.error("Save dynamic attribute error:", error);
      const errMsg = error.response?.data?.message || "Failed to save dynamic attribute";
      toast.error(errMsg);
      if (error.response?.status === 400 && errMsg.toLowerCase().includes("already exists")) {
        setErrors({ name: errMsg });
        setCurrentStep(2);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col text-slate-800 dark:text-slate-200 w-full p-6 sm:p-7 space-y-4 max-h-[88vh]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Modal Header (Fixed Top) */}
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {initialData ? "Edit Dynamic Attribute" : "Add Dynamic Attribute"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Configure dynamic amenities, house rules, and security features.
              </p>
            </div>
          </div>

          {/* Step Counter Badge */}
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider shrink-0">
            Step {currentStep} of 4
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="bg-emerald-500 h-full rounded-full"
            initial={{ width: "25%" }}
            animate={{ width: `${currentStep * 25}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Scrollable Wizard Body */}
      <div className="flex-1 overflow-y-auto pr-1.5 py-1 space-y-5 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          {/* STEP 1: Category & Sub-Group Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Select Category Type *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { id: "AMENITY", title: "Property Amenity", desc: "Shared / Onsite facilities (WiFi, Laundry, Parking)" },
                    { id: "ROOM_AMENITY", title: "Room Amenity", desc: "In-unit / bedroom features (AC, Beds, CR Fixtures)" },
                    { id: "RULE", title: "House Rule", desc: "Policies & conduct (Curfew, Visitors, Gender)" },
                    { id: "FEATURE", title: "Security & Safety", desc: "Infrastructure safety (CCTV, Guards, RFID)" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setType(cat.id);
                        setSubGroupKey("");
                        setErrors((prev) => ({ ...prev, type: undefined }));
                      }}
                      className={cn(
                        "p-5 sm:p-6 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group min-h-[100px]",
                        type === cat.id
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-md ring-2 ring-emerald-500/20"
                          : errors.type
                          ? "bg-rose-500/5 border-rose-500/50 text-slate-600 dark:text-slate-400 hover:border-rose-500"
                          : "bg-slate-50/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <div className="text-base font-black text-slate-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {cat.title}
                      </div>
                      <div className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">{cat.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.type && (
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mt-1.5">
                    <AlertCircle size={14} /> {errors.type}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    2. Select Sub-Group Category (Tab Pill Location) *
                  </Label>
                </div>

                {!isCreatingSubGroup ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1">
                      <Select 
                        value={subGroupKey} 
                        onValueChange={(val) => {
                          setSubGroupKey(val);
                          setErrors((prev) => ({ ...prev, subGroupKey: undefined }));
                        }}
                      >
                        <SelectTrigger className={cn(
                          "w-full h-12 bg-white dark:bg-slate-900 border-2 rounded-2xl px-4 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all",
                          errors.subGroupKey ? "border-rose-500 text-rose-600 ring-2 ring-rose-500/20" : "border-slate-200 dark:border-slate-800"
                        )}>
                          <SelectValue placeholder="Select Sub-Group Category..." />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className="max-h-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[10050]">
                          {availableSubGroups.map((sg) => (
                            <SelectItem key={sg.key} value={sg.key} className="py-2.5 px-4 text-xs font-bold hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 cursor-pointer">
                              <div className="flex items-center justify-between gap-3 w-full">
                                <span>{sg.label}</span>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {sg.key}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subGroupKey && (
                        <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mt-1.5">
                          <AlertCircle size={14} /> {errors.subGroupKey}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCreatingSubGroup(true)}
                      className="h-12 px-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/30 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={14} strokeWidth={3} />
                      </div>
                      <span>+ Create New Sub-Step</span>
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 rounded-2xl bg-emerald-500/5 border-2 border-emerald-500/30 space-y-4 shadow-lg shadow-emerald-500/5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight flex items-center gap-2">
                        <Sparkles size={16} />
                        <span>Create New Sub-Step Group</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreatingSubGroup(false)}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500">Tab Label (e.g. Garden) *</label>
                        <input
                          type="text"
                          value={newSubGroupTabLabel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewSubGroupTabLabel(val);
                            if (subGroupError) setSubGroupError(null);
                            const autoKey = val.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
                            setNewSubGroupKey(autoKey);
                          }}
                          placeholder="e.g. Sports & Fitness"
                          className={cn(
                            "w-full mt-1 bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-all",
                            subGroupError ? "border-rose-500 text-rose-600 ring-2 ring-rose-500/20" : "border-slate-200 dark:border-slate-800"
                          )}
                        />
                        {subGroupError && (
                          <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {subGroupError}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                          <Lock size={10} className="text-emerald-500" /> Auto-Generated System ID
                        </label>
                        <div className="w-full mt-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 select-none flex items-center justify-between">
                          <span className="truncate">{newSubGroupKey || "AUTO_GENERATED_KEY"}</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-sans uppercase font-bold shrink-0">Read Only</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500">Wizard Step Title (Optional)</label>
                      <input
                        type="text"
                        value={newSubGroupTitle}
                        onChange={(e) => setNewSubGroupTitle(e.target.value)}
                        placeholder="e.g. Step 6-8: Sports, Fitness & Recreation Facilities"
                        className="w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSubGroupInline}
                      disabled={isSavingSubGroup}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-md hover:bg-emerald-600 transition-all"
                    >
                      {isSavingSubGroup ? "Saving Sub-Step..." : "✓ Save Sub-Step Group"}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Identity & Description */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <Input
                id="name"
                label="Attribute Name *"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Private Veranda / Terrace"
                errors={errors}
                required
                useStaticLabel
              />

              <Input
                id="description"
                label="Attribute Description *"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                placeholder="e.g. Ground-floor covered outdoor porch or patio area exclusively for unit tenants."
                errors={errors}
                required
                useStaticLabel
              />

              {type === "ROOM_AMENITY" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Setup Context Scope *
                    </Label>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md",
                      setupContext
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    )}>
                      Selected: {setupContext ? setupContext.replace(/_/g, " ") : "None (Required)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(() => {
                      const subKey = (subGroupKey || "").toUpperCase();
                      const isBathroom = subKey.includes("BATHROOM") || subKey.includes("CR");
                      const isKitchen = subKey.includes("KITCHEN") || subKey.includes("COOKING");

                      const contextOptions = isBathroom
                        ? [
                            {
                              id: "PRIVATE",
                              title: "Private CR Fixture",
                              subtitle: "Exclusive bathroom fixture attached inside the room/CR.",
                              icon: ShowerHead,
                            },
                            {
                              id: "COMMON_CR",
                              title: "Shared / Common CR",
                              subtitle: "Restroom facility in shared hallway for all floor residents.",
                              icon: DoorClosed,
                            },
                            {
                              id: "IN_UNIT",
                              title: "In-Room / Private",
                              subtitle: "Exclusive amenity inside tenant's bedroom.",
                              icon: Home,
                            },
                            {
                              id: "SHARED",
                              title: "Shared / Common Area",
                              subtitle: "Communal facility in shared hallway or lounge.",
                              icon: Users,
                            },
                          ]
                        : isKitchen
                        ? [
                            {
                              id: "IN_UNIT",
                              title: "In-Unit / Private Kitchen",
                              subtitle: "Exclusive appliance or fixture inside tenant's private room/kitchenette.",
                              icon: Home,
                            },
                            {
                              id: "SHARED",
                              title: "Shared Common Kitchen",
                              subtitle: "Communal appliance or facility in shared kitchen area.",
                              icon: Users,
                            },
                          ]
                        : [
                            {
                              id: "IN_UNIT",
                              title: "In-Room / Private",
                              subtitle: "Exclusive amenity inside tenant's bedroom/unit.",
                              icon: Home,
                            },
                            {
                              id: "SHARED",
                              title: "Shared / Common Area",
                              subtitle: "Communal facility in shared hallway or lounge.",
                              icon: Users,
                            },
                          ];

                      return contextOptions.map((ctx) => {
                        const CtxIcon = ctx.icon;
                        const isSelected = setupContext === ctx.id;
                        return (
                          <button
                            key={ctx.id}
                            type="button"
                            onClick={() => {
                              setSetupContext(ctx.id);
                              if (errors.setupContext) setErrors((prev) => ({ ...prev, setupContext: undefined }));
                            }}
                            className={cn(
                              "p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3",
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                                : errors.setupContext
                                ? "bg-rose-500/5 border-rose-500/40 text-slate-600 dark:text-slate-400 hover:border-rose-500/70"
                                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40"
                            )}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all mt-0.5",
                              isSelected
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                            )}>
                              <CtxIcon size={18} />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                {ctx.title}
                                {isSelected && <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                {ctx.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>

                  {errors.setupContext && (
                    <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mt-1.5">
                      <AlertCircle size={14} /> {errors.setupContext}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Icon Selection & Property Scoping */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Icon Picker */}
              <div className={cn(
                "space-y-3 p-4 rounded-2xl border transition-all",
                errors.icon
                  ? "bg-rose-500/5 border-rose-500/50 shadow-md shadow-rose-500/5"
                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              )}>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    Choose an Icon *
                  </Label>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-md",
                    selectedIcon
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  )}>
                    Selected: {selectedIcon || "None (Required)"}
                  </span>
                </div>

                {selectedIcon && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                        {React.createElement(getSafeLucideIcon(selectedIcon), { size: 20 })}
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active Selected Icon</span>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{selectedIcon}</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 1000+ icons..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-9 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-all"
                  />
                  {isIconSearching ? (
                    <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" />
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>

                <div className={cn(
                  "grid grid-cols-6 gap-2 max-h-[140px] min-h-[100px] overflow-y-auto p-2 bg-white dark:bg-slate-950/60 rounded-xl border custom-scrollbar",
                  errors.icon ? "border-rose-500/50" : "border-slate-200 dark:border-slate-800"
                )}>
                  {isIconSearching ? (
                    <div className="col-span-full py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Loader2 size={20} className="animate-spin text-emerald-500" />
                      <span className="text-xs font-bold">Searching icons...</span>
                    </div>
                  ) : filteredIcons.length === 0 ? (
                    <div className="col-span-full py-6 flex flex-col items-center justify-center text-center gap-1.5 p-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-0.5">
                        <SearchX size={18} />
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        No icons found matching &quot;{searchQuery}&quot;
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Try searching for &quot;wifi&quot;, &quot;bed&quot;, &quot;home&quot;, &quot;shield&quot;, or &quot;user&quot;
                      </p>
                    </div>
                  ) : (
                    filteredIcons.map((iconName) => {
                      const IconBtn = getSafeLucideIcon(iconName);
                      const isSelected = selectedIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedIcon(iconName);
                            setErrors((prev) => ({ ...prev, icon: undefined }));
                          }}
                          title={iconName}
                          className={cn(
                            "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer relative group",
                            isSelected
                              ? "bg-emerald-600 dark:bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30"
                              : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-500/40"
                          )}
                        >
                          <IconBtn size={18} />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-emerald-600 flex items-center justify-center text-[9px] font-black shadow-md border border-emerald-500">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {errors.icon && (
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mt-2">
                    <AlertCircle size={14} /> {errors.icon}
                  </p>
                )}
              </div>

              {/* Universal vs Targeted Availability Scoping */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    Availability Scope Mode *
                  </Label>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-md",
                    availabilityMode === "UNIVERSAL"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : availabilityMode === "TARGETED"
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  )}>
                    Selected: {availabilityMode === "UNIVERSAL" ? "Universal (All Categories)" : availabilityMode === "TARGETED" ? `Targeted (${selectedPropertyTypes.length} Selected)` : "None (Required)"}
                  </span>
                </div>

                {/* Mode Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAvailabilityMode("UNIVERSAL");
                      setSelectedPropertyTypes([]);
                      if (errors.availabilityMode || errors.propertyTypes) {
                        setErrors((prev) => ({ ...prev, availabilityMode: undefined, propertyTypes: undefined }));
                      }
                    }}
                    className={cn(
                      "p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3",
                      availabilityMode === "UNIVERSAL"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-500/10"
                        : errors.availabilityMode
                        ? "bg-rose-500/5 border-rose-500/40 text-slate-600 dark:text-slate-400 hover:border-rose-500/70"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all mt-0.5",
                      availabilityMode === "UNIVERSAL"
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                    )}>
                      <Globe size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        Universal (All Categories)
                        {availabilityMode === "UNIVERSAL" && <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Applies automatically across all property categories in BoardTAU.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAvailabilityMode("TARGETED");
                      if (errors.availabilityMode) {
                        setErrors((prev) => ({ ...prev, availabilityMode: undefined }));
                      }
                    }}
                    className={cn(
                      "p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3",
                      availabilityMode === "TARGETED"
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-md shadow-indigo-500/10"
                        : errors.availabilityMode
                        ? "bg-rose-500/5 border-rose-500/40 text-slate-600 dark:text-slate-400 hover:border-rose-500/70"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500/40"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all mt-0.5",
                      availabilityMode === "TARGETED"
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                    )}>
                      <Target size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        Targeted Property Categories
                        {availabilityMode === "TARGETED" && <Check size={14} className="text-indigo-500 shrink-0" strokeWidth={3} />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Restricts this amenity or rule to specific selected property types only.
                      </p>
                    </div>
                  </button>
                </div>

                {errors.availabilityMode && (
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mt-1.5">
                    <AlertCircle size={14} /> {errors.availabilityMode}
                  </p>
                )}

                {/* Targeted Property Types Selection Cards */}
                {availabilityMode === "TARGETED" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "p-4 rounded-2xl border space-y-3 mt-3 transition-all",
                      errors.propertyTypes
                        ? "bg-rose-500/5 border-rose-500/40"
                        : "bg-indigo-500/5 border-indigo-500/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Building size={14} /> Select Targeted Categories ({selectedPropertyTypes.length} Selected)
                      </Label>
                      <span className="text-[10px] text-slate-500 font-medium">Click card to toggle selection</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(dbPropertyTypes.length > 0
                        ? dbPropertyTypes.map((pt) => ({ name: pt.name, desc: pt.description || "Property Category", iconName: pt.icon }))
                        : PROPERTY_TYPES_PRESETS.map((pt) => ({ name: pt.label, desc: "Property Category", iconName: "Building" }))
                      ).map((pt) => {
                        const isChecked = selectedPropertyTypes.includes(pt.name);
                        const PtIcon = getSafeLucideIcon(pt.iconName);
                        return (
                          <button
                            key={pt.name}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePropertyType(pt.name);
                              if (errors.propertyTypes) setErrors((prev) => ({ ...prev, propertyTypes: undefined }));
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3",
                              isChecked
                                ? "bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400 font-bold"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500/40"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                                isChecked
                                  ? "bg-indigo-500 text-white border-indigo-500"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                              )}>
                                <PtIcon size={14} />
                              </div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {pt.name}
                              </span>
                            </div>
                            <span className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-black shrink-0 transition-all",
                              isChecked
                                ? "bg-indigo-500 border-indigo-500 text-white"
                                : "border-slate-300 dark:border-slate-700 text-transparent"
                            )}>
                              ✓
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {errors.propertyTypes && (
                      <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mt-2">
                        <AlertCircle size={14} /> {errors.propertyTypes}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Configuration Summary & Final Confirmation */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Modernized Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    Configuration Summary
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Attribute Name */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Attribute Name
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {name || "Not specified"}
                    </div>
                  </div>

                  {/* Classification Type */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Target Classification
                    </span>
                    <div>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {type ? type.replace(/_/g, " ") : "Not set"}
                      </span>
                    </div>
                  </div>

                  {/* Sub-Group */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Sub-Group Category
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {subGroupKey ? subGroupKey.replace(/_/g, " ") : "Not set"}
                    </div>
                  </div>

                  {/* Attribute Icon */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Attribute Icon
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        {React.createElement(IconComponent, { size: 14 })}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedIcon || "None"}</span>
                    </div>
                  </div>
                </div>

                {/* Scope & Availability */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Category Availability
                  </span>
                  <div>
                    {availabilityMode === "UNIVERSAL" ? (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        Universal (Applies to All Property Categories)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPropertyTypes.map((ptName) => (
                          <span
                            key={ptName}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
                          >
                            {ptName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Overview & Description */}
                <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Overview & Tooltip Description
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Attribute Preview */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Card Preview:
                </Label>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-md flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    {React.createElement(IconComponent, { size: 20 })}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{name || "Sample Attribute"}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description || "Sample description for help tooltips."}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Wizard Navigation Actions (Fixed Footer) */}
      <div className="shrink-0 pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="h-11 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="h-11 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="h-11 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Continue</span> <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmAndPublish}
            className="h-11 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check size={16} strokeWidth={3} /> {initialData ? "Save & Update Attribute" : "Save & Create Attribute"}
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};
