'use client';

import React, { useState } from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Switch } from '@/app/admin/components/ui/switch';
import {
  IconLock,
  IconShieldLock,
  IconDeviceMobile,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconShieldCheck,
  IconAlertTriangle,
  IconActivity,
  IconBrowser,
  IconMapPin
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const securitySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
  twoFactor: z.boolean(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securitySchema>;

export function SecuritySettingsModal({ isOpen, onClose }: SecuritySettingsModalProps) {
  const { success, error: toastError } = useResponsiveToast();
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
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      twoFactor: false,
    }
  });

  const onSubmit = async (data: SecurityFormValues) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Security Update Data:', data);
      success('Security settings updated successfully!');
      onClose();
    } catch (error) {
      toastError('Failed to update security settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Security & Privacy"
      description="Account security and sessions"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-1 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-6">
          {/* Security Health Status Card - Compact */}
          <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <IconShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none mb-1">Account Secure</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-none">Meets all security standards.</p>
              </div>
            </div>
          </div>

          {/* Password Change Section - Compact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <IconLock className="text-primary w-4 h-4" />
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Update Credentials</h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" title="Current Password" className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Password</Label>
                <div className="relative group">
                  <IconLock className={cn("absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors", errors.currentPassword ? "text-red-500" : "text-gray-400")} />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    {...register('currentPassword')}
                    placeholder="Enter current password"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" title="New Password" className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">New</Label>
                  <div className="relative group">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...register('newPassword')}
                      placeholder="New one"
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
                      placeholder="Repeat it"
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

          {/* MFA Section - Compact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <IconShieldLock className="text-blue-500 w-4 h-4" />
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Multi-Factor</h3>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-3">
                <IconDeviceMobile size={18} className="text-blue-500" />
                <Label htmlFor="twoFactor" className="text-xs font-bold text-gray-900 dark:text-white cursor-pointer select-none leading-none">Require code</Label>
              </div>
              <Switch 
                id="twoFactor" 
                checked={watch('twoFactor')}
                onCheckedChange={(checked) => setValue('twoFactor', checked)}
                className="scale-75 data-[state=checked]:bg-blue-500" 
              />
            </div>
          </div>

          {/* Sessions - Compact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <IconActivity className="text-purple-500 w-4 h-4" />
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Sessions</h3>
            </div>
            
            <div className="space-y-2">
              {[
                { browser: 'Chrome', location: 'Manila, PH', time: 'Active now', current: true },
                { browser: 'Safari', location: 'Quezon, PH', time: '2h ago', current: false }
              ].map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-lg", session.current ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-100 dark:bg-gray-800 text-gray-400")}>
                      <IconBrowser size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">{session.browser}</p>
                      <p className="text-[9px] text-gray-500 font-medium leading-tight">{session.location} • {session.time}</p>
                    </div>
                  </div>
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
            {isLoading ? "Saving..." : "Apply Security Rules"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
