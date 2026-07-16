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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/admin/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/app/admin/components/ui/alert-dialog';
import { IconDots, IconEye, IconEdit, IconTrash, IconShieldLock, IconAlertTriangle } from '@tabler/icons-react';
import { User } from './columns';
import { useState } from 'react';
import { toast } from '@/app/admin/components/ui/sonner';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { useUpdateUser, useDeleteUser, useSuspendUser } from '@/app/admin/hooks/use-users';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface CellActionProps {
  data: User;
}

export function CellAction({ data }: CellActionProps) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status
  });

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const suspendUserMutation = useSuspendUser();

  const handleViewUser = () => {
    setViewDialogOpen(true);
  };

  const handleEditUser = () => {
    setFormData({
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status
    });
    setEditDialogOpen(true);
  };

  const handleSuspendUser = () => {
    setSuspendDialogOpen(true);
  };

  const handleUnbanUser = () => {
    setSuspendDialogOpen(true); // Reuse the suspend dialog but change text based on status
  };

  const handleDeleteUser = () => {
    setDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const confirmSuspend = async () => {
    const newStatus = data.status === 'suspended' || data.status === 'banned' ? 'active' : 'suspended';

    try {
      await suspendUserMutation.mutateAsync({
        id: data.id,
        status: newStatus
      });

      toast.success(`User ${newStatus}d successfully`);
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

  const confirmEdit = async () => {
    try {
      await updateUserMutation.mutateAsync({
        id: data.id,
        userData: formData
      });

      toast.success('User updated successfully');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'>
            <IconDots className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-xl">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
          <DropdownMenuItem
            onClick={handleViewUser}
            className='cursor-pointer text-xs font-bold uppercase tracking-widest rounded-xl gap-2 py-2 text-gray-700 dark:text-gray-300'
          >
            <IconEye className='h-4 w-4 text-blue-500' />
            View Details
          </DropdownMenuItem>
          {isSuperAdmin && (
            <>
              <DropdownMenuItem
                onClick={handleEditUser}
                className='cursor-pointer text-xs font-bold uppercase tracking-widest rounded-xl gap-2 py-2 text-gray-700 dark:text-gray-300'
              >
                <IconEdit className='h-4 w-4 text-amber-500' />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
            </>
          )}
          {data.status === 'banned' ? (
            isSuperAdmin && (
              <DropdownMenuItem
                onClick={handleUnbanUser}
                className='cursor-pointer text-xs font-bold uppercase tracking-widest rounded-xl gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-600/10'
              >
                <IconShieldLock className='h-4 w-4' />
                Unban User
              </DropdownMenuItem>
            )
          ) : (
            <DropdownMenuItem
              onClick={handleSuspendUser}
              className={`cursor-pointer text-xs font-bold uppercase tracking-widest rounded-xl gap-2 py-2 ${data.status === 'suspended' ? 'text-emerald-600 focus:text-emerald-600 focus:bg-emerald-500/10' : 'text-orange-600 focus:text-orange-600 focus:bg-orange-500/10'}`}
            >
              <IconShieldLock className='h-4 w-4' />
              {data.status === 'suspended' ? 'Unsuspend' : 'Suspend'} User
            </DropdownMenuItem>
          )}
          {isSuperAdmin && (
            <DropdownMenuItem
              onClick={handleDeleteUser}
              className='cursor-pointer text-xs font-bold uppercase tracking-widest rounded-xl gap-2 py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-500/10'
            >
              <IconTrash className='h-4 w-4' />
              Delete User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View User Dialog - Frosted Glass */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='sm:max-w-lg border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8'>
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm shrink-0">
                {data.image ? (
                  <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
                    <IconEye className="w-6 h-6 text-blue-500" />
                  </div>
                )}
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">User Details</DialogTitle>
            </div>
            <DialogDescription className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-[4.5rem]">
              Complete profile information for {data.name}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Full Name</Label>
                <Input value={data.name} disabled className='h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-sm font-bold shadow-sm' />
              </div>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Email Address</Label>
                <Input value={data.email} disabled className='h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-sm font-bold shadow-sm' />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">User Role</Label>
                <Input value={data.role.toUpperCase()} disabled className='h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-sm font-bold shadow-sm' />
              </div>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Account Status</Label>
                <Input value={data.status.toUpperCase()} disabled className={`h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-sm font-black tracking-widest shadow-sm ${
                  data.status === 'active' ? 'text-emerald-500' :
                  data.status === 'inactive' ? 'text-amber-500' : 
                  data.status === 'banned' ? 'text-red-600' : 'text-rose-500'
                }`} />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Joined Date</Label>
                <Input value={new Date(data.joinedAt).toLocaleDateString()} disabled className='h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-sm font-bold shadow-sm' />
              </div>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Last Login</Label>
                <Input value={new Date(data.lastLogin).toLocaleDateString()} disabled className='h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-sm font-bold shadow-sm' />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10'>
              <div className='space-y-1 text-center'>
                <Label className="text-[9px] font-black uppercase tracking-widest text-blue-500/70">Listings</Label>
                <p className='text-lg font-black text-gray-900 dark:text-white tabular-nums'>{data.listingsCount}</p>
              </div>
              <div className='space-y-1 text-center'>
                <Label className="text-[9px] font-black uppercase tracking-widest text-blue-500/70">Bookings</Label>
                <p className='text-lg font-black text-gray-900 dark:text-white tabular-nums'>{data.bookingsCount}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-12 px-8">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog - Frosted Glass */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='sm:max-w-lg border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8'>
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-amber-500/10 rounded-2xl shadow-sm">
                <IconEdit className="w-6 h-6 text-amber-500" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Edit User</DialogTitle>
            </div>
            <DialogDescription className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-[3.25rem]">
              Update user information for {data.name}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Full Name</Label>
                <Input
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Enter full name'
                  className="h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus-visible:ring-amber-500/20 text-sm font-bold shadow-sm"
                />
              </div>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Email Address</Label>
                <Input
                  name='email'
                  value={formData.email}
                  type='email'
                  onChange={handleInputChange}
                  placeholder='Enter email address'
                  className="h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus-visible:ring-amber-500/20 text-sm font-bold shadow-sm"
                />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">User Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-sm font-bold shadow-sm">
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 shadow-xl">
                    <SelectItem value='admin' className="font-bold rounded-xl">Admin</SelectItem>
                    <SelectItem value='host' className="font-bold rounded-xl">Host</SelectItem>
                    <SelectItem value='renter' className="font-bold rounded-xl">Renter</SelectItem>
                    <SelectItem value='user' className="font-bold rounded-xl">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2.5'>
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Account Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-sm font-bold shadow-sm">
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 shadow-xl">
                    <SelectItem value='active' className="font-bold rounded-xl text-emerald-500">Active</SelectItem>
                    <SelectItem value='inactive' className="font-bold rounded-xl text-amber-500">Inactive</SelectItem>
                    <SelectItem value='suspended' className="font-bold rounded-xl text-rose-500">Suspended</SelectItem>
                    <SelectItem value='banned' className="font-bold rounded-xl text-red-600">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0 mt-8">
            <Button variant='ghost' onClick={() => setEditDialogOpen(false)} className="rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-12 px-6">Cancel</Button>
            <Button onClick={confirmEdit} className="rounded-xl bg-gray-900 hover:bg-amber-500 dark:bg-white dark:text-gray-900 dark:hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all h-12 px-6">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend/Unsuspend Confirmation - Frosted Glass */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent className="max-w-md border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8">
          <AlertDialogHeader className="mb-4">
            <div className="flex items-center gap-4 mb-2">
              <div className={cn("p-3 rounded-2xl shadow-sm", data.status === 'suspended' || data.status === 'banned' ? 'bg-emerald-500/10' : 'bg-orange-500/10')}>
                <IconShieldLock className={cn("w-6 h-6", data.status === 'suspended' || data.status === 'banned' ? 'text-emerald-500' : 'text-orange-500')} />
              </div>
              <AlertDialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                {data.status === 'banned' ? 'Unban User' : data.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs font-bold text-gray-500 leading-relaxed pl-[3.25rem]">
              Are you sure you want to {data.status === 'banned' ? 'unban' : data.status === 'suspended' ? 'unsuspend' : 'suspend'}{' '}
              <span className="font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md uppercase tracking-widest text-[10px]">{data.name}</span>?
              {data.status === 'banned' ? ' This will lift their permanent ban and restore access.' : data.status === 'suspended' ? ' This will restore their access to all platform features.' : ' This will immediately restrict their access to all platform features.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent h-12 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className={cn("rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all h-12 px-6", data.status === 'suspended' || data.status === 'banned' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20')}
            >
              {data.status === 'banned' ? 'Unban' : data.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation - Frosted Glass */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8">
          <AlertDialogHeader className="mb-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-rose-500/10 rounded-2xl shadow-sm">
                <IconTrash className="w-6 h-6 text-rose-500" />
              </div>
              <AlertDialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Delete User</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs font-bold text-gray-500 leading-relaxed pl-[3.25rem]">
              Are you absolutely sure you want to delete{' '}
              <span className="font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-widest text-[10px]">"{data.name}"</span>?{' '}
              This action is irreversible and will permanently remove all user data, including listings, bookings, and preferences.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 mt-4 mb-8">
            <IconAlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-600/90 font-black uppercase tracking-widest leading-relaxed">
              All linked accounts and financial records will also be anonymized.
            </p>
          </div>

          <AlertDialogFooter className="gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent h-12 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20 transition-all h-12 px-6"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
