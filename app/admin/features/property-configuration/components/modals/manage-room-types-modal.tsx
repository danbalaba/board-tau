"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalContext } from "@/components/modals/Modal";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Search, Hotel, Plus, Trash2, Edit2, Check, ArrowRight, ArrowLeft, HelpCircle, Power, PowerOff, Loader2, Sparkles, AlertCircle, SearchX, X, AlertTriangle, Bed, Users, Minus, Lock } from "lucide-react";
import { cn, formatCleanTitle } from "@/utils/helper";
import { toast } from "@/app/admin/components/ui/sonner";
import { Label } from "@/app/admin/components/ui/label";
import Input from "@/components/inputs/Input";
import { Skeleton } from "@/app/admin/components/ui/skeleton";
import axios from "axios";
import { DeleteRoomTypeModal } from "./delete-room-type-modal";

interface ManageRoomTypesModalProps {
  propertyType?: { id: string; name: string };
  onClose?: () => void;
}

interface BedSetupOption {
  code: string;
  name: string;
  description: string;
  paxCapacity: number;
}

const roomTypesCacheMap = new Map<string, { data: any[]; timestamp: number }>();
export const invalidateRoomTypesCache = () => roomTypesCacheMap.clear();

export const ManageRoomTypesModal: React.FC<ManageRoomTypesModalProps> = ({
  propertyType = { id: "1", name: "Boarding House" },
  onClose,
}) => {
  const modalContext = React.useContext(ModalContext);
  const contextClose = modalContext?.close || (() => {});

  // Navigation State: 'list' (Overview) vs 'form' (Add/Edit Wizard)
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isFetchingList, setIsFetchingList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Wizard Step (1..4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isIconSearching, setIsIconSearching] = useState(false);

  useEffect(() => {
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
  const [isFlatRate, setIsFlatRate] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<{ name?: string; description?: string; icon?: string; bedSetups?: string }>({});

  // Bed Setups
  const [bedSetups, setBedSetups] = useState<BedSetupOption[]>([
    { code: "SINGLE", name: "Single Bed Frame", description: "Private 1-pax single mattress frame", paxCapacity: 1 },
    { code: "DOUBLE", name: "Double Bed Frame", description: "Spacious double mattress frame", paxCapacity: 1 },
  ]);

  const [showAddBedForm, setShowAddBedForm] = useState(false);
  const [editingBedCode, setEditingBedCode] = useState<string | null>(null);
  const [newBedCode, setNewBedCode] = useState("");
  const [newBedName, setNewBedName] = useState("");
  const [newBedDesc, setNewBedDesc] = useState("");
  const [newBedPax, setNewBedPax] = useState(1);

  // Bed setup deletion confirmation modal state
  const [bedSetupToDelete, setBedSetupToDelete] = useState<{ code: string; name: string } | null>(null);
  const [isDeleteBedModalOpen, setIsDeleteBedModalOpen] = useState(false);

  // Fetch Room Types with smart caching & instant invalidation
  const fetchRoomTypes = useCallback(async (forceRefresh = false) => {
    if (!propertyType?.id) return;

    if (!forceRefresh) {
      const cached = roomTypesCacheMap.get(propertyType.id);
      if (cached && Date.now() - cached.timestamp < 300000) {
        setRoomTypes(cached.data);
        setIsFetchingList(false);
        return;
      }
    }

    try {
      setIsFetchingList(true);
      const res = await axios.get(`/api/admin/room-types?propertyTypeId=${propertyType.id}`);
      const data = res.data?.data || [];
      setRoomTypes(data);
      roomTypesCacheMap.set(propertyType.id, { data, timestamp: Date.now() });
    } catch (err) {
      toast.error("Failed to load room types");
    } finally {
      setIsFetchingList(false);
    }
  }, [propertyType?.id]);

  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  const handleClose = () => {
    if (onClose) onClose();
    else contextClose();
  };

  const openCreateForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setSelectedIcon("");
    setIsFlatRate(false);
    setEditingBedCode(null);
    setShowAddBedForm(false);
    setNewBedCode("");
    setNewBedName("");
    setNewBedDesc("");
    setNewBedPax(1);
    setBedSetups([
      { code: "SINGLE", name: "Single Bed Frame", description: "Private 1-pax single mattress frame", paxCapacity: 1 },
      { code: "DOUBLE", name: "Double Bed Frame", description: "Spacious double mattress frame", paxCapacity: 1 },
    ]);
    setErrors({});
    setCurrentStep(1);
    setViewMode("form");
  };

  const openEditForm = (rt: any) => {
    setEditingId(rt.id);
    setName(rt.name || "");
    setDescription(rt.description || "");
    setSelectedIcon(rt.icon || "User");
    setIsFlatRate(rt.isFlatRate ?? false);
    setEditingBedCode(null);
    setShowAddBedForm(false);
    setNewBedCode("");
    setNewBedName("");
    setNewBedDesc("");
    setNewBedPax(1);
    if (rt.bedSetups && rt.bedSetups.length > 0) {
      setBedSetups(
        rt.bedSetups
          .filter((b: any) => b.code !== "ANY")
          .map((b: any) => ({
            code: b.code,
            name: b.name,
            description: b.description || "",
            paxCapacity: b.paxCapacity || 1,
          }))
      );
    } else {
      setBedSetups([
        { code: "SINGLE", name: "Single Bed Frame", description: "Private 1-pax single mattress frame", paxCapacity: 1 },
        { code: "DOUBLE", name: "Double Bed Frame", description: "Spacious double mattress frame", paxCapacity: 1 },
      ]);
    }
    setErrors({});
    setCurrentStep(1);
    setViewMode("form");
  };

  const handleToggleStatus = async (rt: any) => {
    try {
      await axios.put(`/api/admin/room-types/${rt.id}`, {
        isActive: !rt.isActive,
      });
      toast.success(`Room type '${rt.name}' ${rt.isActive ? "disabled" : "enabled"}.`);
      invalidateRoomTypesCache();
      fetchRoomTypes(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update room type status");
    }
  };

  const filteredIcons = useMemo(() => {
    if (!searchQuery) {
      return ["User", "Users", "Bed", "Hotel", "Building", "Home", "Square", "DoorClosed", "DoorOpen", "MapPin", "Layers", "Sprout"];
    }
    const query = searchQuery.toLowerCase();
    return Object.keys(LucideIcons)
      .filter((k) => {
        if (k === "default" || k === "createLucideIcon" || k.startsWith("Lucide") || k.endsWith("Icon")) return false;
        const comp = (LucideIcons as any)[k];
        if (!comp || (typeof comp !== "function" && typeof comp !== "object")) return false;
        return k.toLowerCase().includes(query);
      })
      .slice(0, 24);
  }, [searchQuery]);

  const handleOpenEditBedForm = (bed: BedSetupOption) => {
    setEditingBedCode(bed.code);
    setNewBedCode(bed.code);
    setNewBedName(bed.name);
    setNewBedDesc(bed.description || "");
    setNewBedPax(bed.paxCapacity || 1);
    setShowAddBedForm(true);
  };

  const handleAddBedSetup = () => {
    const cleanName = formatCleanTitle(newBedName.trim().replace(/\s+/g, " "));
    const cleanCode = newBedCode.trim().replace(/[^A-Z0-9_]+/gi, "").toUpperCase();
    const cleanDesc = newBedDesc.trim().replace(/\s+/g, " ");

    if (!cleanName || !cleanCode) {
      toast.error("Please enter a bed setup name and code");
      return;
    }

    const codeToTest = cleanCode;
    const nameToTest = cleanName.toLowerCase();

    // If editing existing bed item
    if (editingBedCode) {
      const isDuplicateCode = bedSetups.some((b) => b.code !== editingBedCode && b.code.toUpperCase() === codeToTest);
      if (isDuplicateCode) {
        toast.error(`A bed setup choice with Code '${codeToTest}' already exists.`);
        return;
      }
      const isDuplicateName = bedSetups.some((b) => b.code !== editingBedCode && b.name.trim().replace(/\s+/g, " ").toLowerCase() === nameToTest);
      if (isDuplicateName) {
        toast.error(`A bed setup choice with Name '${cleanName}' already exists.`);
        return;
      }

      setBedSetups(
        bedSetups.map((b) =>
          b.code === editingBedCode
            ? { code: codeToTest, name: cleanName, description: cleanDesc, paxCapacity: newBedPax }
            : b
        )
      );
      setErrors((prev) => ({ ...prev, bedSetups: undefined }));
      setEditingBedCode(null);
      setNewBedCode("");
      setNewBedName("");
      setNewBedDesc("");
      setNewBedPax(1);
      setShowAddBedForm(false);
      toast.success(`Bed setup '${cleanName}' updated!`);
      return;
    }

    // Creating new bed item
    if (bedSetups.some((b) => b.code.toUpperCase() === codeToTest)) {
      toast.error(`A bed setup choice with Code '${codeToTest}' already exists.`);
      return;
    }

    if (bedSetups.some((b) => b.name.trim().replace(/\s+/g, " ").toLowerCase() === nameToTest)) {
      toast.error(`A bed setup choice with Name '${cleanName}' already exists.`);
      return;
    }

    setBedSetups([
      ...bedSetups,
      {
        code: codeToTest,
        name: cleanName,
        description: cleanDesc,
        paxCapacity: newBedPax,
      },
    ]);
    setErrors((prev) => ({ ...prev, bedSetups: undefined }));
    setNewBedCode("");
    setNewBedName("");
    setNewBedDesc("");
    setNewBedPax(1);
    setShowAddBedForm(false);
    toast.success("Bed setup added!");
  };

  const handleRemoveBedSetup = (code: string) => {
    setBedSetups(bedSetups.filter((b) => b.code !== code));
  };

  const IconComponent = useMemo(() => {
    const icon = (LucideIcons as Record<string, any>)[selectedIcon];
    if (icon && (typeof icon === "function" || typeof icon === "object")) return icon;
    return HelpCircle;
  }, [selectedIcon]);

  // Validation logic on Continue click
  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; description?: string; icon?: string; bedSetups?: string } = {};

    if (currentStep === 1) {
      const cleanName = formatCleanTitle(name.trim().replace(/\s+/g, " "));
      const cleanDesc = description.trim().replace(/\s+/g, " ");

      if (!cleanName) {
        newErrors.name = "Room Type Name is required";
      } else if (cleanName.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      } else {
        const isDuplicateName = roomTypes.some(
          (rt) => rt.name.trim().replace(/\s+/g, " ").toLowerCase() === cleanName.toLowerCase() && rt.id !== editingId
        );
        if (isDuplicateName) {
          newErrors.name = `A room type named '${cleanName}' already exists under ${propertyType.name}`;
        }
      }

      if (!cleanDesc) {
        newErrors.description = "Description is required for tenant cards";
      } else if (cleanDesc.length < 5) {
        newErrors.description = "Description must be at least 5 characters";
      }

      if (!selectedIcon) {
        newErrors.icon = "Please select an icon for this room type";
      }

      if (newErrors.name || newErrors.description || newErrors.icon) {
        setErrors(newErrors);
        toast.error(newErrors.name || "Please complete all required fields on Step 1");
        return;
      }
    }

    if (currentStep === 2 && isFlatRate) {
      // Skip Step 3 Bed Setups for Flat-Rate Whole Units and go straight to Step 4 Preview
      setErrors({});
      setCurrentStep(4);
      return;
    }

    if (currentStep === 3) {
      if (showAddBedForm) {
        const cleanBedName = formatCleanTitle(newBedName.trim().replace(/\s+/g, " "));
        const cleanBedCode = newBedCode.trim().replace(/[^A-Z0-9_]+/gi, "").toUpperCase();

        if (cleanBedName && cleanBedCode) {
          const codeToTest = cleanBedCode;
          const nameToTest = cleanBedName.toLowerCase();

          if (bedSetups.some((b) => b.code.toUpperCase() === codeToTest)) {
            newErrors.bedSetups = `A bed setup choice with Code '${codeToTest}' already exists.`;
            setErrors(newErrors);
            toast.error(`A bed setup choice with Code '${codeToTest}' already exists.`);
            return;
          }

          if (bedSetups.some((b) => b.name.trim().replace(/\s+/g, " ").toLowerCase() === nameToTest)) {
            newErrors.bedSetups = `A bed setup choice with Name '${cleanBedName}' already exists.`;
            setErrors(newErrors);
            toast.error(`A bed setup choice with Name '${cleanBedName}' already exists.`);
            return;
          }

          setBedSetups((prev) => [
            ...prev,
            {
              code: codeToTest,
              name: cleanBedName,
              description: newBedDesc.trim().replace(/\s+/g, " "),
              paxCapacity: newBedPax,
            },
          ]);
          setNewBedCode("");
          setNewBedName("");
          setNewBedDesc("");
          setNewBedPax(1);
          setShowAddBedForm(false);
          toast.success("Auto-saved your new bed setup choice!");
        } else {
          newErrors.bedSetups = "You have an unsaved bed setup entry. Please click 'Save Bed Choice' or 'Cancel' before continuing.";
          setErrors(newErrors);
          toast.error("Please save or cancel your new bed setup entry before continuing");
          return;
        }
      }

      if (!isFlatRate && bedSetups.length === 0) {
        newErrors.bedSetups = "Please configure at least 1 allowable bed setup choice";
        setErrors(newErrors);
        toast.error("At least 1 bed setup choice is required");
        return;
      }
    }

    setErrors({});
    setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as any) : 4));
  };

  // Step-by-Step Back Navigation
  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrors({});
    if (currentStep === 4 && isFlatRate) {
      // Jump back to Step 2 for Flat-Rate Whole Units
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    } else {
      setViewMode("list");
    }
  };

  const handleConfirmAndPublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanName = formatCleanTitle(name.trim().replace(/\s+/g, " "));
    const cleanDesc = description.trim().replace(/\s+/g, " ");

    if (!cleanName || !cleanDesc) {
      setErrors({
        name: !cleanName ? "Room Type Name is required" : undefined,
        description: !cleanDesc ? "Description is required" : undefined,
      });
      toast.error("Please fill in all required fields before publishing");
      return;
    }

    try {
      setIsSaving(true);
      if (editingId) {
        await axios.put(`/api/admin/room-types/${editingId}`, {
          name: cleanName,
          description: cleanDesc,
          icon: selectedIcon,
          isFlatRate,
          bedSetups,
        });
        toast.success(`Room Type '${cleanName}' updated successfully!`);
      } else {
        await axios.post("/api/admin/room-types", {
          propertyTypeId: propertyType.id,
          name: cleanName,
          description: cleanDesc,
          icon: selectedIcon,
          isFlatRate,
          bedSetups,
        });
        toast.success(`Room Type '${cleanName}' created for ${propertyType.name}!`);
      }
      invalidateRoomTypesCache();
      await fetchRoomTypes(true);
      setViewMode("list");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save room type");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="space-y-0 max-h-[85vh] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent p-6 text-slate-800 dark:text-slate-200 font-sans"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <Hotel size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {viewMode === "list" ? "Manage Room Types" : editingId ? "Edit Room Type" : "Add New Room Type"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Target Category: <span className="font-semibold text-primary">{propertyType.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === "list" ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus size={16} /> Add Room Type
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
              Step {isFlatRate && currentStep === 4 ? 3 : currentStep} of {isFlatRate ? 3 : 4}
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
            title="Close Manager"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW MODE 1: MASTER LIST OVERVIEW */}
        {viewMode === "list" && (
          <motion.div
            key="overview-list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 pt-4"
          >
            {isFetchingList ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 w-full">
                      <Skeleton className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="space-y-2 w-full max-w-xs">
                        <Skeleton className="h-4 w-36 rounded-md bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-3 w-56 rounded-md bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Skeleton className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <Skeleton className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <Skeleton className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : roomTypes.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Hotel size={24} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  No Room Types Configured Yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No custom room types exist for <strong>{propertyType.name}</strong>. Click the button below to add your first room layout!
                </p>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus size={16} /> Add First Room Type
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {roomTypes.map((rt) => {
                  const Icon = (LucideIcons as Record<string, any>)[rt.icon || "User"] || HelpCircle;
                  return (
                    <div
                      key={rt.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        rt.isActive
                          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-900 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                          <Icon size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {rt.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                              rt.isFlatRate
                                ? "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                                : "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                            }`}>
                              {rt.isFlatRate ? "Flat-Rate Unit" : "Per-Head Bedspace"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                            {rt.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditForm(rt)}
                          className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="Edit Room Type"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(rt)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            rt.isActive
                              ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800"
                              : "text-primary hover:bg-primary/10 dark:hover:bg-slate-800"
                          }`}
                          title={rt.isActive ? "Disable Room Type" : "Enable Room Type"}
                        >
                          {rt.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <Modal>
                          <Modal.Trigger name={`delete-room-type-${rt.id}`}>
                            <button
                              type="button"
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                              title="Delete Room Type"
                            >
                              <Trash2 size={16} />
                            </button>
                          </Modal.Trigger>
                          <Modal.Window name={`delete-room-type-${rt.id}`} size="md" closeOnOutsideClick={false}>
                            <DeleteRoomTypeModal
                              roomType={rt}
                              onSuccess={(deletedId) => {
                                setRoomTypes((prev) => prev.filter((r) => r.id !== (deletedId || rt.id)));
                                invalidateRoomTypesCache();
                                fetchRoomTypes(true);
                              }}
                            />
                          </Modal.Window>
                        </Modal>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="h-11 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
              >
                Close Manager
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW MODE 2: WIZARD FORM (ADD/EDIT) */}
        {viewMode === "form" && (
          <motion.div
            key="wizard-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 pt-4"
          >
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full"
                initial={{ width: "25%" }}
                animate={{ width: `${currentStep * 25}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* STEP 1: Details */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <Input
                  id="name"
                  label="Room Type Name *"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  onBlur={() => {
                    if (name.trim()) setName(formatCleanTitle(name));
                  }}
                  placeholder="e.g. Solo Room or Studio Unit"
                  errors={errors}
                  required
                  useStaticLabel
                />

                <Input
                  id="description"
                  label="Description (Consumed by Tooltip / Tenant Cards) *"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  placeholder="e.g. Entire private room exclusively for yourself with personal study area."
                  errors={errors}
                  required
                  useStaticLabel
                />

                <div className={cn(
                  "space-y-3 p-4 rounded-2xl border transition-all",
                  errors.icon
                    ? "border-red-500 bg-red-50/40 dark:bg-red-950/20"
                    : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                )}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-primary">
                      Choose Room Type Icon *
                    </Label>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Selected: {selectedIcon ? selectedIcon : <span className="text-amber-500">None</span>}
                    </span>
                  </div>

                  {errors.icon && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                      <AlertCircle size={14} /> <span>{errors.icon}</span>
                    </p>
                  )}

                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search icons..."
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-primary transition-all"
                    />
                    {isIconSearching ? (
                      <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-primary" />
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

                  <div className="grid grid-cols-6 gap-2 max-h-[140px] min-h-[100px] overflow-y-auto p-2 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 custom-scrollbar">
                    {isIconSearching ? (
                      <div className="col-span-full py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2 size={20} className="animate-spin text-primary" />
                        <span className="text-xs font-semibold">Searching icons...</span>
                      </div>
                    ) : filteredIcons.length === 0 ? (
                      <div className="col-span-full py-6 flex flex-col items-center justify-center text-center gap-1.5 p-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-0.5">
                          <SearchX size={18} />
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          No icons found matching &quot;{searchQuery}&quot;
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Try searching for &quot;user&quot;, &quot;bed&quot;, &quot;hotel&quot;, &quot;home&quot;, or &quot;building&quot;
                        </p>
                      </div>
                    ) : (
                      filteredIcons.map((iconName) => {
                        const rawIcon = (LucideIcons as Record<string, any>)[iconName];
                        const IconBtn = (rawIcon && (typeof rawIcon === "function" || typeof rawIcon === "object")) ? rawIcon : HelpCircle;
                        const isSelected = selectedIcon === iconName;
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                              setSelectedIcon(iconName);
                              if (errors.icon) setErrors((prev) => ({ ...prev, icon: undefined }));
                            }}
                            className={cn(
                              "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer",
                              isSelected
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary/40"
                            )}
                          >
                            <IconBtn size={18} />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Pricing & Billing Model *
                </Label>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFlatRate(false)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all cursor-pointer",
                      !isFlatRate
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/40"
                    )}
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                      Per-Head Bedspace Pricing
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Landlords charge per individual bed slot / occupant. Ideal for Bedspaces & Shared Multi-Bed Rooms.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFlatRate(true)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all cursor-pointer",
                      isFlatRate
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/40"
                    )}
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                      Flat-Rate Whole Unit Pricing
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Landlords charge a single fixed rate for the entire room/unit. Ideal for Solo Rooms, Studio Units, Suites & Whole Houses.
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Bed Setups */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Allowable Bed Setup Choices *
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowAddBedForm(!showAddBedForm)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Add Bed Setup Choice
                  </button>
                </div>

                {errors.bedSetups && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                    <AlertCircle size={14} /> <span>{errors.bedSetups}</span>
                  </p>
                )}

                <AnimatePresence mode="wait">
                  {showAddBedForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.98 }}
                      animate={{ opacity: 1, height: "auto", scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="p-4 rounded-2xl bg-primary/5 border border-primary/30 space-y-3 overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Bed Setup Name (e.g. King Size Bed Frame)"
                          value={newBedName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewBedName(val);
                            // Auto-generate uppercase code from name (e.g. "King Size Bed" -> "KING_SIZE_BED")
                            const autoCode = val
                              .trim()
                              .toUpperCase()
                              .replace(/[^A-Z0-9]+/g, "_")
                              .slice(0, 20);
                            setNewBedCode(autoCode);
                          }}
                          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold col-span-2"
                        />
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            tabIndex={-1}
                            placeholder="AUTO_CODE"
                            value={newBedCode}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 pr-8 text-xs font-semibold font-mono uppercase text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                            title="Bed code is auto-generated from the bed name"
                          />
                          <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Description (e.g. Spacious 2-pax double mattress frame)"
                          value={newBedDesc}
                          onChange={(e) => setNewBedDesc(e.target.value)}
                          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold col-span-2"
                        />
                        <div className="flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-primary shrink-0" />
                            <div>
                              <label className="block text-[8px] font-semibold uppercase tracking-wider text-slate-400">Pax Limit</label>
                              <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                                {newBedPax} Pax
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                            <button
                              type="button"
                              onClick={() => setNewBedPax((prev) => Math.max(1, prev - 1))}
                              disabled={newBedPax <= 1}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary cursor-pointer transition-all"
                              title="Decrease Pax Capacity"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-4 text-center text-xs font-bold text-primary">
                              {newBedPax}
                            </span>
                            <button
                              type="button"
                              onClick={() => setNewBedPax((prev) => Math.min(6, prev + 1))}
                              disabled={newBedPax >= 6}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary cursor-pointer transition-all"
                              title="Increase Pax Capacity (Max 6)"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddBedForm(false);
                            setEditingBedCode(null);
                            setNewBedCode("");
                            setNewBedName("");
                            setNewBedDesc("");
                            setNewBedPax(1);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddBedSetup}
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-lg hover:bg-primary/90 cursor-pointer"
                        >
                          {editingBedCode ? "Update Bed Choice" : "Save Bed Choice"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2.5">
                  {bedSetups.map((bed, idx) => (
                    <div
                      key={bed.code}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{idx + 1}. {bed.name} ({bed.code})</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                            <Users size={11} /> {bed.paxCapacity || 1} {(bed.paxCapacity || 1) === 1 ? "Pax" : "Pax"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{bed.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBedForm(bed)}
                          className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="Edit Bed Choice"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBedSetupToDelete({ code: bed.code, name: bed.name });
                            setIsDeleteBedModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Remove Bed Choice"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Summary & Live Preview */}
            {currentStep === 4 && (
              <div className="space-y-5">
                {/* Modernized Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Configuration Summary
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Property Category */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Property Category
                      </span>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {propertyType.name}
                      </div>
                    </div>

                    {/* Room Name */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Room Name
                      </span>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {name || "Not specified"}
                      </div>
                    </div>

                    {/* Room Icon */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Room Icon
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          {React.createElement(IconComponent, { size: 14 })}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{selectedIcon || "None"}</span>
                      </div>
                    </div>

                    {/* Billing Structure */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Billing Structure
                      </span>
                      <div>
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                          isFlatRate
                            ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                        )}>
                          {isFlatRate ? "Flat-Rate Whole Unit Pricing" : "Per-Head Bedspace Pricing"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allowable Bed Setups */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Allowable Bed Setup Choices ({bedSetups.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {bedSetups.map((b) => (
                        <span
                          key={b.code}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
                        >
                          {b.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Overview & Details */}
                  <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Overview & Description
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Live Tenant Card Preview */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Search Wizard Card Preview:
                  </Label>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary shadow-md flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {React.createElement(IconComponent, { size: 20 })}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{name || "Sample Room Type"}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description || "Sample description for tooltips."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSaving}
                className="h-11 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} /> {currentStep > 1 ? "Back" : "Back to List"}
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSaving}
                  className="h-11 px-7 rounded-2xl bg-primary hover:bg-primary/90 active:bg-primary text-white font-semibold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span> <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmAndPublish}
                  disabled={isSaving}
                  className="h-11 px-7 rounded-2xl bg-primary hover:bg-primary/90 active:bg-primary text-white font-semibold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                  <span>{isSaving ? "Saving..." : editingId ? "Save & Update Room Type" : "Save & Create Room Type"}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Bed Setup Confirmation Modal */}
      <Modal
        isOpen={isDeleteBedModalOpen}
        onClose={() => {
          setIsDeleteBedModalOpen(false);
          setBedSetupToDelete(null);
        }}
        title=""
      >
        {bedSetupToDelete && (
          <div className="p-6 sm:p-8 relative text-slate-800 dark:text-slate-200 w-full font-sans">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-t-2xl" />

            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 flex items-center justify-center mb-5 shadow-sm">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
                Remove Bed Setup Choice?
              </h3>

              <div className="my-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 w-full flex items-center justify-center gap-3">
                <Bed className="w-5 h-5 text-red-500 shrink-0" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {bedSetupToDelete.name} ({bedSetupToDelete.code})
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900 dark:text-slate-100">{bedSetupToDelete.name}</strong> from the allowable bed setup choices for this room type?
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteBedModalOpen(false);
                    setBedSetupToDelete(null);
                  }}
                  className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (bedSetupToDelete) {
                      handleRemoveBedSetup(bedSetupToDelete.code);
                    }
                    setIsDeleteBedModalOpen(false);
                    setBedSetupToDelete(null);
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Choice
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
