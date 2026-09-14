// app/admin/features/moderation/components/host-applications/admin-application-card.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconCalendarEvent, 
  IconEye 
} from '@tabler/icons-react';
import { 
  ArchiveRestore, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  FileCheck, 
  ShieldCheck, 
  Briefcase, 
  User,
  ChevronRight,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import SafeImage from '@/components/common/SafeImage';

interface AdminApplicationCardProps {
  application: any;
  idx: number;
  viewMode: 'grid' | 'list';
  onViewDetails: () => void;
  handleDecision?: (id: string, action: 'approve' | 'reject') => void;
  onRejectModalOpen?: (application: any) => void;
  onArchive?: (application: any) => void;
  onDelete?: (app: any) => void;
  isDeciding?: boolean;
  isArchived?: boolean;
  isSuperAdmin?: boolean;
  isDeleting?: boolean;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  pending: { color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border border-amber-500/20', icon: Clock },
  approved: { color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20', icon: CheckCircle2 },
  rejected: { color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 border border-rose-500/20', icon: XCircle },
  archived: { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10 border border-slate-500/20', icon: ArchiveRestore },
};

export function AdminApplicationCard({
  application,
  idx,
  viewMode,
  onViewDetails,
  onArchive,
  onDelete,
  isDeciding,
  isArchived,
  isSuperAdmin,
  isDeleting
}: AdminApplicationCardProps) {
  if (!application) return null;

  const isItemArchived = Boolean(isArchived || application.isAdminArchived);
  const rawStatus = String(application.status || 'pending').toLowerCase();
  const rawConfig = statusConfig[rawStatus] || statusConfig.pending;
  const RawStatusIcon = rawConfig.icon;
  const archiveConfig = statusConfig.archived;

  const applicantName = application.user?.name || application.contactInfo?.fullName || 'Applicant Host';
  const businessName = application.businessInfo?.businessName || 'Host Application';
  const selfieUrl = application.selfieUrl || application.documents?.selfieUrl;
  const idCardUrl = application.idCardUrl || application.documents?.idCardUrl;
  const businessPermitUrl = application.businessPermitUrl || application.documents?.businessPermitUrl;
  const fireSafetyUrl = application.fireSafetyUrl || application.documents?.fireSafetyUrl;
  const additionalDocsUrl = application.additionalDocsUrl || application.documents?.additionalDocsUrl;
  const avatarUrl = application.user?.image || selfieUrl;
  
  const hasSelfieAndID = Boolean(selfieUrl && idCardUrl);
  const hasBusinessPermit = Boolean(businessPermitUrl);
  const hasUtilityBill = Boolean(additionalDocsUrl);
  const hasFireSafety = Boolean(fireSafetyUrl);

  const rawYearsExp = application.businessInfo?.yearsExperience || 
    application.yearsExperience || 
    application.contactInfo?.yearsExperience || 
    (typeof application.businessInfo === 'object' ? application.businessInfo?.hostingExperience : null);

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

  const experienceLabel = resolveExperienceLabel(rawYearsExp, application.businessInfo?.isFirstTimeHost);
  const submittedDate = application.createdAt ? format(new Date(application.createdAt), 'MMM d, yyyy') : 'N/A';
  const userEmail = application.contactInfo?.email || application.user?.email || '';

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.04 }}
        className="group relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2rem] border border-gray-100 dark:border-gray-800 p-3 sm:p-5 hover:shadow-xl transition-all duration-300 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
          {/* Left Thumbnail & Info */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
            {/* Avatar Box */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-primary/10 border border-gray-100 dark:border-gray-800">
              {avatarUrl ? (
                <SafeImage
                  src={avatarUrl}
                  alt={applicantName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-black text-2xl">
                  {applicantName.charAt(0)}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate tracking-tight">
                  {applicantName}
                </h3>
                {isItemArchived && (
                  <span className={cn(
                    "flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-sm border",
                    archiveConfig.bg, archiveConfig.color
                  )}>
                    <ArchiveRestore size={10} strokeWidth={2.5} />
                    archived
                  </span>
                )}
                <span className={cn(
                  "flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-sm border",
                  rawConfig.bg, rawConfig.color
                )}>
                  <RawStatusIcon size={10} strokeWidth={2.5} />
                  {rawStatus}
                </span>
              </div>

              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
                <Briefcase size={13} className="text-primary shrink-0" />
                <span className="truncate">{businessName}</span>
                {userEmail && <span className="text-gray-400 font-normal truncate">• {userEmail}</span>}
              </p>

              {/* Verification Pills */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border",
                  hasSelfieAndID ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700"
                )}>
                  <Camera size={9} /> Selfie & ID
                </span>

                {hasBusinessPermit ? (
                  <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    <FileCheck size={9} /> Mayor's Permit
                  </span>
                ) : hasUtilityBill ? (
                  <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                    <FileCheck size={9} /> Utility Bill
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700">
                    <FileCheck size={9} /> Mayor's Permit
                  </span>
                )}

                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border",
                  hasFireSafety ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700"
                )}>
                  <ShieldCheck size={9} /> Fire Cert
                </span>
              </div>
            </div>
          </div>

          {/* Experience & Submission Metadata */}
          <div className="hidden md:block text-right shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Experience / Submitted</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              <span className="text-primary font-black">{experienceLabel}</span> • {submittedDate}
            </p>
          </div>

          {/* Action Column */}
          <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 sm:pl-5">
            {isItemArchived ? (
              <>
                <Button
                  onClick={onViewDetails}
                  className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconEye size={13} />
                    Details
                  </span>
                </Button>

                {onArchive && (
                  <Button
                    onClick={() => onArchive(application)}
                    disabled={isDeciding}
                    className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto text-[10px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 dark:border-amber-900/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <ArchiveRestore size={13} />
                      Restore
                    </span>
                  </Button>
                )}

                {isSuperAdmin && onDelete && (
                  <Button
                    onClick={() => onDelete(application)}
                    disabled={isDeleting}
                    className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto text-[10px] font-black uppercase tracking-widest bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 dark:border-rose-900/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Trash2 size={13} />
                      Delete
                    </span>
                  </Button>
                )}
              </>
            ) : rawStatus === 'pending' ? (
              <Button
                onClick={onViewDetails}
                className="w-full sm:w-48 rounded-xl py-3 h-auto text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconEye size={15} />
                  Review & Audit
                </span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={onViewDetails}
                  className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconEye size={13} />
                    Details
                  </span>
                </Button>

                {onArchive && (
                  <Button
                    onClick={() => onArchive(application)}
                    disabled={isDeciding}
                    className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto text-[10px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 dark:border-amber-900/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <ArchiveRestore size={13} />
                      {application.isAdminArchived ? 'Restore' : 'Archive'}
                    </span>
                  </Button>
                )}

                {isSuperAdmin && onDelete && (
                  <Button
                    onClick={() => onDelete(application)}
                    disabled={isDeleting}
                    className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto text-[10px] font-black uppercase tracking-widest bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 dark:border-rose-900/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Trash2 size={13} />
                      Delete
                    </span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View (Default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/20 dark:hover:shadow-primary/10 hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Decorative Top Banner */}
      <div className="h-24 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800/80 dark:via-gray-800 dark:to-gray-800/80 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        
        {/* Status Badges — top left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 flex-wrap max-w-[calc(100%-4rem)]">
          {isItemArchived && (
            <span className={cn(
              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md border",
              archiveConfig.bg, archiveConfig.color
            )}>
              <ArchiveRestore size={12} strokeWidth={2.5} />
              archived
            </span>
          )}
          <span className={cn(
            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md border",
            rawConfig.bg, rawConfig.color
          )}>
            <RawStatusIcon size={12} strokeWidth={2.5} />
            {rawStatus}
          </span>
        </div>

        {/* Archive / Restore Button — top right */}
        {onArchive && (
          <button
            onClick={(e) => { e.stopPropagation(); onArchive(application); }}
            disabled={isDeciding}
            className={cn(
              "absolute top-4 right-4 z-10 p-2 rounded-xl backdrop-blur shadow-sm transition-all border cursor-pointer",
              isItemArchived
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white border-amber-500/30"
                : "bg-white/80 dark:bg-gray-900/80 text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-900 border-gray-100 dark:border-gray-800"
            )}
            title={isItemArchived ? 'Restore Application' : 'Archive Application'}
          >
            <ArchiveRestore size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Overlapping Avatar Image Box */}
      <div className="px-6 relative -mt-10 mb-3">
        <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shrink-0">
          {avatarUrl ? (
            <SafeImage src={avatarUrl} alt={applicantName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">
              {applicantName.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="px-6 pb-6 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-1 truncate">
          {applicantName}
        </h3>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1.5 truncate">
          <Briefcase size={14} className="text-primary shrink-0" />
          <span className="truncate">{businessName}</span>
        </p>

        {/* Document Verification Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          <span className={cn(
            "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border transition-colors",
            hasSelfieAndID 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700"
          )}>
            <Camera size={10} /> Selfie & ID
          </span>

          {hasBusinessPermit ? (
            <span className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 transition-colors">
              <FileCheck size={10} /> Mayor's Permit
            </span>
          ) : hasUtilityBill ? (
            <span className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 transition-colors">
              <FileCheck size={10} /> Utility Bill
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 transition-colors">
              <FileCheck size={10} /> Mayor's Permit
            </span>
          )}

          <span className={cn(
            "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border transition-colors",
            hasFireSafety 
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700"
          )}>
            <ShieldCheck size={10} /> Fire Cert
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-6 mt-auto">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Submitted</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {submittedDate}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Experience</p>
            <p className="text-xs font-bold text-primary truncate">
              {experienceLabel}
            </p>
          </div>
        </div>

        {/* Action Button at Bottom */}
        <div className="pt-2">
          {isItemArchived ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={onViewDetails}
                  className="flex-1 py-2.5 h-auto rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconEye size={14} />
                    Details
                  </span>
                </Button>
                {onArchive && (
                  <Button
                    onClick={() => onArchive(application)}
                    disabled={isDeciding}
                    className="flex-1 py-2.5 h-auto rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 dark:border-amber-900/30 active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <ArchiveRestore size={14} />
                      Restore
                    </span>
                  </Button>
                )}
              </div>
              {isSuperAdmin && onDelete && (
                <Button
                  onClick={() => onDelete(application)}
                  disabled={isDeleting}
                  className="group/btn w-full py-2.5 h-auto rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 dark:border-rose-900/30 active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Trash2 size={14} className="group-hover/btn:rotate-12 transition-transform" />
                    Delete Permanently
                  </span>
                </Button>
              )}
            </div>
          ) : rawStatus === 'pending' ? (
            <Button
              onClick={onViewDetails}
              className="w-full py-3.5 h-auto rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <IconEye size={15} />
                Review & Audit Application
              </span>
            </Button>
          ) : (
            <Button
              onClick={onViewDetails}
              className="w-full py-3.5 h-auto rounded-xl bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-[0.98] cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <IconEye size={15} />
                Application Details
              </span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
