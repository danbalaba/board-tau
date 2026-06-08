'use client';

import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/app/admin/components/ui/alert-dialog';
import { IconTrash, IconAlertTriangle } from '@tabler/icons-react';

interface RoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  roleName?: string;
}

export function RoleDeleteDialog({ open, onOpenChange, onConfirm, roleName }: RoleDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8">
        <AlertDialogHeader className="mb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-rose-500/10 rounded-2xl shadow-sm">
              <IconTrash className="w-6 h-6 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Delete Role</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs font-bold text-gray-500 leading-relaxed pl-[3.25rem]">
            Are you sure you want to delete the{' '}
            <span className="font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-widest text-[10px]">"{roleName}"</span>{' '}
            role? This action cannot be undone and will remove all associated permissions from any users currently assigned to this role.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 mt-4 mb-8">
          <IconAlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-rose-600/90 font-black uppercase tracking-widest leading-relaxed">
            Affected users will lose access to all permissions granted by this role immediately.
          </p>
        </div>

        <AlertDialogFooter className="gap-3 sm:gap-0">
          <AlertDialogCancel className="rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent h-12 px-6">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20 transition-all h-12 px-6"
          >
            Delete Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
