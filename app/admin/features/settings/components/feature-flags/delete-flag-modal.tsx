import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/admin/components/ui/dialog';
import { Button } from '@/app/admin/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { FlagData } from './flag-card';

interface DeleteFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  flag: FlagData | null;
}

export function DeleteFlagModal({ isOpen, onClose, onConfirm, flag }: DeleteFlagModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-7 pb-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">Delete Feature Flag</DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">This action cannot be undone.</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="p-7 pt-2">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Are you sure you want to permanently remove <strong className="text-slate-900 dark:text-slate-100 font-bold">{flag?.name}</strong>? This will remove all configurations associated with this toggle.
              </p>
            </div>
            
            <DialogFooter className="p-7 pt-0 sm:justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-5">
              <Button variant="ghost" onClick={onClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                Cancel
              </Button>
              <Button onClick={onConfirm} className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest shadow-lg bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/20 text-white gap-2 cursor-pointer">
                <Trash2 className="w-4 h-4" /> Delete Feature
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
