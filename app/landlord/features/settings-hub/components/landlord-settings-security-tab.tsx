'use client';

import React from 'react';
import { Lock, Save, Loader2 } from 'lucide-react';
import Input from '@/components/inputs/Input';
import { useLandlordSecurity } from '../hooks/use-landlord-security';

interface LandlordSettingsSecurityTabProps {
  hideSubmitButton?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function LandlordSettingsSecurityTab({ hideSubmitButton, onDirtyChange }: LandlordSettingsSecurityTabProps = {}) {
  const { 
    passwordData, 
    handlePasswordChange, 
    submitPasswordChange, 
    isLoading,
    isDirty,
    errors 
  } = useLandlordSecurity();

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <form id="landlord-security-form" onSubmit={submitPasswordChange} className="bg-white dark:bg-gray-900 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <div>
            <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Change Password</h4>
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Keep your account safe by updating your password regularly</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-5">
          <Input
            id="currentPassword"
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            icon={Lock}
            useStaticLabel
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            errors={errors}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              icon={Lock}
              useStaticLabel
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              errors={errors}
              required
            />

            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter your new password"
              icon={Lock}
              useStaticLabel
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              errors={errors}
              required
            />
          </div>
        </div>

        
        {!hideSubmitButton && (
          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto h-11 px-6 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                <Save size={16} className="text-white" />
              )}
              <span>{isLoading ? 'Saving Password...' : 'Save New Password'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}


