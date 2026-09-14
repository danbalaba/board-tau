'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  X, AlertTriangle, ShieldAlert, Check, FileText, Camera, Shield, ArrowRight, User, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { useIsClient } from '@/hooks/useIsClient';

interface AdminApplicationRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  applicantName?: string;
  isSubmitting?: boolean;
  activeStep?: string; // 'PERSONAL' | 'BUSINESS' | 'SELFIE_ID' | 'PERMITS'
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
    stepId: 'PERSONAL',
    category: 'Host Info & Contact',
    stepNumber: 1,
    icon: User,
    reasons: [
      { id: 'HOST_UNVERIFIED', label: 'Host Profile Unverified', note: 'Applicant profile details or phone number could not be verified.' },
      { id: 'PHONE_INVALID', label: 'Invalid Phone Number', note: 'Contact phone number provided is inactive or uncontactable.' },
      { id: 'EMERGENCY_MISSING', label: 'Incomplete Emergency Contact', note: 'Emergency contact information is missing or incomplete.' }
    ]
  },
  {
    stepId: 'BUSINESS',
    category: 'Business Profile',
    stepNumber: 2,
    icon: Building2,
    reasons: [
      { id: 'BUSINESS_NAME_INVALID', label: 'Invalid Business Name', note: 'Registered business name does not match legal documentation.' },
      { id: 'BUSINESS_UNVERIFIABLE', label: 'Unverifiable Business Entity', note: 'Business profile information contains inconsistencies or unverified credentials.' },
      { id: 'DESC_IMPROPER', label: 'Improper Description Copy', note: 'Business description contains prohibited terms or improper formatting.' }
    ]
  },
  {
    stepId: 'SELFIE_ID',
    category: 'Selfie & Government ID',
    stepNumber: 3,
    icon: Camera,
    reasons: [
      { id: 'SELFIE_BLURRY', label: 'Blurry / Dark Selfie Photo', note: 'Selfie photo uploaded is blurry, dark, or unreadable. Please retake a clear photo in good lighting.' },
      { id: 'SELFIE_MISMATCH', label: 'Selfie & ID Face Mismatch', note: 'Selfie photo face does not match the photo on the uploaded Government ID card.' },
      { id: 'ID_BLURRY', label: 'Blurry Government ID Scan', note: 'Government ID card scan is blurry, cropped, or unreadable. Please re-upload a clear image.' },
      { id: 'ID_EXPIRED', label: 'Expired Government ID', note: 'The uploaded Government ID has expired. Please upload a valid, active ID.' },
      { id: 'ID_NAME_MISMATCH', label: 'ID Name Mismatch', note: 'Name on the Government ID card does not match the applicant account name.' }
    ]
  },
  {
    stepId: 'PERMITS',
    category: 'Permits & Compliance',
    stepNumber: 4,
    icon: Shield,
    reasons: [
      { id: 'PERMIT_EXPIRED', label: 'Expired Mayor\'s Business Permit', note: 'Uploaded Mayor\'s Business Permit is expired or invalid. Please upload an active permit.' },
      { id: 'PERMIT_UNREADABLE', label: 'Unreadable Business Permit', note: 'Uploaded Business Permit document is blurry or illegible.' },
      { id: 'FIRE_CERT_EXPIRED', label: 'Expired Fire Safety Clearance', note: 'BFP Fire Safety Inspection certificate is expired, invalid, or unreadable.' },
      { id: 'UTILITY_BILL_MISSING', label: 'Missing Utility Document', note: 'TARELCO electric bill or utility proof of address is missing or unverified.' },
      { id: 'FACADE_INVALID', label: 'Invalid Building Facade Photo', note: 'Property front-view photo is missing or does not show the actual building exterior.' }
    ]
  },
  {
    stepId: 'GENERAL',
    category: 'Compliance & Guidelines',
    stepNumber: 5,
    icon: AlertTriangle,
    reasons: [
      { id: 'COMP_DUPLICATE', label: 'Duplicate Host Application', note: 'A host application for this landlord or business has already been submitted.' },
      { id: 'COMP_SAFETY', label: 'Housing Safety Concern', note: 'Application details raise housing safety or compliance concerns under TAU guidelines.' }
    ]
  }
];

export function AdminApplicationRejectModal({
  isOpen,
  onClose,
  onConfirm,
  applicantName = 'this applicant',
  isSubmitting = false,
  activeStep,
  uncheckedNotes = []
}: AdminApplicationRejectModalProps) {
  const isClient = useIsClient();
  const [selectedChipId, setSelectedChipId] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(0);
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);

  // Auto-detect step category index on open & pre-fill unchecked notes if available
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

      if (uncheckedNotes && uncheckedNotes.length > 0) {
        setCustomNote(uncheckedNotes.join('\n• '));
      } else {
        setCustomNote('');
      }

      setSelectedChipId('');
      setShowAllCategories(false);
    }
  }, [isOpen, activeStep, uncheckedNotes]);

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
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Reject Host Application</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20">Action Required</span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md">
                Provide clear feedback for <span className="text-rose-500 font-black">"{applicantName}"</span>
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

            {/* Category Tab Bar (Shown when toggled or no activeStep) */}
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
              Admin Feedback Note (Sent to Host Applicant)
            </label>

            <Textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Specify the exact instructions or reason for rejection so the applicant can correct and resubmit..."
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
