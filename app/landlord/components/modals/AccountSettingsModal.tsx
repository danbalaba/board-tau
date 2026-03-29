'use client';

import React, { useState } from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Switch } from '@/app/admin/components/ui/switch';
import {
  IconLock,
  IconMail,
  IconBell,
  IconDeviceMobile,
  IconShieldCheck,
  IconEye,
  IconEyeOff,
  IconDeviceFloppy,
  IconChevronRight
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const accountSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
    }
  });

  const onSubmit = async (data: AccountFormValues) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Account Update Data:', data);
      toast.success('Account security updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update account settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Account Settings"
      description="Account security and alerts"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-1 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-6">
          {/* Security / Password Header - More Compact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <IconShieldCheck className="text-primary w-4 h-4" />
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">
                Security
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" title="Current Password" className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Password</Label>
                <div className="relative group">
                  <IconLock className={cn("absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors", errors.currentPassword ? "text-red-500" : "text-gray-400")} />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    {...register('currentPassword')}
                    placeholder="Old password"
                    className={cn(
                      "pl-11 pr-11 h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all text-sm font-medium",
                      errors.currentPassword ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showCurrentPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.currentPassword.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" title="New Password" className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">New Password</Label>
                  <div className="relative group">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...register('newPassword')}
                      placeholder="New password"
                      className={cn(
                        "pl-4 pr-11 h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all text-sm font-medium",
                        errors.newPassword ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.newPassword.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" title="Confirm Password" className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm</Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register('confirmPassword')}
                      placeholder="Repeat password"
                      className={cn(
                        "pl-4 pr-11 h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all text-sm font-medium",
                        errors.confirmPassword ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section - More Compact */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <IconBell className="text-emerald-500 w-4 h-4" />
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">
                Alerts
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              {[
                { id: 'emailNotifications', label: 'Email Alerts', icon: IconMail, desc: 'Property updates', color: 'text-blue-500' },
                { id: 'pushNotifications', label: 'In-app Push', icon: IconBell, desc: 'Real-time alerts', color: 'text-amber-500' }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-transform", item.color)}>
                      <item.icon size={16} />
                    </div>
                    <div>
                      <Label htmlFor={item.id} className="text-xs font-bold text-gray-900 dark:text-white cursor-pointer select-none">{item.label}</Label>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <Switch 
                    id={item.id} 
                    checked={watch(item.id as any)}
                    onCheckedChange={(checked) => setValue(item.id as any, checked)}
                    className="scale-75" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button - Compact sticky */}
        <div className="pt-6 sticky bottom-0 bg-white dark:bg-gray-900 mt-4 py-2 border-t border-gray-100 dark:border-gray-800">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 transition-all font-black uppercase tracking-[0.1em] text-xs"
          >
            {isLoading ? "Syncing..." : "Update Preferences"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
