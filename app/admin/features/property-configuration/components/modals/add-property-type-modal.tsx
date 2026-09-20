"use client";

import React, { useState, useContext, useMemo } from "react";
import Input from "@/components/inputs/Input";
import { ModalContext } from "@/components/modals/Modal";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Search, Building, Sparkles, Check, AlertCircle, SearchX, Loader2, X, HelpCircle } from "lucide-react";
import { cn, formatCleanTitle } from "@/utils/helper";
import axios from "axios";
import { toast } from "@/app/admin/components/ui/sonner";
import { useRouter } from "next/navigation";

interface AddPropertyTypeModalProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialData?: any; // If editing
  existingPropertyTypes?: any[];
}

const getSafeLucideIcon = (iconName: string) => {
  if (!iconName || iconName === "default" || iconName === "createLucideIcon" || iconName.startsWith("Lucide") || iconName === "Icon") {
    return null;
  }
  const IconObj = (LucideIcons as Record<string, any>)[iconName];
  if (!IconObj || (typeof IconObj !== "function" && typeof IconObj !== "object")) {
    return null;
  }
  return IconObj;
};

export const AddPropertyTypeModal: React.FC<AddPropertyTypeModalProps> = ({ onClose, onSuccess, initialData, existingPropertyTypes }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
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
  // No default icon selected when creating a new property category!
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [iconError, setIconError] = useState<string | null>(null);
  
  const modalContext = useContext(ModalContext);
  const contextClose = modalContext?.close || (() => {});
  const router = useRouter();

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

    if (!searchQuery) {
      return ["Building", "Home", "Building2", "Trees", "Tent", "Hotel", "Warehouse", "Landmark", "Store", "Castle"];
    }
    const query = searchQuery.toLowerCase();
    return validKeys.filter((k) => k.toLowerCase().includes(query)).slice(0, 40);
  }, [searchQuery]);

  const SelectedIconComp = useMemo(() => {
    return getSafeLucideIcon(selectedIcon);
  }, [selectedIcon]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const cleanName = formatCleanTitle(name.trim().replace(/\s+/g, " "));
    const cleanDesc = description.trim().replace(/\s+/g, " ");
    const newErrors: { name?: string; description?: string } = {};
    let hasErr = false;

    if (!cleanName) {
      newErrors.name = "Property Type Name is required";
      hasErr = true;
    } else if (cleanName.length < 2) {
      newErrors.name = "Property Type Name must be at least 2 characters";
      hasErr = true;
    } else if (existingPropertyTypes && Array.isArray(existingPropertyTypes)) {
      const targetLower = cleanName.toLowerCase();
      const isDuplicate = existingPropertyTypes.some(
        (pt: any) => pt.name.trim().replace(/\s+/g, " ").toLowerCase() === targetLower && pt.id !== initialData?.id
      );
      if (isDuplicate) {
        newErrors.name = `A property category named '${cleanName}' already exists`;
        hasErr = true;
      }
    }

    if (!cleanDesc) {
      newErrors.description = "Description is required for tenant cards and tooltips";
      hasErr = true;
    } else if (cleanDesc.length < 5) {
      newErrors.description = "Description must be at least 5 characters";
      hasErr = true;
    }

    setErrors(newErrors);

    if (!selectedIcon) {
      setIconError("Please select an icon for this property category");
      hasErr = true;
    } else {
      setIconError(null);
    }

    if (hasErr) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setIsLoading(true);
      if (initialData?.id) {
        await axios.put(`/api/admin/property-types/${initialData.id}`, {
          name: cleanName,
          description: cleanDesc,
          icon: selectedIcon,
        });
        toast.success(`Property Type "${cleanName}" updated successfully!`);
      } else {
        await axios.post("/api/admin/property-types", {
          name: cleanName,
          description: cleanDesc,
          icon: selectedIcon,
        });
        toast.success(`Property Type "${cleanName}" created successfully!`);
      }
      if (onSuccess) onSuccess();
      router.refresh();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save property type");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 w-full"
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center border border-primary/20 shrink-0">
            <Building size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {initialData ? "Edit Property Type" : "Add Property Type"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Define property classifications (*Apartment, Boarding House, Dormitory, etc.*).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          title="Close Modal"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name & Description */}
        <div className="space-y-4">
          <Input
            id="name"
            label="Property Type Name *"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            onBlur={() => {
              if (name.trim()) setName(formatCleanTitle(name));
            }}
            placeholder="e.g. Apartment, Boarding House"
            disabled={isLoading}
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
            placeholder="Brief description of this accommodation classification"
            disabled={isLoading}
            errors={errors}
            required
            useStaticLabel
          />
        </div>

        {/* Searchable Lucide Icon Picker */}
        <div className={cn(
          "space-y-3 p-4 rounded-2xl border transition-all",
          iconError
            ? "border-red-500 bg-red-50/40 dark:bg-red-950/20"
            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        )}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-primary dark:text-primary-light flex items-center gap-1.5">
              <Sparkles size={14} /> Choose an Icon *
            </label>
            <span className="text-[10px] text-slate-500 font-semibold">
              Selected: {selectedIcon ? selectedIcon : <span className="text-amber-500">None</span>}
            </span>
          </div>

          {iconError && (
            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
              <AlertCircle size={14} /> <span>{iconError}</span>
            </p>
          )}
          
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 1,000+ Lucide icons..."
              disabled={isLoading}
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
          
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[140px] min-h-[100px] overflow-y-auto p-2 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 custom-scrollbar">
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
                  Try searching for &quot;building&quot;, &quot;home&quot;, &quot;hotel&quot;, &quot;tent&quot;, or &quot;house&quot;
                </p>
              </div>
            ) : (
              filteredIcons.map((iconName) => {
                const IconComp = getSafeLucideIcon(iconName);
                const isSelected = selectedIcon === iconName;
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      if (!isLoading) {
                        setSelectedIcon(iconName);
                        if (iconError) setIconError(null);
                      }
                    }}
                    title={iconName}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer",
                      isSelected 
                        ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    <IconComp size={18} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Live Property Type Card Preview */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-semibold text-slate-500">
            Card Preview:
          </span>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary bg-primary/10 dark:border-primary flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              {SelectedIconComp ? (
                <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-xs transition-all">
                  <SelectedIconComp size={22} />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center">
                  <HelpCircle size={22} className="opacity-50" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {name || "Property Type Name"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {description || "Brief description placeholder..."}
                </p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="h-11 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 px-7 rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-2"
          >
            {isLoading ? "Saving..." : <><Check size={16} strokeWidth={3} /> {initialData ? "Save & Update Property Type" : "Save & Create Property Type"}</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
