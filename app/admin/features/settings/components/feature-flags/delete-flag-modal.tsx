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
          <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] shadow-2xl">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Delete Feature</DialogTitle>
                  <DialogDescription className="text-xs font-medium text-gray-500 mt-1">This action cannot be undone.</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="p-6 pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                Are you absolutely sure you want to permanently delete the feature <strong className="text-gray-900 dark:text-white">{flag?.name}</strong>? This will remove all configurations associated with this toggle.
              </p>
            </div>
            
            <DialogFooter className="p-6 pt-0 sm:justify-end gap-3">
              <Button variant="ghost" onClick={onClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                Cancel
              </Button>
              <Button onClick={onConfirm} className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-lg bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/20 text-white gap-2">
                <Trash2 className="w-4 h-4" /> Delete Feature
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
