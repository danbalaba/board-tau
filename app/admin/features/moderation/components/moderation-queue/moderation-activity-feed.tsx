import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink, CheckCircle, XCircle, Search, AlertTriangle, User } from 'lucide-react';
import { IconFilter, IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Badge } from '@/app/admin/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import type { ModerationItem, ModerationLogItem } from '@/app/admin/hooks/use-moderation';

interface ModerationActivityFeedProps {
  pendingItems: ModerationItem[];
  recentLogs: ModerationLogItem[];
  isLoading: boolean;
}

const typeLabels: Record<string, string> = {
  listing: 'Listing',
  review: 'Review',
  hostApplication: 'Host Application'
};

const typeColors: Record<string, string> = {
  listing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  review: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  hostApplication: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
};

export function ModerationActivityFeed({ pendingItems, recentLogs, isLoading }: ModerationActivityFeedProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>('all');

  // Combine pending items and recent logs into a single feed
  const feedItems = [
    ...pendingItems.map(item => ({ ...item, isLog: false })),
    ...recentLogs.map(log => ({ ...log, isLog: true }))
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredFeedItems = feedItems.filter(item => filterType === 'all' || item.entityType === filterType);

  const handleRedirect = (entityType: string) => {
    switch (entityType) {
      case 'hostApplication':
        router.push('/admin/moderation/host-applications');
        break;
      case 'listing':
        router.push('/admin/moderation/listings');
        break;
      case 'review':
        router.push('/admin/moderation/reviews');
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800/50 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Activity Feed
        </h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-500 transition-all shadow-sm">
              <IconFilter size={14} className={filterType !== 'all' ? "text-indigo-500" : ""} />
              <span>
                {filterType === 'all' ? 'All Types' : 
                 filterType === 'listing' ? 'Listings' : 
                 filterType === 'hostApplication' ? 'Profiles' : 
                 'Reviews'}
              </span>
              <IconChevronDown size={14} className="opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-xl">
            <DropdownMenuItem onClick={() => setFilterType('all')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('listing')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
              Listings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('hostApplication')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
              Host Profiles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('review')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
              Reviews
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/50">Loading Feed...</span>
          </div>
        ) : filteredFeedItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12 opacity-50">
            <Search className="w-12 h-12 text-gray-400" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No Recent Activity</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredFeedItems.map((item: any, index) => (
              <motion.div
                key={`${item.isLog ? 'log' : 'pending'}-${item.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-300 relative group cursor-pointer hover:shadow-md",
                  item.isLog
                    ? "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800"
                    : "bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-500/50 shadow-sm"
                )}
                onClick={() => handleRedirect(item.entityType)}
              >

                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-1">
                    {item.isLog ? (
                      item.action === 'approved' ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5", typeColors[item.entityType])}>
                            {typeLabels[item.entityType]}
                          </Badge>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">
                          {item.isLog ? item.entityTitle || 'Unknown Item' : item.title}
                        </h3>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      {item.isLog ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <User className="w-3.5 h-3.5" />
                          <span>
                            <strong className={item.action === 'approved' ? 'text-emerald-500' : 'text-rose-500'}>
                              {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                            </strong> by {item.admin?.name || 'Admin'}
                            {item.notes && <span className="italic block mt-1 text-[11px]">"{item.notes}"</span>}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
