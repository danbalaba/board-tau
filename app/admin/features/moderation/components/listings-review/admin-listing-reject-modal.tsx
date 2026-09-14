'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, AlertTriangle, ShieldAlert, Check, FileText, MapPin, Image, DollarSign, Shield, ArrowRight, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { useIsClient } from '@/hooks/useIsClient';

interface AdminListingRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  listingTitle?: string;
  isSubmitting?: boolean;
  activeStep?: string; // 'OVERVIEW' | 'LOCATION' | 'CONFIG' | 'ROOMS' | 'IMAGES' | 'DOCS'
  uncheckedNotes?: string[];
}

export interface PremadeReasonCategory {
  stepId: string;
  category: string;
  stepNumber: number;
  icon: any;
  reasons: { id: string; label: string; note: string }[];
}

const PREMADE_REASON_CATEGORIES: PremadeReasonCategory[] = [
  {
    stepId: 'OVERVIEW',
    category: 'Basic Info & Host',
    stepNumber: 1,
    icon: FileText,
    reasons: [
      { id: 'HOST_UNVERIFIED', label: 'Host Profile Unverified', note: 'Landlord host account profile or contact information requires verification.' },
      { id: 'TITLE_MISLEADING', label: 'Misleading Property Name', note: 'Property title or category description is inaccurate or misleading.' },
      { id: 'DESC_INAPPROPRIATE', label: 'Improper Description Copy', note: 'Property description contains improper formatting, missing details, or prohibited terms.' },
      { id: 'RATE_BASE_UNREALISTIC', label: 'Unrealistic Monthly Base Price', note: 'Listed monthly rental base price is unrealistic or inconsistent for TAU listings.' }
    ]
  },
  {
    stepId: 'LOCATION',
    category: 'Location & Address',
    stepNumber: 2,
    icon: MapPin,
    reasons: [
      { id: 'LOC_INCOMPLETE', label: 'Incomplete Street Address', note: 'Street address or barangay info is incomplete. Please specify full street address.' },
      { id: 'LOC_PIN_INCORRECT', label: 'Incorrect Map Pin', note: 'Map pin location does not match the physical property address near TAU campus.' }
    ]
  },
  {
    stepId: 'CONFIG',
    category: 'Setup & Rules',
    stepNumber: 3,
    icon: Shield,
    reasons: [
      { id: 'RULE_PROHIBITED', label: 'Violating House Rules', note: 'House rules or occupancy policies violate TAU student safety or housing guidelines.' },
      { id: 'AMENITY_MISLEADING', label: 'Misleading Amenities Specs', note: 'Listed amenities or utility inclusions are inconsistent with property type.' },
      { id: 'POLICY_INCOMPLETE', label: 'Incomplete Occupancy Policy', note: 'Security deposit, curfew, or tenant policies are incomplete or unclear.' }
    ]
  },
  {
    stepId: 'ROOMS',
    category: 'Rooms & Rates',
    stepNumber: 4,
    icon: DollarSign,
    reasons: [
      { id: 'RATE_UNREALISTIC', label: 'Unrealistic Room Rent Rate', note: 'Monthly rent rate per room/bed is unrealistically low or misleading.' },
      { id: 'ROOM_CAPACITY', label: 'Invalid Room Specs', note: 'Room capacity or bed count specs are invalid or mathematically inconsistent.' },
      { id: 'ROOM_AMENITIES', label: 'Missing Room Details', note: 'Room dimensions, bathroom specs, or pricing tiers require clarification.' }
    ]
  },
  {
    stepId: 'IMAGES',
    category: 'Photos & Media',
    stepNumber: 5,
    icon: Image,
    reasons: [
      { id: 'PHOTO_LOW_RES', label: 'Low Quality / Dark Photos', note: 'Photos uploaded are too dark, pixelated, or blurry. Please upload bright photos.' },
      { id: 'PHOTO_WATERMARK', label: 'Watermarked / Stock Photos', note: 'Photos contain third-party watermarks or stock photo branding.' },
      { id: 'PHOTO_MISLEADING', label: 'Misleading Images', note: 'Photos do not represent actual property premises or unit layouts.' }
    ]
  },
  {
    stepId: 'DOCS',
    category: 'Legal Documents',
    stepNumber: 6,
    icon: FileText,
    reasons: [
      { id: 'DOC_EXPIRED', label: 'Expired Legal Document', note: 'One or more uploaded documents (Mayor\'s Permit, Fire Certificate, etc.) are expired.' },
      { id: 'DOC_BLURRY', label: 'Blurry / Unreadable File', note: 'Uploaded document image is blurry, cropped, or unreadable. Please upload a clear scan.' },
      { id: 'DOC_MISMATCH', label: 'Owner Name Mismatch', note: 'Name on Government ID or Business Permit does not match landlord account details.' },
      { id: 'DOC_MISSING', label: 'Missing Required Document', note: 'Required legal verification document (Mayor\'s Permit or Land Title) is missing.' }
    ]
  },
  {
    stepId: 'GENERAL',
    category: 'Compliance & Safety',
    stepNumber: 7,
    icon: AlertTriangle,
    reasons: [
      { id: 'COMP_DUPLICATE', label: 'Duplicate Property Entry', note: 'This property has already been submitted or published under another entry.' },
      { id: 'COMP_PROHIBITED', label: 'Prohibited Copy', note: 'Listing description contains inappropriate language or prohibited terms.' },
      { id: 'COMP_SAFETY', label: 'Safety Concern', note: 'Property specs raise health, safety, or housing compliance concerns.' }
    ]
  }
];

export function AdminListingRejectModal({
  isOpen,
  onClose,
  onConfirm,
  listingTitle = 'this property',
  isSubmitting = false,
  activeStep,
  uncheckedNotes = []
}: AdminListingRejectModalProps) {
  const isClient = useIsClient();
  const [selectedChipId, setSelectedChipId] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(0);
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);

  // Auto-detect step category index on open & reset feedback note
  React.useEffect(() => {
    if (isOpen) {
      if (activeStep) {
        const foundIdx = PREMADE_REASON_CATEGORIES.findIndex(
          cat => cat.stepId === activeStep || cat.category.toLowerCase().includes(activeStep.toLowerCase())
        );
        if (foundIdx !== -1) {
          setActiveCategoryIdx(foundIdx);
        }
      }
      setCustomNote('');
      setSelectedChipId('');
      setShowAllCategories(false);
    }
  }, [isOpen, activeStep]);

  if (!isOpen || !isClient) return null;

  const handleSelectChip = (chip: { id: string; label: string; note: string }) => {
    if (selectedChipId === chip.id) {
      setSelectedChipId('');
      setCustomNote('');
    } else {
      setSelectedChipId(chip.id);
      setCustomNote(chip.note);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    onConfirm(customNote.trim());
  };

  const activeCategory = PREMADE_REASON_CATEGORIES[activeCategoryIdx] || PREMADE_REASON_CATEGORIES[0];
  const IconComponent = activeCategory.icon;

  return createPortal(
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-rose-500/5 dark:bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 shadow-inner shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Reject Listing Request</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20">Action Required</span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md">
                Provide clear feedback for <span className="text-rose-500 font-black">"{listingTitle}"</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Body */}
        <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Active Step Rejection Header & Focus */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <IconComponent size={18} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 block mb-0.5">
                    Step {activeCategory.stepNumber} Rejection Focus
                  </span>
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                    {activeCategory.category}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer shrink-0"
              >
                {showAllCategories ? 'Focus current step' : 'All categories'}
              </button>
            </div>

            {/* Optional Category Tab Bar (Shown when toggled or no activeStep) */}
            {(showAllCategories || !activeStep) && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-100 dark:border-slate-800 pt-1">
                {PREMADE_REASON_CATEGORIES.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isActive = activeCategoryIdx === idx;
                  return (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setActiveCategoryIdx(idx)}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none",
                        isActive
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800/80 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                      <span>{cat.category}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Premade Chips for Selected Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {activeCategory.reasons.map((chip) => {
                const isSelected = selectedChipId === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleSelectChip(chip)}
                    className={cn(
                      "p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 group cursor-pointer",
                      isSelected
                        ? "border-rose-500 bg-rose-500/10 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-rose-300 dark:hover:border-rose-800"
                    )}
                  >
                    <div>
                      <span className={cn(
                        "text-xs font-black uppercase tracking-wider block",
                        isSelected ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white group-hover:text-rose-500"
                      )}>
                        {chip.label}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {chip.note}
                      </p>
                    </div>

                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      isSelected ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300 dark:border-slate-700"
                    )}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Rejection Notes Box */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <FileText size={12} className="text-rose-500" />
              Admin Feedback Note (Sent to Landlord)
            </label>

            <Textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Specify the exact instructions or reason for rejection so the landlord can correct and resubmit..."
              rows={4}
              required
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-wider"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !customNote.trim()}
              className={cn(
                "rounded-2xl px-8 py-3 text-xs font-black uppercase tracking-wider transition-all gap-2 shadow-lg",
                isSubmitting || !customNote.trim()
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
              )}
            >
              <span>{isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}


