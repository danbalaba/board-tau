import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Shield, ChevronRight, Briefcase, Archive, Trash2, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import SafeImage from '@/components/common/SafeImage';

const statusConfig: Record<string, { color: string; icon: any; bg: string }> = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: ShieldAlert },
  approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: ShieldCheck },
  rejected: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: Shield },
};

interface AdminApplicationCardProps {
  application: any;
  idx: number;
  viewMode: 'grid' | 'list';
  onViewDetails: () => void;
  handleDecision: (id: string, action: 'approve' | 'reject') => void;
  onArchive: (id: string, isArchived: boolean) => void;
  onDelete: (app: any) => void;
  isDeciding?: boolean;
}

export function AdminApplicationCard({
  application,
  idx,
  viewMode,
  onViewDetails,
  handleDecision,
  onArchive,
  onDelete,
  isDeciding
}: AdminApplicationCardProps) {
  const config = statusConfig[application.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 flex items-center gap-6 hover:shadow-2xl hover:border-primary/20 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none" />
        
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
              <StatusIcon size={10} /> {application.status}
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => onArchive(application.id, application.isArchived)}
            className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-amber-500 transition-all"
            title={application.isArchived ? "Restore" : "Archive"}
          >
            {application.isArchived ? <RotateCcw size={18} /> : <Archive size={18} />}
          </button>

          {application.isArchived && (
            <button
              onClick={() => onDelete(application)}
              className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
              title="Permanently Delete"
            >
              <Trash2 size={18} />
            </button>
          )}

          <Button
            onClick={onViewDetails}
            className="shrink-0 h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-primary hover:text-white text-gray-500 transition-all"
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
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Banner Area */}
      <div className="h-24 bg-gray-50 dark:bg-gray-800 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <span className={cn("absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md", config.bg, config.color)}>
          <StatusIcon size={12} /> {application.status}
        </span>
        
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={() => onArchive(application.id, application.isArchived)}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-400 hover:text-amber-500 transition-all shadow-sm"
          >
             {application.isArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
          </button>
          {application.isArchived && (
            <button
              onClick={() => onDelete(application)}
              className="p-2.5 rounded-xl bg-rose-500/10 backdrop-blur-md text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
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

        <Button
          onClick={onViewDetails}
          className="w-full mb-6 py-6 h-auto rounded-[1.25rem] bg-gray-900 hover:bg-primary dark:bg-white dark:text-gray-900 dark:hover:bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          Inspect Identity
        </Button>
      </div>
    </motion.div>
  );
}
