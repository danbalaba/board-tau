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
import { Trash2, AlertTriangle } from 'lucide-react';

interface RoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  roleName?: string;
}

export function RoleDeleteDialog({ open, onOpenChange, onConfirm, roleName }: RoleDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete the{' '}
            <span className="font-semibold text-foreground">"{roleName}"</span>{' '}
            role? This action cannot be undone and will remove all associated permissions from any users currently assigned to this role.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 my-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive font-medium leading-relaxed">
            Affected users will lose access to all permissions granted by this role immediately.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
