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
  onDecision: (id: string, type: string, action: 'approve' | 'reject') => void;
  isDeciding: boolean;
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

export function DecisionTable({ items, onInspect, onDecision, isDeciding }: DecisionTableProps) {
  return (
    <div className="rounded-[40px] border border-border/40 bg-card/20 backdrop-blur-3xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40 p-10">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] py-8 px-10">Type & Asset</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] py-8">Initiator Profile</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] py-8">Submission Notes</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] py-8">Timestamp</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-[0.25em] py-8 text-right pr-8">Governance Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground/50 font-bold italic tracking-widest uppercase text-[10px]">
                  All governance systems are clear. Zero backlog.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <motion.tr
                  layout
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="group border-b border-border/40 hover:bg-primary/[0.02] transition-colors"
                >
                  <TableCell className="py-6 px-10">
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-[0.2em] w-fit", typeColors[item.entityType])}>
                        {typeLabels[item.entityType]}
                      </Badge>
                      <span className="font-black text-sm tracking-tighter uppercase whitespace-nowrap">{item.title}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-muted/40 flex items-center justify-center text-[10px] font-black italic shadow-inner border border-border/40">
                        {item.user.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black tracking-tight">{item.user.name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground/40 italic uppercase tracking-widest">{item.user.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-6 max-w-xs">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium italic text-foreground/70 leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                        "{item.description}"
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
                      <Clock className="w-3 h-3 text-primary" />
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>

                  <TableCell className="py-6 pr-8 text-right">
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform duration-300">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 px-4 group/btn rounded-2xl bg-card border border-border/40 hover:bg-primary hover:text-white hover:border-primary transition-all"
                        onClick={() => onInspect(item)}
                      >
                        <Search className="h-4 w-4 mr-2 text-primary group-hover/btn:scale-110 group-hover:text-white transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Inspect</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 px-4 group/btn rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        disabled={isDeciding}
                        onClick={() => onDecision(item.id, item.entityType, 'approve')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-500 group-hover/btn:scale-110 group-hover:text-white transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Authorize</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 px-4 group/btn rounded-2xl border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        disabled={isDeciding}
                        onClick={() => onDecision(item.id, item.entityType, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-2 text-rose-500 group-hover/btn:scale-110 group-hover:text-white transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Reject</span>
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
