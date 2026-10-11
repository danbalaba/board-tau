'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/app/admin/components/ui/alert-dialog';
import { IconDots, IconEye, IconEdit, IconTrash, IconShieldLock, IconAlertTriangle } from '@tabler/icons-react';
import { User } from './columns';
import { useState } from 'react';
import { toast } from '@/app/admin/components/ui/sonner';
import Modal from '@/components/modals/Modal';
import { EditUserModal } from '../user-directory/edit-user-modal';
import { ViewUserDetailsModal } from '../user-directory/view-user-details-modal';
import { useDeleteUser, useSuspendUser } from '@/app/admin/hooks/use-users';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface CellActionProps {
  data: User;
}

export function CellAction({ data }: CellActionProps) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const deleteUserMutation = useDeleteUser();
  const suspendUserMutation = useSuspendUser();

  const handleSuspendUser = () => {
    setSuspendDialogOpen(true);
  };

  const handleUnbanUser = () => {
    setSuspendDialogOpen(true); // Reuse the suspend dialog but change text based on status
  };

  const handleDeleteUser = () => {
    setDeleteDialogOpen(true);
  };

  const confirmSuspend = async () => {
    const newStatus = ['suspended', 'banned', 'inactive'].includes(data.status) ? 'active' : 'suspended';

    try {
      await suspendUserMutation.mutateAsync({
        id: data.id,
        status: newStatus,
      });

      const actionText = newStatus === 'active' ? 'unrestricted' : 'suspended';
      toast.success(`User ${actionText} successfully`);
      setSuspendDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync(data.id);

      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <Modal>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors'
          >
            <IconDots className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className="w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl"
        >
          <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2.5 py-1.5">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

          {/* View Details */}
          <Modal.Trigger name={`view-user-${data.id}`}>
            <DropdownMenuItem
              className='cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white transition-colors'
            >
              <IconEye className='h-4 w-4 text-blue-500' />
              View Details
            </DropdownMenuItem>
          </Modal.Trigger>

          {/* Edit User (Super Admin only) */}
          {isSuperAdmin && (
            <Modal.Trigger name={`edit-user-${data.id}`}>
              <DropdownMenuItem
                className='cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white transition-colors'
              >
                <IconEdit className='h-4 w-4 text-amber-500' />
                Edit User
              </DropdownMenuItem>
            </Modal.Trigger>
          )}

          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

          {/* Suspend / Unsuspend */}
          {data.status === 'banned' ? (
            isSuperAdmin && (
              <DropdownMenuItem
                onClick={handleUnbanUser}
                className='cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary transition-colors'
              >
                <IconShieldLock className='h-4 w-4 text-primary' />
                Unban User
              </DropdownMenuItem>
            )
          ) : (
            <DropdownMenuItem
              onClick={handleSuspendUser}
              className={cn(
                'cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 transition-colors',
                ['suspended', 'inactive'].includes(data.status)
                  ? 'text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 focus:bg-amber-50 dark:focus:bg-amber-950/30 focus:text-amber-600'
              )}
            >
              <IconShieldLock className={cn('h-4 w-4', ['suspended', 'inactive'].includes(data.status) ? 'text-primary' : 'text-amber-500')} />
              {data.status === 'suspended' ? 'Unsuspend User' : data.status === 'inactive' ? 'Unrestrict User' : 'Suspend User'}
            </DropdownMenuItem>
          )}

          {/* Delete User (Super Admin only) */}
          {isSuperAdmin && (
            <DropdownMenuItem
              onClick={handleDeleteUser}
              className='cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 focus:bg-rose-50 dark:focus:bg-rose-950/30 focus:text-rose-600 dark:focus:text-rose-400 transition-colors'
            >
              <IconTrash className='h-4 w-4 text-rose-500' />
              Delete User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View User Details Modal - Modern visionOS Modal Window */}
      <Modal.Window name={`view-user-${data.id}`} size="lg" closeOnOutsideClick={false}>
        <ViewUserDetailsModal user={data} />
      </Modal.Window>

      {/* Edit User Modal - Modern visionOS Modal Window */}
      <Modal.Window name={`edit-user-${data.id}`} size="lg" closeOnOutsideClick={false}>
        <EditUserModal user={data} />
      </Modal.Window>

      {/* Suspend/Unsuspend Confirmation - Sleek Modern Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent className="max-w-md border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-7">
          <AlertDialogHeader className="mb-4">
            <div className="flex items-center gap-3.5 mb-2">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border", ['suspended', 'banned', 'inactive'].includes(data.status) ? 'bg-[#2f7d6d]/10 text-[#2f7d6d] border-[#2f7d6d]/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20')}>
                <IconShieldLock className="w-6 h-6" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {data.status === 'banned' ? 'Unban User' : data.status === 'suspended' ? 'Unsuspend User' : data.status === 'inactive' ? 'Unrestrict User' : 'Suspend User'}
                </AlertDialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Confirm account access status change
                </p>
              </div>
            </div>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
              Are you sure you want to {data.status === 'banned' ? 'unban' : data.status === 'suspended' ? 'unsuspend' : data.status === 'inactive' ? 'unrestrict' : 'suspend'}{' '}
              <strong className="text-slate-900 dark:text-white">{data.name}</strong> ({data.email})?{' '}
              {data.status === 'banned'
                ? 'This will lift their permanent ban and restore platform access.'
                : ['suspended', 'inactive'].includes(data.status)
                ? 'This will restore their access to all platform features.'
                : 'This will temporarily restrict their access to platform features and booking capabilities.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <AlertDialogCancel className="rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 h-11 px-5 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className={cn(
                "rounded-xl text-white font-semibold text-xs shadow-md transition-all h-11 px-6 cursor-pointer",
                ['suspended', 'banned', 'inactive'].includes(data.status)
                  ? 'bg-[#2f7d6d] hover:bg-[#256658] shadow-[#2f7d6d]/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              )}
            >
              {data.status === 'banned' ? 'Unban User' : data.status === 'suspended' ? 'Unsuspend User' : data.status === 'inactive' ? 'Unrestrict User' : 'Suspend User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation - Sleek Modern Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-7">
          <AlertDialogHeader className="mb-4">
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                <IconTrash className="w-6 h-6" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Delete User Account
                </AlertDialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Permanent removal confirmation
                </p>
              </div>
            </div>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{data.name}</strong> ({data.email})? This action cannot be undone and will permanently remove all associated user data.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 my-2">
            <IconAlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
              All linked preferences, reservations, and moderation references will be anonymized.
            </p>
          </div>

          <AlertDialogFooter className="gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <AlertDialogCancel className="rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 h-11 px-5 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all h-11 px-6 cursor-pointer"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  );
}
