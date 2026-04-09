import { Lock, Save, ShieldCheck, LucideLoader2 } from 'lucide-react';
import Input from '@/components/inputs/Input';
import { useLandlordSecurity } from '../hooks/use-landlord-security';

export function LandlordSettingsSecurityTab() {
  const { 
    passwordData, 
    handlePasswordChange, 
    submitPasswordChange, 
    handleManageSecurity,
    isLoading 
  } = useLandlordSecurity();

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center text-center">
        <div className="p-4 bg-primary/10 rounded-[2rem] text-primary mb-5 shadow-inner">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          Security & Privacy
        </h2>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
          Protect your landlord account
        </p>
      </div>

      <div className="space-y-12">
        {/* Password Management */}
        <form onSubmit={submitPasswordChange} className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <div className="w-6 h-1 bg-primary rounded-full" />
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Update Access Credentials</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              icon={Lock}
              useStaticLabel
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="newPassword"
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                icon={Lock}
                useStaticLabel
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />

              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Repeat new password"
                icon={Lock}
                useStaticLabel
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="group relative overflow-hidden flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center gap-3">
                {isLoading ? (
                  <LucideLoader2 size={16} className="animate-spin text-primary" />
                ) : (
                  <Save size={16} className="text-primary" />
                )}
                <span>{isLoading ? 'Updating...' : 'Save New Credentials'}</span>
              </div>
            </button>
          </div>
        </form>

        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
           <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-6 h-1 bg-primary rounded-full" />
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Enhanced Protection</h4>
          </div>

          {[
            { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security with TOTP apps.', icon: Lock },
            { title: 'Account Activity', desc: 'Monitor recent login activity and locations.', icon: ShieldCheck },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between p-6 bg-white/40 dark:bg-gray-800/20 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800/40 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white mb-0.5 text-sm uppercase tracking-wider">{item.title}</h3>
                  <p className="text-xs font-medium text-gray-500">{item.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => handleManageSecurity(item.title)}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-xl font-black transition-all text-[9px] uppercase tracking-[0.2em] border border-primary/10 active:scale-95"
              >
                Manage
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
