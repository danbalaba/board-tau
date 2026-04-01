import React, { useState } from 'react';
import { Lock, Save, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Input from '@/components/inputs/Input';

export function LandlordSettingsSecurityTab() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <ShieldCheck size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Security Settings
        </h2>
      </div>

      <div className="space-y-8">
        {/* Password Management */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-6">
          <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Lock size={14} className="text-primary" />
            Update Access Credentials
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="relative">
              <Input
                id="currentPassword"
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                icon={Lock}
                useStaticLabel
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-[38px] text-gray-400 hover:text-primary transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  id="newPassword"
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  icon={Lock}
                  useStaticLabel
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-primary transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  icon={Lock}
                  useStaticLabel
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all text-[10px] uppercase tracking-widest shadow-md">
              <Save size={14} />
              Save New Credentials
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account with TOTP apps.' },
            { title: 'Account Activity', desc: 'Monitor your recent login activity and authorized locations.' },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-0.5 text-base">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-lg font-bold transition-all text-[10px] uppercase tracking-widest">
                Manage
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
