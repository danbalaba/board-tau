import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Shield, ChevronRight, Briefcase, Archive, Trash2, RotateCcw, CheckCircle2, XCircle, Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import SafeImage from '@/components/common/SafeImage';

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10 border border-amber-500/20', icon: Clock },
  approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border border-emerald-500/20', icon: CheckCircle2 },
  rejected: { color: 'text-rose-500', bg: 'bg-rose-500/10 border border-rose-500/20', icon: XCircle },
  archived: { color: 'text-gray-500', bg: 'bg-gray-500/10 border border-gray-500/20', icon: Archive },
};

interface AdminApplicationCardProps {
  application: any;
  idx: number;
  viewMode: 'grid' | 'list';
  onViewDetails: () => void;
  handleDecision: (id: string, action: 'approve' | 'reject') => void;
  onArchive?: (application: any) => void;
  onDelete?: (app: any) => void;
  isDeciding?: boolean;
  isArchived?: boolean;
  isSuperAdmin?: boolean;
  isDeleting?: boolean;
}

export function AdminApplicationCard({
  application,
  idx,
  viewMode,
  onViewDetails,
  handleDecision,
  onArchive,
  onDelete,
  isDeciding,
  isArchived,
  isSuperAdmin,
  isDeleting
}: AdminApplicationCardProps) {
  const actualStatus = isArchived ? 'archived' : application.status;
  const config = statusConfig[actualStatus] || statusConfig.pending;
  const StatusIcon = config.icon;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 flex items-center gap-6 hover:shadow-2xl hover:border-violet-500/20 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/15 dark:from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md">
          {application.user?.image ? (
            <SafeImage src={application.user.image} alt={application.user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {application.user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-black text-gray-900 dark:text-white truncate">{application.user?.name}</h3>
            <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1", config.bg, config.color)}>
              <StatusIcon size={10} /> {actualStatus}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 truncate flex items-center gap-1">
            <Briefcase size={12} /> {application.businessInfo?.businessName || 'No Business Name'}
          </p>
        </div>

        <div className="hidden md:block text-right shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Submitted</p>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {format(new Date(application.createdAt), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {isArchived ? (
            isSuperAdmin && onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(application); }}
                disabled={isDeleting}
                className="group/btn h-10 w-10 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 transition-all shrink-0"
                title="Delete Permanently"
              >
                <Trash2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
              </Button>
            )
          ) : (
            onArchive && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onArchive(application); }}
                disabled={isDeciding}
                className="group/btn h-10 w-10 rounded-xl border-amber-100 text-amber-500 hover:bg-amber-50 dark:border-amber-900/30 transition-all shrink-0"
                title="Archive"
              >
                <Archive size={16} className="group-hover/btn:scale-110 transition-transform" />
              </Button>
            )
          )}

          <Button
            onClick={onViewDetails}
            className="shrink-0 h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-violet-500 hover:text-white text-gray-500 transition-all"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-violet-500/20 dark:hover:shadow-violet-500/10 hover:border-violet-500/20 transition-all duration-500 flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-500/15 dark:to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="h-24 bg-gray-50 dark:bg-gray-800 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <span className={cn("absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md z-10", config.bg, config.color)}>
          <StatusIcon size={12} /> {actualStatus}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onArchive?.(application); }}
          disabled={isDeciding}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-sm text-gray-400 hover:text-violet-600 hover:bg-white dark:hover:bg-gray-900 transition-all border border-gray-100 dark:border-gray-800"
          title="Archive"
        >
          <Archive size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Avatar Overlap */}
      <div className="px-6 relative -mt-10 mb-2">
        <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-900 bg-white">
          {application.user?.image ? (
            <SafeImage src={application.user.image} alt={application.user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
              {application.user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-1 truncate">
          {application.user?.name}
        </h3>
        <p className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-1.5 truncate">
          <Briefcase size={14} /> {application.businessInfo?.businessName || 'Independent Landlord'}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-auto mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Submitted</p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {format(new Date(application.createdAt), 'MMM d')}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Experience</p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
              {application.businessInfo?.yearsExperience || '0'} Years
            </p>
          </div>
        </div>

        {application.status === 'pending' ? (
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex gap-2">
              <Button
                onClick={() => handleDecision(application.id, "approve")}
                disabled={isDeciding}
                className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  Approve
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDecision(application.id, "reject")}
                disabled={isDeciding}
                className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:text-rose-400 dark:border-rose-900/30 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <XCircle size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  Reject
                </span>
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={onViewDetails}
              className="w-full py-5 h-auto rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border-gray-200 dark:border-gray-800 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 hover:border-violet-200 dark:hover:border-violet-500/30"
            >
              <span className="flex items-center justify-center gap-2">
                <Eye size={14} />
                Details
              </span>
            </Button>
          </div>
        ) : isArchived ? (
          <div className="flex flex-col gap-2 mb-6 mt-auto">
            <Button
              onClick={onViewDetails}
              className="w-full py-6 h-auto rounded-[1.25rem] bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <ChevronRight size={16} />
                View Application
              </span>
            </Button>
            {isSuperAdmin && onDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(application)}
                disabled={isDeleting}
                className="group/btn w-full py-5 h-auto rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <span className="flex items-center justify-center gap-2">
                  <Trash2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                  Delete Permanently
                </span>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2 mb-6 mt-auto">
            <Button
              onClick={onViewDetails}
              className="flex-1 py-6 h-auto rounded-[1.25rem] bg-violet-500 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-violet-500/20"
            >
              <span className="flex items-center justify-center gap-2">
                <ChevronRight size={16} />
                View
              </span>
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
