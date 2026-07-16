// app/admin/features/moderation/components/moderation-queue/decision-table.tsx
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Eye, CheckCircle, XCircle, Clock, LayoutGrid, User, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ModerationItem } from '@/app/admin/hooks/use-moderation';

interface DecisionTableProps {
  items: ModerationItem[];
  onInspect: (item: ModerationItem) => void;
  onDecision: (id: string, type: 'listing' | 'review' | 'hostApplication', action: 'approve' | 'reject') => void;
  isDeciding: boolean;
  isLoading?: boolean;
}

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

export function DecisionTable({ items, onInspect, onDecision, isDeciding, isLoading }: DecisionTableProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-gray-100/50 dark:bg-gray-800/50">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-500 dark:text-gray-400 py-6 px-6 first:rounded-l-3xl">Item Type</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-500 dark:text-gray-400 py-6">Submitted By</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-500 dark:text-gray-400 py-6">Details</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-500 dark:text-gray-400 py-6">Date</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-500 dark:text-gray-400 py-6 text-right pr-6 last:rounded-r-3xl">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/50">Fetching Pending Items...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  Inbox is completely clear.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <motion.tr
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-300"
                >
                  <TableCell className="py-6 px-6">
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-[0.2em] w-fit", typeColors[item.entityType])}>
                        {typeLabels[item.entityType]}
                      </Badge>
                      <span className="font-black text-sm text-gray-900 dark:text-white tracking-tighter uppercase whitespace-nowrap">{item.title}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-black text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        {item.user.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 dark:text-white tracking-tight">{item.user.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px]">{item.user.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-6 max-w-xs">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                      {item.description}
                    </p>
                  </TableCell>

                  <TableCell className="py-6">
                    <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </TableCell>

                  <TableCell className="py-6 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-500 transition-all shadow-sm"
                        onClick={() => onInspect(item)}
                        title="View Details"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500 transition-all shadow-sm"
                        disabled={isDeciding}
                        onClick={() => onDecision(item.id, item.entityType, 'approve')}
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-all shadow-sm"
                        disabled={isDeciding}
                        onClick={() => onDecision(item.id, item.entityType, 'reject')}
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
