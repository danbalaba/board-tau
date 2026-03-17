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
import { MoreHorizontal, Eye, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { User } from './columns';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { useUpdateUser, useDeleteUser, useSuspendUser } from '@/app/admin/hooks/use-users';

interface CellActionProps {
  data: User;
}

export function CellAction({ data }: CellActionProps) {
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
    const newStatus = data.status === 'suspended' ? 'active' : 'suspended';

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
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleViewUser}
            className='cursor-pointer'
          >
            <Eye className='mr-2 h-4 w-4' />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleEditUser}
            className='cursor-pointer'
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSuspendUser}
            className={`cursor-pointer ${data.status === 'suspended' ? 'text-green-600' : 'text-orange-600'}`}
          >
            <ShieldAlert className='mr-2 h-4 w-4' />
            {data.status === 'suspended' ? 'Unsuspend' : 'Suspend'} User
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteUser}
            className='cursor-pointer text-red-600'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View User Dialog - Enterprise Design */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete profile information for {data.name}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>Full Name</Label>
                <Input value={data.name} disabled className='bg-gray-50' />
              </div>
              <div className='space-y-2'>
                <Label>Email Address</Label>
                <Input value={data.email} disabled className='bg-gray-50' />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>User Role</Label>
                <Input value={data.role.toUpperCase()} disabled className='bg-gray-50' />
              </div>
              <div className='space-y-2'>
                <Label>Account Status</Label>
                <Input value={data.status.toUpperCase()} disabled className={`bg-gray-50 ${
                  data.status === 'active' ? 'text-green-600' :
                  data.status === 'inactive' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>Joined Date</Label>
                <Input value={new Date(data.joinedAt).toLocaleDateString()} disabled className='bg-gray-50' />
              </div>
              <div className='space-y-2'>
                <Label>Last Login</Label>
                <Input value={new Date(data.lastLogin).toLocaleDateString()} disabled className='bg-gray-50' />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <Label>Total Listings</Label>
                <Input value={data.listingsCount.toString()} disabled className='bg-gray-50 text-center font-medium' />
              </div>
              <div className='space-y-2'>
                <Label>Bookings Made</Label>
                <Input value={data.bookingsCount.toString()} disabled className='bg-gray-50 text-center font-medium' />
              </div>
              <div className='space-y-2'>
                <Label>Total Spent</Label>
                <Input value={`$${data.totalSpent.toLocaleString()}`} disabled className='bg-gray-50 text-center font-medium' />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog - Enterprise Design */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {data.name}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>Full Name</Label>
                <Input
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Enter full name'
                />
              </div>
              <div className='space-y-2'>
                <Label>Email Address</Label>
                <Input
                  name='email'
                  value={formData.email}
                  type='email'
                  onChange={handleInputChange}
                  placeholder='Enter email address'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>User Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='host'>Host</SelectItem>
                    <SelectItem value='renter'>Renter</SelectItem>
                    <SelectItem value='user'>User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Account Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                    <SelectItem value='suspended'>Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend/Unsuspend Confirmation - Enterprise Design */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={data.status === 'suspended' ? 'text-green-600' : 'text-orange-600'}>
              {data.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {data.status === 'suspended' ? 'unsuspend' : 'suspend'} {data.name}?
              {data.status === 'suspended' ? ' This will restore their access to all platform features.' : ' This will immediately restrict their access to all platform features.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className={data.status === 'suspended' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              {data.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation - Enterprise Design */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-red-600'>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete {data.name}? This action is irreversible and will permanently remove all user data, including listings, bookings, and preferences.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
