"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "@/app/admin/components/ui/sonner";
import { Button } from "@/app/admin/components/ui/button";
import Input from "@/components/inputs/Input";
import SafeImage from "@/components/common/SafeImage";
import {
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Check,
  X,
  Compass,
  Building,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileImage,
  AlertCircle,
  Eye,
  Maximize2,
  CheckCircle2,
  GraduationCap,
  Navigation,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useColleges } from "@/hooks/useColleges";
import { formatCleanTitle } from "@/utils/helper";

import { useQueryClient } from "@tanstack/react-query";
import { useEdgeStore } from "@/lib/edgestore";
import { sanitizeImgUrl } from "@/lib/security/sanitize";

import MapLoadingState from "@/components/common/MapLoadingState";

const LandmarkMapPicker = dynamic(() => import("@/components/map/LandmarkMapPicker"), {
  ssr: false,
  loading: () => <MapLoadingState label="TAU Campus GPS Map" height="h-[260px]" />
});

interface AddCollegeModalProps {
  initialData?: any;
  existingColleges?: any[];
  onSuccess: () => void;
  onCloseModal?: () => void;
}

const TAU_PRESETS = [
  { name: "TAU Main Campus", code: "TAU", lat: "15.6352", lng: "120.4154", logoUrl: "" },
  { name: "College of Agriculture (CAF)", code: "CAF", lat: "15.6357", lng: "120.4168", logoUrl: "" },
  { name: "College of Engineering (CET)", code: "CET", lat: "15.6387", lng: "120.4193", logoUrl: "" },
  { name: "College of Business (CBM)", code: "CBM", lat: "15.6348", lng: "120.4158", logoUrl: "" },
  { name: "College of Education (CED)", code: "CED", lat: "15.6398", lng: "120.4210", logoUrl: "" },
  { name: "College of Arts & Sciences (CAS)", code: "CAS", lat: "15.6365", lng: "120.4175", logoUrl: "" },
  { name: "College of Veterinary Med (CVM)", code: "CVM", lat: "15.6372", lng: "120.4182", logoUrl: "" },
];

export const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  initialData,
  existingColleges,
  onSuccess,
  onCloseModal,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activePresetCode, setActivePresetCode] = useState<string | null>(initialData?.code || null);
  const queryClient = useQueryClient();
  const { edgestore } = useEdgeStore();
  
  const { data: fetchedColleges } = useColleges();

  const combinedPresets = useMemo(() => {
    const listSource = (existingColleges && existingColleges.length > 0)
      ? existingColleges
      : (fetchedColleges || []);

    const dbPresets = listSource.map((col: any) => ({
      name: col.name,
      code: col.code,
      lat: col.latitude?.toString() || "15.6352",
      lng: col.longitude?.toString() || "120.4154",
      logoUrl: col.logoUrl || "",
    }));

    TAU_PRESETS.forEach((preset) => {
      if (!dbPresets.some((c: any) => c.code.toUpperCase() === preset.code.toUpperCase())) {
        dbPresets.push(preset);
      }
    });

    return dbPresets;
  }, [existingColleges, fetchedColleges]);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    latitude: initialData?.latitude?.toString() || "15.6352",
    longitude: initialData?.longitude?.toString() || "120.4154",
    logoUrl: initialData?.logoUrl || "",
    order: initialData?.order?.toString() || "0",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.logoUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("College logo asset removed.");
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        latitude: initialData.latitude?.toString() || "15.6352",
        longitude: initialData.longitude?.toString() || "120.4154",
        logoUrl: initialData.logoUrl || "",
        order: initialData.order?.toString() || "0",
      });
      setActivePresetCode(initialData.code || null);
      if (initialData.logoUrl) setPreviewUrl(initialData.logoUrl);
    }
  }, [initialData]);

  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    latitude?: string;
    longitude?: string;
    logoUrl?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name || e.target.id;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const processFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      const errMsg = "Invalid file type. Only PNG, JPEG, WEBP, or SVG are supported.";
      setErrors((prev) => ({ ...prev, logoUrl: errMsg }));
      toast.error(errMsg);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const errMsg = "File size exceeds 5MB limit. Please upload a smaller image.";
      setErrors((prev) => ({ ...prev, logoUrl: errMsg }));
      toast.error(errMsg);
      return;
    }

    // Check image dimensions & aspect ratio
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio < 0.4 || ratio > 2.5) {
        const errMsg = `Image ratio (${img.width}x${img.height}px) is too stretched. Please use a square logo (e.g. 1:1 or 200x200px).`;
        setErrors((prev) => ({ ...prev, logoUrl: errMsg }));
        toast.error(errMsg);
        return;
      }

      setErrors((prev) => ({ ...prev, logoUrl: undefined }));
      setSelectedFile(file);
      setPreviewUrl(objectUrl);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      const errMsg = "Failed to load image file. It may be corrupted.";
      setErrors((prev) => ({ ...prev, logoUrl: errMsg }));
      toast.error(errMsg);
    };

    img.src = objectUrl;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const applyPreset = (preset: typeof TAU_PRESETS[0]) => {
    if (activePresetCode === preset.code) {
      setActivePresetCode(null);
      toast.info(`Cleared ${preset.code} preset selection.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      name: prev.name || preset.name,
      code: preset.code,
      latitude: preset.lat,
      longitude: preset.lng,
    }));
    setActivePresetCode(preset.code);
    setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
    toast.success(`Applied ${preset.code} GPS coordinates!`);
  };

  const handleClearPreset = () => {
    setActivePresetCode(null);
    toast.info("Cleared preset selection.");
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
    setActivePresetCode(null);
    setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
  };

  const handleNextStep = () => {
    const newErrors: { name?: string; code?: string; latitude?: string; longitude?: string; logoUrl?: string } = {};

    if (currentStep === 1) {
      const cleanName = formatCleanTitle(formData.name.trim().replace(/\s+/g, " "));
      const cleanCode = formData.code.trim().replace(/\s+/g, "").toUpperCase();

      if (!cleanName) {
        newErrors.name = "Landmark Name is required (e.g. College of Engineering)";
      }
      if (!cleanCode) {
        newErrors.code = "College Code is required (e.g. CET)";
      }
      if (!previewUrl && !formData.logoUrl) {
        newErrors.logoUrl = "College Logo Asset is required. Please upload or drop an image file.";
      }

      if (existingColleges && Array.isArray(existingColleges)) {
        const isDuplicateCode = existingColleges.some(
          (c: any) => c.code.trim().replace(/\s+/g, "").toUpperCase() === cleanCode && c.id !== initialData?.id
        );
        const isDuplicateName = existingColleges.some(
          (c: any) => c.name.trim().replace(/\s+/g, " ").toLowerCase() === cleanName.toLowerCase() && c.id !== initialData?.id
        );
        if (isDuplicateCode) {
          newErrors.code = `A campus landmark with Code '${cleanCode}' already exists.`;
        }
        if (isDuplicateName) {
          newErrors.name = `A campus landmark with Name '${cleanName}' already exists.`;
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please resolve the highlighted errors before continuing.");
        return;
      }
      setErrors({});
    }

    if (currentStep === 2) {
      if (!formData.latitude || !formData.longitude) {
        newErrors.latitude = "Please select location on map or choose a TAU preset";
        setErrors(newErrors);
        toast.error("Please select latitude and longitude on map");
        return;
      }
      setErrors({});
    }

    setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as any) : 3));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formatCleanTitle(formData.name.trim().replace(/\s+/g, " "));
    const cleanCode = formData.code.trim().replace(/\s+/g, "").toUpperCase();

    if (!cleanName || !cleanCode) {
      toast.error("Landmark Name and Code are required.");
      return;
    }

    try {
      setIsLoading(true);
      let finalLogoUrl = formData.logoUrl;

      // Upload selected image file to EdgeStore bucket if present
      if (selectedFile) {
        toast.loading("Uploading college logo asset to EdgeStore...");
        const uploadRes = await edgestore.publicFiles.upload({
          file: selectedFile,
          options: {
            replaceTargetUrl: (initialData?.logoUrl && initialData.logoUrl.startsWith("http")) ? initialData.logoUrl : undefined,
          },
        });
        finalLogoUrl = uploadRes.url;
      }

      const payload = {
        ...formData,
        name: cleanName,
        code: cleanCode,
        logoUrl: finalLogoUrl,
      };

      if (initialData?.id) {
        await axios.put(`/api/colleges/${initialData.id}`, payload);
        toast.success(`Landmark "${cleanCode}" updated successfully!`);
      } else {
        await axios.post("/api/colleges", payload);
        toast.success(`Landmark "${cleanCode}" added successfully!`);
      }
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      if (onSuccess) onSuccess();
      if (onCloseModal) onCloseModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.response?.data || "Failed to save landmark");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 w-full font-sans"
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {initialData ? "Edit Campus Landmark" : "Add Campus Landmark"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Configure TAU colleges and campus GPS coordinates for student proximity search.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold shrink-0">
          Step {currentStep} of 3
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
        <motion.div
          className="bg-amber-500 h-full rounded-full"
          initial={{ width: "33%" }}
          animate={{ width: `${currentStep * 33.33}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Identity & Logo Upload */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  id="name"
                  name="name"
                  label="Landmark Name *"
                  disabled={isLoading}
                  placeholder="e.g. College of Engineering and Technology"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => {
                    if (formData.name.trim()) {
                      setFormData((prev) => ({ ...prev, name: formatCleanTitle(prev.name) }));
                    }
                  }}
                  errors={errors}
                  required
                  useStaticLabel
                  focusColor="amber"
                />
              </div>
              <div>
                <Input
                  id="code"
                  name="code"
                  label="College Code *"
                  disabled={isLoading}
                  placeholder="e.g. CET"
                  value={formData.code}
                  onChange={handleChange}
                  onBlur={() => {
                    if (formData.code.trim()) {
                      setFormData((prev) => ({ ...prev, code: prev.code.trim().toUpperCase() }));
                    }
                  }}
                  errors={errors}
                  required
                  useStaticLabel
                  focusColor="amber"
                />
              </div>
            </div>

            {/* Logo Image Upload Dropzone */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>College Logo Asset (Upload or Image Dropzone) <span className="text-rose-500 ml-0.5">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">PNG, JPEG, WEBP or SVG</span>
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                  errors.logoUrl
                    ? "border-rose-500 bg-rose-500/10 dark:bg-rose-950/20 shadow-sm ring-2 ring-rose-500/20"
                    : isDragging
                    ? "border-amber-500 bg-amber-500/10"
                    : previewUrl
                    ? "border-amber-500/50 bg-amber-500/5 dark:bg-slate-900/60"
                    : "border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-amber-500/50"
                }`}
              >
                {previewUrl ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPreviewModalOpen(true);
                        }}
                        className="relative group cursor-pointer"
                        title="Click to view full screen preview"
                      >
                        <div className="w-16 h-16 relative rounded-xl bg-white border border-slate-200 dark:border-slate-800 p-2 shadow-md shrink-0 transition-transform group-hover:scale-105 overflow-hidden">
                          <SafeImage
                            src={sanitizeImgUrl(previewUrl)}
                            alt="College Logo Preview"
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="absolute inset-0 bg-slate-950/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye size={18} />
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Check size={14} className="text-amber-500" /> Logo Uploaded
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Click image or eye icon to enlarge preview</p>
                      </div>
                    </div>

                    {/* Preview & Remove Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPreviewModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        title="Full Screen Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer"
                        title="Remove Logo Asset"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Click to upload college logo or drag & drop file
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Recommended square ratio (e.g. 200x200px)</p>
                    </div>
                  </>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {errors.logoUrl && (
                <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-1.5">
                  <AlertCircle size={14} /> {errors.logoUrl}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Interactive Map Location & GPS Coordinates */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3.5"
          >
            {/* GPS Presets Quick Picker */}
            <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-slate-900/80 border border-amber-500/20 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> TAU Campus GPS Presets
                </span>
                <div className="flex items-center gap-3">
                  {activePresetCode && (
                    <button
                      type="button"
                      onClick={handleClearPreset}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X size={12} /> Clear Selection
                    </button>
                  )}
                  <span className="text-[11px] text-slate-500 font-medium">Click to auto-snap map pin</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {combinedPresets.map((preset) => {
                  const isSelected = activePresetCode === preset.code;
                  return (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      title={isSelected ? "Click to unselect preset" : `Apply ${preset.name}`}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-amber-500 text-white shadow-md border-amber-500"
                          : "bg-white dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <Compass size={13} className={isSelected ? "text-white" : "text-amber-500"} />
                      <span>{preset.code}</span>
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leaflet Map Picker Component */}
            <LandmarkMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onSelectLocation={handleLocationSelect}
              presets={combinedPresets}
              logoUrl={previewUrl || formData.logoUrl}
            />

            {/* Modernized Live GPS Coordinates Display Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      GPS Coordinates <span className="text-rose-500">*</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Auto-updated on map click or pin drag</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Live Map Sync
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    id="latitude"
                    name="latitude"
                    label="LATITUDE (N) *"
                    disabled={isLoading}
                    placeholder="15.6387"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    errors={errors}
                    required
                    useStaticLabel
                    focusColor="amber"
                  />
                </div>
                <div>
                  <Input
                    id="longitude"
                    name="longitude"
                    label="LONGITUDE (E) *"
                    disabled={isLoading}
                    placeholder="120.4193"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    errors={errors}
                    required
                    useStaticLabel
                    focusColor="amber"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Configuration Summary & Live Search Card Preview */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Reassurance Header Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Ready for Campus Directory <Sparkles size={13} className="text-amber-500" />
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-snug">
                  Review your campus landmark summary and live search filter card below.
                </p>
              </div>
            </div>

            {/* Live Student Search & Directory Card Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <Eye size={12} className="text-amber-500" /> Live Search Card Preview
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  ● Ready to Publish
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 dark:border-amber-500/20 shadow-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-amber-500 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    {previewUrl ? (
                      <SafeImage src={sanitizeImgUrl(previewUrl)} alt={formData.code || "College Logo"} fill className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-amber-500">{formData.code || "TAU"}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {formData.name || "TAU Campus Landmark"}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px] border border-amber-500/20">
                        {formData.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin size={13} className="text-amber-500 shrink-0" />
                      <span>{formData.latitude || "15.6387"}, {formData.longitude || "120.4193"} (TAU Campus)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Grid Configuration Highlights */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <GraduationCap size={13} className="text-amber-500" /> Landmark Name
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {formData.name || "N/A"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Code: {formData.code || "N/A"}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <Navigation size={13} className="text-amber-500" /> GPS Pin Sync
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {formData.latitude}, {formData.longitude}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Distance calculator ready</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <Layers size={13} className="text-amber-500" /> Search Filter
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Campus Landmark
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Available in Student Search</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <FileImage size={13} className="text-amber-500" /> Logo Asset
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {previewUrl ? "Custom Logo Set" : "Default Badge"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Rendered on Leaflet pins</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={isLoading}
            className="h-11 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <button
            disabled={isLoading}
            onClick={onCloseModal}
            type="button"
            className="h-11 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isLoading}
            className="h-11 px-7 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Continue</span> <ArrowRight size={16} />
          </button>
        ) : (
          <button
            disabled={isLoading}
            onClick={onSubmit}
            type="button"
            className="h-11 px-7 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? "Saving..." : <><Check size={16} strokeWidth={3} /> {initialData ? "Save & Update Landmark" : "Save & Create Landmark"}</>}
          </button>
        )}
      </div>

      {/* Full-Screen Lightbox Image Preview Modal Portal */}
      {mounted &&
        isPreviewModalOpen &&
        previewUrl &&
        createPortal(
          <AnimatePresence mode="wait">
            <div
              onClick={() => setIsPreviewModalOpen(false)}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-sans"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {formData.name || "College Logo Asset"}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">Full High-Resolution Image Preview</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative w-full h-[60vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                  <SafeImage
                    src={sanitizeImgUrl(previewUrl)}
                    alt="Full Logo Preview"
                    fill
                    className="object-contain p-4"
                  />
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="h-11 px-7 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
};
