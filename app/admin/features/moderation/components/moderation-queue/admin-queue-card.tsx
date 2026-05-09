import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ChevronRight, Clock, MapPin, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import type { ModerationItem } from '@/app/admin/hooks/use-moderation';

const typeLabels: Record<string, string> = {
  listing: 'Listing',
  review: 'Review',
  hostApplication: 'Profile'
};

const typeColors: Record<string, string> = {
  listing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  review: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  hostApplication: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
};

const bgGradients: Record<string, string> = {
  listing: 'from-blue-500/5',
  review: 'from-amber-500/5',
  hostApplication: 'from-purple-500/5'
};

const icons: Record<string, any> = {
  listing: MapPin,
  review: MessageSquare,
  hostApplication: User
};

interface AdminQueueCardProps {
  item: ModerationItem;
  idx: number;
  viewMode: 'grid' | 'list';
  onInspect: () => void;
  onDecision: (id: string, type: 'listing' | 'review' | 'hostApplication', action: 'approve' | 'reject') => void;
  isDeciding?: boolean;
}

export function AdminQueueCard({
  item,
  idx,
  viewMode,
  onInspect,
  onDecision,
  isDeciding
}: AdminQueueCardProps) {
  const TypeIcon = icons[item.entityType] || ShieldAlert;
  const tColor = typeColors[item.entityType] || typeColors.listing;
  const bgGrad = bgGradients[item.entityType] || bgGradients.listing;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 flex items-center gap-6 hover:shadow-2xl hover:border-indigo-500/20 transition-all duration-500"
      >
        <div className={cn("absolute inset-0 bg-gradient-to-r to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none", bgGrad)} />
        
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md">
          <div className={cn("w-full h-full flex items-center justify-center font-bold text-xl", tColor.replace('text-', 'bg-').replace('/10', '/20'))}>
            <TypeIcon size={24} className="opacity-70" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-black text-gray-900 dark:text-white truncate">{item.title}</h3>
            <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1", tColor)}>
              {typeLabels[item.entityType]}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 truncate flex items-center gap-1">
            <User size={12} /> {item.user.name}
          </p>
        </div>

        <div className="hidden md:block text-right shrink-0 px-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">System Note</p>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 italic truncate max-w-[150px]">
            "{item.description}"
          </p>
        </div>

        <div className="hidden lg:block text-right shrink-0 pl-4 border-l border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</p>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <Clock size={12} /> {format(new Date(item.createdAt), 'MMM d, HH:mm')}
          </p>
        </div>

        <Button
          onClick={onInspect}
          className="shrink-0 h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-500 hover:text-white text-gray-500 transition-all ml-2"
        >
          <ChevronRight size={20} />
        </Button>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/20 transition-all duration-500 flex flex-col"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-b from-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", bgGrad.replace('from-', 'to-'))} />

      {/* Top Banner Area */}
      <div className="h-24 bg-gray-50 dark:bg-gray-800 relative flex justify-end p-4">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <span className={cn("relative z-10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md h-fit", tColor)}>
          {typeLabels[item.entityType]}
        </span>
      </div>

      {/* Avatar Overlap */}
      <div className="px-6 relative -mt-10 mb-2">
        <div className={cn("w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-900 flex items-center justify-center", tColor.replace('text-', 'bg-').replace('/10', '/20'))}>
          <TypeIcon size={32} className="opacity-70" />
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-1 truncate">
          {item.title}
        </h3>
        <p className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-1.5 truncate">
          <User size={14} /> Initiator: {item.user.name}
        </p>

        {/* Note Snippet */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Case Narrative</p>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 italic line-clamp-2">
            "{item.description}"
          </p>
        </div>

        <div className="mt-auto mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl flex justify-between items-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Timestamp</p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Clock size={12} /> {format(new Date(item.createdAt), 'MMM d, HH:mm')}
            </p>
          </div>
        </div>

        <Button
          onClick={onInspect}
          className="w-full mb-6 py-6 h-auto rounded-[1.25rem] bg-gray-900 hover:bg-indigo-600 dark:bg-white dark:text-gray-900 dark:hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          Inspect Record
        </Button>
      </div>
    </motion.div>
  );
}
