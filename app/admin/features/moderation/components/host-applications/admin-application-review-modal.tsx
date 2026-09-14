'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '@/components/modals/Modal';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import { Button } from '@/app/admin/components/ui/button';
import { 
  User, 
  Building2, 
  Check, 
  X,
  Clock,
  Eye,
  ShieldCheck,
  FileText,
  Camera,
  FileCheck,
  Shield,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Award,
  BadgeCheck,
  AlertCircle,
  Archive,
  RotateCcw,
  MapPin,
  Info,
  ListChecks
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { cn, formatPropertyType, formatPhoneNumber } from '@/lib/utils';
import SafeImage from '@/components/common/SafeImage';
import { AdminApplicationRejectModal } from './admin-application-reject-modal';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });

interface AdminApplicationReviewModalProps {
  application: any | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (id: string, action: 'approve' | 'reject', reason?: string) => void;
  isDeciding?: boolean;
  onRestore?: (application: any) => void;
}

const TAB_ORDER: ('PERSONAL' | 'BUSINESS' | 'SELFIE_ID' | 'PERMITS')[] = [
  'PERSONAL',
  'BUSINESS',
  'SELFIE_ID',
  'PERMITS'
];

export interface StepChecklistItem {
  id: string;
  label: string;
  defaultNote: string;
}

export const STEP_CHECKLISTS: Record<string, { title: string; subtitle: string; items: StepChecklistItem[] }> = {
  PERSONAL: {
    title: '1. Host Identity & Contact Audit',
    subtitle: 'Verify landlord identity, contact numbers and account profile details',
    items: [
      { id: 'host_profile', label: 'Landlord Account & Email Verified', defaultNote: 'Landlord account profile or contact details require verification.' },
      { id: 'full_name', label: 'Official Full Name Legible & Complete', defaultNote: 'Official full name provided is incomplete or unverified.' },
      { id: 'contact_number', label: 'Active Contact Phone Number', defaultNote: 'Contact phone number is inactive or uncontactable.' },
      { id: 'ownership_role', label: 'Property Relationship / Role Validated', defaultNote: 'Property ownership role or title holder proof requires verification.' },
    ]
  },
  BUSINESS: {
    title: '2. Business Profile & Experience Audit',
    subtitle: 'Inspect registered business details, experience and property type',
    items: [
      { id: 'business_name', label: 'Registered Business Name Provided', defaultNote: 'Registered business name is invalid or unverified.' },
      { id: 'business_type', label: 'Accommodation Property Type Clear', defaultNote: 'Property type category requires clarification.' },
      { id: 'experience', label: 'Landlord Hosting Experience Valid', defaultNote: 'Years of hosting experience requires verification.' },
      { id: 'property_location', label: 'Geotagged Location Coordinates Verified', defaultNote: 'Property establishment coordinates or location requires verification.' },
    ]
  },
  SELFIE_ID: {
    title: '3. Biometric Selfie & Government ID Audit',
    subtitle: 'Inspect live facial selfie scan and government ID card authenticity',
    items: [
      { id: 'selfie_photo', label: 'Live Selfie Scan Clear & Unblurred', defaultNote: 'Selfie photo scan is blurry, dark, or unreadable.' },
      { id: 'gov_id', label: 'Government ID Card Clear & Uncropped', defaultNote: 'Government ID image is blurry, cropped, or unreadable.' },
      { id: 'face_match', label: 'Selfie Face Matches Government ID Photo', defaultNote: 'Selfie photo face does not match the photo on the Government ID.' },
      { id: 'name_match', label: 'Name on ID Matches Account Name', defaultNote: 'Name on Government ID does not match applicant account name.' },
    ]
  },
  PERMITS: {
    title: '4. Legal Compliance & Permits Audit',
    subtitle: "Inspect Mayor's Permit or TARELCO Utility Bill, Fire Safety Cert & Building Facade",
    items: [
      { id: 'business_permit', label: "Primary Proof (Mayor's Permit or Utility Bill)", defaultNote: "Primary business permit or utility bill proof is missing or unreadable." },
      { id: 'fire_safety', label: 'Fire Safety Inspection Cert. Active', defaultNote: 'BFP Fire Safety Inspection Certificate is expired or missing.' },
      { id: 'utility_bill', label: 'Property Control / Address Proof Verified', defaultNote: 'Utility bill or proof of address requires verification.' },
      { id: 'facade_photo', label: 'Building Front View Photo Clear', defaultNote: 'Property front view photo is unreflective of actual building premises.' },
    ]
  }
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  approved: 'bg-primary/15 text-primary border border-primary/30',
  rejected: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30',
  archived: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30',
};

export function AdminApplicationReviewModal({
  application,
  isOpen,
  onClose,
  onDecision,
  isDeciding,
  onRestore
}: AdminApplicationReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BUSINESS' | 'SELFIE_ID' | 'PERMITS'>('PERSONAL');
  const [maxUnlockedStepIdx, setMaxUnlockedStepIdx] = useState<number>(0);
  const [confirmedSteps, setConfirmedSteps] = useState<boolean[]>([false, false, false, false]);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [stepChecklistsState, setStepChecklistsState] = useState<Record<string, boolean>>({});

  // Media Preview Lightbox State
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    title: string;
    isDocument?: boolean;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: '',
    isDocument: false
  });

  const prevAppIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && application) {
      setShowRejectConfirm(false);
      setPreviewState(prev => ({ ...prev, isOpen: false }));

      const currentAppId = application.id ? String(application.id) : (application._id ? String(application._id) : null);
      if (prevAppIdRef.current !== currentAppId) {
        prevAppIdRef.current = currentAppId;
        setActiveTab('PERSONAL');
      }

      const statusStr = String(application.status || 'pending').toLowerCase();
      const isArchived = Boolean(application.isAdminArchived || application.isArchived || statusStr === 'archived');
      const isPending = statusStr === 'pending' && !isArchived;

      if (isPending) {
        setMaxUnlockedStepIdx(0);
        setConfirmedSteps([false, false, false, false]);
        setStepChecklistsState({});
      } else {
        setMaxUnlockedStepIdx(3);
        setConfirmedSteps([true, true, true, true]);
        const initialMap: Record<string, boolean> = {};
        Object.keys(STEP_CHECKLISTS).forEach(key => {
          STEP_CHECKLISTS[key].items.forEach(item => {
            initialMap[`${key}_${item.id}`] = true;
          });
        });
        setStepChecklistsState(initialMap);
      }
    }
  }, [isOpen, application]);

  // Current Step Checklist Info
  const currentStepChecklistInfo = STEP_CHECKLISTS[activeTab] || STEP_CHECKLISTS.PERSONAL;
  const currentStepChecklistItems = currentStepChecklistInfo.items;

  const isCurrentStepAllChecked = useMemo(() => {
    if (!application || String(application.status).toLowerCase() !== 'pending') return true;
    return currentStepChecklistItems.every(item => Boolean(stepChecklistsState[`${activeTab}_${item.id}`]));
  }, [application, activeTab, currentStepChecklistItems, stepChecklistsState]);

  const failedChecklistNotes = useMemo(() => {
    const notes: string[] = [];
    currentStepChecklistItems.forEach(item => {
      if (!stepChecklistsState[`${activeTab}_${item.id}`]) {
        notes.push(item.defaultNote);
      }
    });
    return notes;
  }, [currentStepChecklistItems, stepChecklistsState, activeTab]);

  const handleToggleCheckitem = (itemId: string) => {
    if (!application || String(application.status).toLowerCase() !== 'pending') return;
    const key = `${activeTab}_${itemId}`;
    setStepChecklistsState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleConfirmCurrentStep = () => {
    const currentTabIdx = TAB_ORDER.indexOf(activeTab);
    const newConfirmed = [...confirmedSteps];
    newConfirmed[currentTabIdx] = true;
    setConfirmedSteps(newConfirmed);

    if (currentTabIdx < TAB_ORDER.length - 1) {
      const nextIdx = currentTabIdx + 1;
      if (nextIdx > maxUnlockedStepIdx) {
        setMaxUnlockedStepIdx(nextIdx);
      }
      setActiveTab(TAB_ORDER[nextIdx]);
    }
  };

  const handleTabClick = (tabKey: 'PERSONAL' | 'BUSINESS' | 'SELFIE_ID' | 'PERMITS') => {
    const targetIdx = TAB_ORDER.indexOf(tabKey);
    const statusStr = String(application?.status || 'pending').toLowerCase();
    const isArchived = Boolean(application?.isAdminArchived || application?.isArchived || statusStr === 'archived');
    const isPending = statusStr === 'pending' && !isArchived;

    if (!isPending || targetIdx <= maxUnlockedStepIdx) {
      setActiveTab(tabKey);
    }
  };

  const openPreview = (url: string, title: string, isDocument = false) => {
    if (!url) return;
    setPreviewState({
      isOpen: true,
      images: [url],
      currentIndex: 0,
      title,
      isDocument
    });
  };

  const handleOpenPreview = (images: any[], index = 0, title = 'Media Preview', isDocument = false) => {
    const rawList = Array.isArray(images) ? images : [images];
    const validImages = rawList
      .map(item => (typeof item === 'string' ? item : item?.url || item?.src || item?.path || ''))
      .filter(Boolean);

    if (validImages.length === 0) return;

    setPreviewState({
      isOpen: true,
      images: validImages,
      currentIndex: Math.max(0, Math.min(index, validImages.length - 1)),
      title,
      isDocument
    });
  };

  const rawBusiness = application?.businessInfo;
  const rawContact = application?.contactInfo;

  const businessInfo = useMemo(() => {
    if (!rawBusiness) return {};
    if (typeof rawBusiness === 'string') {
      try { return JSON.parse(rawBusiness); } catch { return {}; }
    }
    return rawBusiness;
  }, [rawBusiness]);

  const contactInfo = useMemo(() => {
    if (!rawContact) return {};
    if (typeof rawContact === 'string') {
      try { return JSON.parse(rawContact); } catch { return {}; }
    }
    return rawContact;
  }, [rawContact]);

  const mapCenter: [number, number] = useMemo(() => {
    if (!application) return [15.4822, 120.5963];
    if (Array.isArray(application.latlng) && application.latlng.length === 2 && application.latlng[0] && application.latlng[1]) {
      return [Number(application.latlng[0]), Number(application.latlng[1])];
    }
    if (Array.isArray(application.propertyEvidence?.latlng) && application.propertyEvidence.latlng.length === 2) {
      return [Number(application.propertyEvidence.latlng[0]), Number(application.propertyEvidence.latlng[1])];
    }
    return [15.4822, 120.5963];
  }, [application]);

  if (!application) return null;

  const currentTabIdx = TAB_ORDER.indexOf(activeTab);
  const statusStr = String(application.status || 'pending').toLowerCase();
  const isArchived = Boolean(application.isAdminArchived || application.isArchived || statusStr === 'archived');
  const isPending = statusStr === 'pending' && !isArchived;
  const isApproved = statusStr === 'approved' && !isArchived;
  const isRejected = statusStr === 'rejected' && !isArchived;

  const rawPhone = contactInfo.phoneNumber || contactInfo.phone || contactInfo.contactNumber || application.user?.phoneNumber;
  const displayPhone = formatPhoneNumber(rawPhone);
  const displayFullName = contactInfo.fullName || contactInfo.name || application.user?.name || 'N/A';
  const displayEmail = contactInfo.email || application.user?.email || 'N/A';

  const selfieUrl = application.selfieUrl || application.documents?.selfieUrl;
  const govIdUrl = application.governmentIdUrl || application.idCardUrl || application.documents?.idCardUrl;
  const businessPermitUrl = application.businessPermitUrl || application.documents?.businessPermitUrl;
  const fireSafetyUrl = application.fireSafetyUrl || application.documents?.fireSafetyUrl;
  const additionalDocsUrl = application.additionalDocsUrl || application.documents?.additionalDocsUrl;
  const facadePhotoUrl = application.facadePhotoUrl || application.documents?.facadePhotoUrl;

  const rawYearsExp = businessInfo.yearsExperience || businessInfo.experienceYears || application.yearsExperience;
  const resolveExperienceLabel = (exp: any, isFirstTimeHost?: boolean) => {
    if (!exp && isFirstTimeHost === undefined) return 'Not Specified';
    const val = typeof exp === 'object' ? (exp.value || exp.label || '') : String(exp || '').trim();
    if (!val) {
      if (isFirstTimeHost === true) return 'First Time Host (< 1 Year)';
      if (isFirstTimeHost === false) return 'Experienced Host';
      return 'Not Specified';
    }
    
    const cleanVal = val.toLowerCase();
    if (cleanVal === 'less-than-1' || cleanVal.includes('less') || cleanVal.includes('<')) {
      return 'First Time Host (< 1 Year)';
    }
    if (cleanVal === '1-3-years' || cleanVal.includes('1-3') || cleanVal.includes('1 - 3')) {
      return 'Experienced Host (1 - 3 Years)';
    }
    if (cleanVal === '3-5-years' || cleanVal.includes('3-5') || cleanVal.includes('3 - 5')) {
      return 'Established Host (3 - 5 Years)';
    }
    if (cleanVal === '5-plus-years' || cleanVal.includes('5-plus') || cleanVal.includes('5+')) {
      return 'Veteran Host (5+ Years)';
    }

    const formatted = val.replace(/-/g, ' ').replace(/years/gi, '').trim();
    return formatted ? `${formatted} Years Experience` : 'Not Specified';
  };

  const displayExperience = resolveExperienceLabel(rawYearsExp, businessInfo.isFirstTimeHost);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="full"
      noPadding
    >
      <div className="flex flex-col h-[90vh] max-h-[850px] w-full max-w-[1280px] mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans overflow-hidden rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Top Header Bar */}
        <div className="px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
              {application.user?.image ? (
                <SafeImage src={application.user.image} alt={application.user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-black text-xl">
                  {application.user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{application.user?.name || 'Applicant'}</h3>
                <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border", statusColors[statusStr] || statusColors.pending)}>
                  {statusStr}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <Briefcase size={13} className="text-primary" />
                <span>{businessInfo.businessName || 'Host Application'}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">{contactInfo.email || application.user?.email || 'N/A'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hidden sm:inline">
              Submitted: {format(new Date(application.createdAt || Date.now()), 'MMM d, yyyy')}
            </span>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Audit Step Navigation Pills Bar */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
          {TAB_ORDER.map((tabKey, idx) => {
            const isActive = activeTab === tabKey;
            const isUnlocked = !isPending || idx <= maxUnlockedStepIdx;
            const isConfirmed = confirmedSteps[idx];

            const tabLabels: Record<string, { label: string; icon: any }> = {
              PERSONAL: { label: '1. Host Info', icon: User },
              BUSINESS: { label: '2. Business Profile', icon: Building2 },
              SELFIE_ID: { label: '3. Selfie & ID', icon: Camera },
              PERMITS: { label: '4. Permits & Photos', icon: ShieldCheck }
            };

            const info = tabLabels[tabKey];
            const Icon = info.icon;

            return (
              <button
                key={tabKey}
                disabled={!isUnlocked}
                onClick={() => handleTabClick(tabKey)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer shrink-0 select-none",
                  isActive
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : isConfirmed
                    ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                    : isUnlocked
                    ? "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    : "bg-slate-100 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 border-transparent cursor-not-allowed opacity-50"
                )}
              >
                {isConfirmed ? (
                  <CheckCircle2 size={14} className={cn("shrink-0", isActive ? "text-white" : "text-primary")} />
                ) : (
                  <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                )}
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Inspection Mode Status Notification Banner (Non-Pending & Archived States) */}
        {!isPending && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shrink-0 shadow-inner">
            {isArchived ? (
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                  <Archive size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <span>Archived Application — Inspection Mode</span>
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    This host application is currently archived. All submitted documents and details are available for review below.
                  </p>
                </div>
              </div>
            ) : isApproved ? (
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/15 text-primary rounded-xl border border-primary/30 shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                    Approved Application — Read-Only Mode
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    This host application has been verified and granted host status.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Rejected Application — Read-Only Mode
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {application.rejectionReason ? `Reason: ${application.rejectionReason}` : 'This host application was rejected during verification.'}
                  </p>
                </div>
              </div>
            )}

            {isArchived && onRestore && (
              <Button
                type="button"
                onClick={() => {
                  onRestore?.(application);
                  onClose();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
              >
                <RotateCcw size={14} /> Restore Application
              </Button>
            )}
          </div>
        )}

        {/* Main Audit Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50/40 dark:bg-slate-950/40">
          {/* Left Main Content Viewer */}
          <div className={cn("flex-1 p-6 space-y-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden", isPending && "border-r border-slate-200 dark:border-slate-800/80")}>
            <AnimatePresence mode="wait">
              
              {/* TAB 1: Host Info & Contact */}
              {activeTab === 'PERSONAL' && (
                <motion.div key="PERSONAL" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Host Personal & Contact Details</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify primary contact details and identity information</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Full Name</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{displayFullName}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Contact Phone Number</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Phone size={14} className="text-primary" />
                        {displayPhone}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Email Address</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail size={14} className="text-primary" />
                        {displayEmail}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Property Relationship / Role</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <BadgeCheck size={14} className="text-primary" />
                        {contactInfo.ownershipRole === 'OWNER' ? 'Property Owner (Title Holder)' :
                         contactInfo.ownershipRole === 'CO_OWNER_FAMILY' ? 'Co-Owner / Family Representative' :
                         contactInfo.ownershipRole === 'AUTHORIZED_CARETAKER' ? 'Authorized Manager / Caretaker' :
                         contactInfo.ownershipRole === 'SUBLESSOR' ? 'Master Tenant / Sub-lessor' :
                         (contactInfo.ownershipRole || 'Property Host')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: Business Profile */}
              {activeTab === 'BUSINESS' && (
                <motion.div key="BUSINESS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Business Entity Profile</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Host business registered details and background profile</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 sm:col-span-2 shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Establishment / Business Name</span>
                      <p className="text-base font-black text-slate-900 dark:text-white">{businessInfo.businessName || businessInfo.name || 'N/A'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Landlord Experience</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Award size={14} className="text-amber-500" />
                        {displayExperience}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Property Category / Type</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <BadgeCheck size={14} className="text-primary" />
                        {formatPropertyType(businessInfo.businessType || businessInfo.propertyRole)}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 sm:col-span-2 shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-1.5">
                          <MapPin size={12} className="text-rose-500" /> Geotagged Establishment Location Map
                        </span>
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                          {mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)} • TAU Campus Zone
                        </span>
                      </div>
                      <div className="h-[280px] sm:h-[320px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-inner">
                        <Map
                          center={mapCenter}
                          readonly={true}
                          allowPinDrop={true}
                          title={businessInfo.businessName || businessInfo.name || "Establishment Location"}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: Selfie & Government ID */}
              {activeTab === 'SELFIE_ID' && (
                <motion.div key="SELFIE_ID" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Camera size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Selfie & Government ID Audit</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify live selfie verification photo against uploaded government ID card</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selfie Preview Box */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Identity Selfie</span>
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">Live Photo</span>
                      </div>
                      <div 
                        onClick={() => selfieUrl && handleOpenPreview([selfieUrl], 0, 'Host Live Selfie Photo')}
                        className={cn(
                          "relative w-full h-64 sm:h-72 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group transition-all",
                          selfieUrl ? "cursor-pointer hover:border-primary/50" : "cursor-default"
                        )}
                      >
                        {selfieUrl ? (
                          <>
                            <SafeImage 
                              src={selfieUrl} 
                              alt="Host Live Selfie" 
                              loaderText="Loading Live Selfie..."
                              containerClassName="w-full h-full relative"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white z-20">
                              <Eye size={16} /> Enlarge Photo
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 p-6">
                            <Camera size={36} className="opacity-40" />
                            <span className="text-xs font-bold uppercase tracking-wider">No Selfie Photo Uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Government ID Preview Box */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Government Issued ID</span>
                        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">ID Document</span>
                      </div>
                      <div 
                        onClick={() => govIdUrl && handleOpenPreview([govIdUrl], 0, 'Government Issued ID Card', true)}
                        className={cn(
                          "relative w-full h-64 sm:h-72 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group transition-all",
                          govIdUrl ? "cursor-pointer hover:border-blue-500/50" : "cursor-default"
                        )}
                      >
                        {govIdUrl ? (
                          <>
                            <SafeImage 
                              src={govIdUrl} 
                              alt="Government Issued ID Card" 
                              loaderText="Loading Govt ID..."
                              containerClassName="w-full h-full relative"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white z-20">
                              <Eye size={16} /> Enlarge Document
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 p-6">
                            <FileText size={36} className="opacity-40" />
                            <span className="text-xs font-bold uppercase tracking-wider">No Government ID Uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: Legal Permits & Establishment Photos */}
              {activeTab === 'PERMITS' && (() => {
                const hasPrimaryPermit = Boolean(businessPermitUrl);
                const hasUtilityBill = Boolean(additionalDocsUrl);
                const hasBothPrimary = hasPrimaryPermit && hasUtilityBill;
                const isThreeCards = !hasBothPrimary;

                return (
                  <motion.div key="PERMITS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Legal Permits & Property Documents</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify property building facade, business permits, utility bills and fire safety certificates</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center gap-3 shadow-xs">
                      <Info size={16} className="text-blue-500 shrink-0" />
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                        <strong className="text-blue-600 dark:text-blue-400">Primary Proof Option:</strong> Host applicants can attach either a <strong className="text-slate-900 dark:text-white">Mayor's Business Permit</strong> OR a <strong className="text-slate-900 dark:text-white">TARELCO Utility Bill</strong> to prove property ownership / management control.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* 1. Property Building Facade Photo Card (FIRST - Spans full width when 3 cards present for perfect 2-column balance) */}
                      <div className={cn(
                        "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm flex flex-col transition-all",
                        isThreeCards && "sm:col-span-2"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              <Building2 size={14} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">Property Building Facade Photo</span>
                          </div>
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                            facadePhotoUrl ? "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20" : "text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          )}>
                            {facadePhotoUrl ? "Photo Attached" : "Not Provided"}
                          </span>
                        </div>

                        <div 
                          onClick={() => facadePhotoUrl && handleOpenPreview([facadePhotoUrl], 0, "Property Building Facade / Front View", false)}
                          className={cn(
                            "relative w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group transition-all",
                            isThreeCards ? "h-56 sm:h-64 aspect-[16/9]" : "h-48 sm:h-52 aspect-[4/3]",
                            facadePhotoUrl ? "cursor-pointer hover:border-purple-500/50" : "cursor-default"
                          )}
                        >
                          {facadePhotoUrl ? (
                            <>
                              <SafeImage 
                                src={facadePhotoUrl} 
                                alt="Property Building Facade Photo" 
                                loaderText="Loading Facade..."
                                containerClassName="w-full h-full relative"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                              />
                              <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white z-20">
                                <Eye size={16} /> Enlarge Photo
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 p-4">
                              <Building2 size={36} className="opacity-40" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">No Facade Photo Uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Mayor's / Business Permit Card (Render if businessPermitUrl exists OR if utility bill is also missing) */}
                      {(businessPermitUrl || !additionalDocsUrl) && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm flex flex-col">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <FileText size={14} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">Mayor's / Business Permit</span>
                            </div>
                            <span className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                              businessPermitUrl ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" : "text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            )}>
                              {businessPermitUrl ? "Permit Attached" : "Not Provided"}
                            </span>
                          </div>

                          <div 
                            onClick={() => businessPermitUrl && handleOpenPreview([businessPermitUrl], 0, "Business / Mayor's Permit Document", true)}
                            className={cn(
                              "relative w-full h-48 sm:h-52 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group transition-all",
                              businessPermitUrl ? "cursor-pointer hover:border-blue-500/50" : "cursor-default"
                            )}
                          >
                            {businessPermitUrl ? (
                              <>
                                <SafeImage 
                                  src={businessPermitUrl} 
                                  alt="Mayor's Business Permit" 
                                  loaderText="Loading Business Permit..."
                                  containerClassName="w-full h-full relative"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white z-20">
                                  <Eye size={16} /> Enlarge Document
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 p-4">
                                <FileText size={32} className="opacity-40" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">No Permit Uploaded</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 3. TARELCO Electric / Utility Bill Card (Render ONLY if additionalDocsUrl exists) */}
                      {additionalDocsUrl && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm flex flex-col">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <FileCheck size={14} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">TARELCO Electric / Utility Bill</span>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20">
                              Bill Attached
                            </span>
                          </div>

                          <div 
                            onClick={() => handleOpenPreview([additionalDocsUrl], 0, "TARELCO Electric / Utility Bill", true)}
                            className="relative w-full h-48 sm:h-52 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-amber-500/50 transition-all"
                          >
                            <SafeImage 
                              src={additionalDocsUrl} 
                              alt="TARELCO Electric / Utility Bill" 
                              loaderText="Loading Utility Bill..."
                              containerClassName="w-full h-full relative"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white z-20">
                              <Eye size={16} /> Enlarge Document
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Fire Safety Certificate Card */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                              <ShieldCheck size={14} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">Fire Safety Certificate</span>
                          </div>
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                            fireSafetyUrl ? "text-primary bg-primary/10 border-primary/20" : "text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          )}>
                            {fireSafetyUrl ? "Cert Attached" : "Not Provided"}
                          </span>
                        </div>

                        <div 
                          onClick={() => fireSafetyUrl && handleOpenPreview([fireSafetyUrl], 0, "Fire Safety Inspection Certificate", true)}
                          className={cn(
                            "relative w-full h-48 sm:h-52 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group transition-all",
                            fireSafetyUrl ? "cursor-pointer hover:border-primary/50" : "cursor-default"
                          )}
                        >
                          {fireSafetyUrl ? (
                            <>
                              <SafeImage 
                                src={fireSafetyUrl} 
                                alt="Fire Safety Inspection Certificate" 
                                loaderText="Loading Fire Cert..."
                                containerClassName="w-full h-full relative"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                              />
                              <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white z-20">
                                <Eye size={16} /> Enlarge Document
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 p-4">
                              <ShieldCheck size={32} className="opacity-40" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">No Certificate Uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

            </AnimatePresence>
          </div>

          {/* Right Checklist & Summary Sidebar Panel */}
          {isPending && (
            <div className="w-full md:w-80 lg:w-96 bg-slate-50/60 dark:bg-slate-950/60 p-6 space-y-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 border-l border-slate-200/80 dark:border-slate-800">
              
              {/* Audit Checklist Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <ListChecks size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
                        {currentStepChecklistInfo.title}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 truncate">
                        {currentStepChecklistInfo.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...stepChecklistsState };
                      const allChecked = currentStepChecklistItems.every(i => Boolean(updated[`${activeTab}_${i.id}`]));
                      currentStepChecklistItems.forEach(i => {
                        updated[`${activeTab}_${i.id}`] = !allChecked;
                      });
                      setStepChecklistsState(updated);
                    }}
                    className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {isCurrentStepAllChecked ? 'Uncheck All' : 'Verify All'}
                  </button>
                </div>

                {/* Checklist items */}
                <div className="space-y-2">
                  {currentStepChecklistItems.map(item => {
                    const itemKey = `${activeTab}_${item.id}`;
                    const isChecked = Boolean(stepChecklistsState[itemKey]);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleCheckitem(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer select-none text-left gap-3",
                          isChecked
                            ? "bg-primary/10 dark:bg-primary/15 border-primary/40 text-primary font-black shadow-xs ring-1 ring-primary/20"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                      >
                        <span className="leading-snug">{item.label}</span>
                        <div className={cn(
                          "w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 shadow-xs",
                          isChecked ? "bg-primary text-white border-primary shadow-primary/20" : "border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50"
                        )}>
                          {isChecked && <Check size={13} strokeWidth={3} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Section Audit Status Bar */}
                <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span>Section Audit Status</span>
                  <span className={cn("font-black uppercase", isCurrentStepAllChecked ? "text-primary" : "text-amber-500")}>
                    {currentStepChecklistItems.filter(i => stepChecklistsState[`${activeTab}_${i.id}`]).length} / {currentStepChecklistItems.length} Verified
                  </span>
                </div>
              </div>

              {/* Host Application Summary Stats Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" /> Application Summary Stats
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Identity Selfie</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{selfieUrl ? 'Attached' : 'Missing'}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Govt. ID Card</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{govIdUrl ? 'Attached' : 'Missing'}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Primary Proof</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {businessPermitUrl ? "Mayor's Permit" : additionalDocsUrl ? "Utility Bill" : "Missing"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Submitted On</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {application.createdAt ? format(new Date(application.createdAt), 'MMM d, yyyy') : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Sticky Moderation Bottom Footer Bar */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative z-30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left side: Back Section & Audit Status Indicator */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {currentTabIdx > 0 && isPending && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (currentTabIdx > 0) setActiveTab(TAB_ORDER[currentTabIdx - 1]);
                  }}
                  className="h-11 px-5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft size={16} /> Back Section
                </Button>
              )}

              {isPending && (
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Clock size={16} className={cn("shrink-0", isCurrentStepAllChecked ? "text-primary" : "text-amber-500 animate-pulse")} />
                  <span>
                    Section {currentTabIdx + 1} of 4 • {isCurrentStepAllChecked ? "Section audit verified! Click next." : `Verify all audit items (${currentStepChecklistItems.filter(i => stepChecklistsState[`${activeTab}_${i.id}`]).length}/${currentStepChecklistItems.length}) to proceed`}
                  </span>
                </div>
              )}
            </div>

            {/* Right side: Action Controls (Reject, Confirm & Next Section, Approve Host) */}
            {isPending ? (
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectConfirm(true)}
                  disabled={isDeciding}
                  className="flex-1 sm:flex-none h-11 px-5 text-xs font-black uppercase tracking-wider text-rose-500 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <X size={16} /> Reject Host
                </Button>

                {currentTabIdx < TAB_ORDER.length - 1 ? (
                  <Button 
                    type="button"
                    onClick={handleConfirmCurrentStep}
                    disabled={isDeciding || !isCurrentStepAllChecked}
                    className={cn(
                      "flex-1 sm:flex-none h-11 px-7 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                      isCurrentStepAllChecked
                        ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 cursor-pointer"
                        : "bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-300/60 dark:border-slate-700/60 cursor-not-allowed shadow-none"
                    )}
                  >
                    <span>Confirm & Next Section</span>
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={() => onDecision(application.id, 'approve')}
                    disabled={isDeciding || !confirmedSteps.every(Boolean)}
                    className={cn(
                      "flex-1 sm:flex-none h-11 px-8 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                      confirmedSteps.every(Boolean)
                        ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 cursor-pointer"
                        : "bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-300/60 dark:border-slate-700/60 cursor-not-allowed shadow-none"
                    )}
                  >
                    <Check size={16} /> Approve Host
                  </Button>
                )}
              </div>
            ) : isArchived ? (
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
                  <Archive size={14} /> Status: Archived
                </div>
                <div className="flex items-center gap-2">
                  {onRestore && (
                    <Button
                      type="button"
                      onClick={() => {
                        onRestore?.(application);
                        onClose();
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <RotateCcw size={14} /> Restore Application
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className="rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Close Inspection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 w-full">
                <div className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border",
                  isApproved ? "bg-primary/10 text-primary border-primary/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                )}>
                  {isApproved ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                  <span>Status: {statusStr}</span>
                </div>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close Inspection
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <AdminApplicationRejectModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={(reason) => {
          setShowRejectConfirm(false);
          onDecision(application.id, 'reject', reason);
        }}
        applicantName={application.user?.name || 'Applicant'}
        activeStep={activeTab}
        uncheckedNotes={failedChecklistNotes}
      />

      {/* Lightbox Image Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState(prev => ({ ...prev, isOpen: false }))}
        images={previewState.images}
        currentIndex={previewState.currentIndex}
        title={previewState.title}
        isDocument={previewState.isDocument}
      />
    </Modal>
  );
}
