'use client';

import React, { useState, useContext } from 'react';
import { ModalContext } from '@/components/modals/Modal';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Building2,
  GraduationCap,
  ShieldCheck,
  Crown,
  Check,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/app/admin/components/ui/sonner';

const ROLES = [
  {
    value: 'USER',
    label: 'Tenant / Student',
    badge: 'Standard Access',
    icon: GraduationCap,
    description: 'Browse, inquire, and book dorms or rooms across campus.',
    activeBorder: 'border-[#2f7d6d]',
    activeBg: 'bg-[#2f7d6d]/10',
    activeRing: 'ring-2 ring-[#2f7d6d]/20',
    badgeColor: 'bg-[#2f7d6d]/15 text-[#2f7d6d] border-[#2f7d6d]/20',
    iconColor: 'text-[#2f7d6d]',
    iconBg: 'bg-[#2f7d6d]/10 border-[#2f7d6d]/20',
    checkBg: 'bg-[#2f7d6d]',
  },
  {
    value: 'LANDLORD',
    label: 'Landlord / Host',
    badge: 'Host Access',
    icon: Building2,
    description: 'Publish property listings, manage rooms, and handle tenant bookings.',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-500/10',
    activeRing: 'ring-2 ring-amber-500/20',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    checkBg: 'bg-amber-500',
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    badge: 'System Access',
    icon: ShieldCheck,
    description: 'Manage users, listings moderation, content reviews, and moderation logs.',
    activeBorder: 'border-rose-500',
    activeBg: 'bg-rose-500/10',
    activeRing: 'ring-2 ring-rose-500/20',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    checkBg: 'bg-rose-500',
  },
  {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
    badge: 'Full Control',
    icon: Crown,
    description: 'Root system privileges: audit logs, platform security, backups, and billing.',
    activeBorder: 'border-purple-500',
    activeBg: 'bg-purple-500/10',
    activeRing: 'ring-2 ring-purple-500/20',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    checkBg: 'bg-purple-600',
  },
];

interface ProvisionUserModalProps {
  onClose?: () => void;
  onCloseModal?: () => void;
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) {
    errors.name = 'Full name is required';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters';
  }

  if (!form.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!form.password) {
    errors.password = 'Temporary password is required';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!form.role) {
    errors.role = 'Please select an account role';
  }

  return errors;
}

export function ProvisionUserModal({ onClose, onCloseModal, onSuccess }: ProvisionUserModalProps) {
  const modalContext = useContext(ModalContext);
  const contextClose = modalContext?.close || (() => {});
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', role: 'USER' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState('');

  const selectedRole = ROLES.find(r => r.value === form.role);

  function handleClose() {
    if (status === 'loading') return;
    setForm({ name: '', email: '', password: '', role: 'USER' });
    setErrors({});
    setStatus('idle');
    setApiError('');
    setShowPassword(false);
    if (onClose) onClose();
    else if (onCloseModal) onCloseModal();
    else contextClose();
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (apiError) setApiError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please complete all required fields');
      return;
    }

    setStatus('loading');
    setApiError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error || data?.message || 'Failed to create user account';
        setApiError(errorMsg);
        setStatus('error');
        toast.error(errorMsg);
        return;
      }

      setStatus('success');
      toast.success(`User "${form.name.trim()}" created successfully!`);

      // Invalidate queries so the directory refreshes
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });

      if (onSuccess) onSuccess();

      // Close modal after brief success feedback
      setTimeout(() => {
        handleClose();
      }, 700);
    } catch {
      const networkError = 'Network error — please try again';
      setApiError(networkError);
      setStatus('error');
      toast.error(networkError);
    }
  }

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 w-full font-sans"
    >
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center border border-[#2f7d6d]/20 shrink-0">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Add New User
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Provision a verified student, landlord, admin, or super admin account on BoardTAU.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Success state */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-[#2f7d6d]/10 flex items-center justify-center border border-[#2f7d6d]/20"
                >
                  <Check className="h-8 w-8 text-[#2f7d6d]" strokeWidth={3} />
                </motion.div>
                <div className="text-center">
                  <p className="text-base font-bold text-slate-900 dark:text-white">Account Created!</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {form.name} has been provisioned successfully.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-5" id="provision-user-form">
              {/* API Error banner */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{apiError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name and Email in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="provision-name"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
                  >
                    <span>Full Name <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <User size={16} />
                    </div>
                    <input
                      id="provision-name"
                      type="text"
                      placeholder="e.g. Juan dela Cruz"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      disabled={isLoading}
                      className={cn(
                        'w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400',
                        errors.name
                          ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#2f7d6d] focus:ring-2 focus:ring-[#2f7d6d]/20'
                      )}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={13} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="provision-email"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
                  >
                    <span>Email Address <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Mail size={16} />
                    </div>
                    <input
                      id="provision-email"
                      type="email"
                      placeholder="user@example.com"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      disabled={isLoading}
                      className={cn(
                        'w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400',
                        errors.email
                          ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#2f7d6d] focus:ring-2 focus:ring-[#2f7d6d]/20'
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={13} /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="provision-password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
                >
                  <span>Temporary Password <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">Min. 8 characters</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock size={16} />
                  </div>
                  <input
                    id="provision-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter temporary password"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      'w-full h-11 pl-10 pr-10 rounded-xl border bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400',
                      errors.password
                        ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#2f7d6d] focus:ring-2 focus:ring-[#2f7d6d]/20'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={13} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Role Selection Cards: 2x2 Responsive Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Assign Account Role <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">Choose permissions level</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROLES.map(role => {
                    const isSelected = form.role === role.value;
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleChange('role', role.value)}
                        disabled={isLoading}
                        className={cn(
                          'p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative min-h-[115px]',
                          isSelected
                            ? cn(role.activeBg, role.activeBorder, role.activeRing, 'shadow-sm')
                            : errors.role
                            ? 'bg-rose-500/5 border-rose-500/40 text-slate-600 dark:text-slate-400 hover:border-rose-500'
                            : 'bg-slate-50/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#2f7d6d]/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                        )}
                      >
                        {isSelected && (
                          <div className={cn("absolute top-3 right-3 w-4 h-4 rounded-full text-white flex items-center justify-center text-[10px] shadow-xs", role.checkBg)}>
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center border shrink-0', role.iconBg, role.iconColor)}>
                              <Icon size={15} />
                            </div>
                            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none border', role.badgeColor)}>
                              {role.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {role.label}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                            {role.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={13} /> {errors.role}
                  </p>
                )}
              </div>

              {/* Live User Card Preview */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Eye size={12} className="text-[#2f7d6d]" /> Live Directory Card Preview
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2f7d6d]/10 text-[#2f7d6d] border border-[#2f7d6d]/20 flex items-center gap-1">
                    <Sparkles size={11} /> Ready to Provision
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#2f7d6d]/40 dark:border-[#2f7d6d]/30 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border transition-all',
                        selectedRole
                          ? cn(selectedRole.iconBg, selectedRole.iconColor)
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      )}
                    >
                      {form.name.trim() ? (
                        form.name.trim().charAt(0).toUpperCase()
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {form.name.trim() || 'Juan dela Cruz'}
                        </h4>
                        {selectedRole && (
                          <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border', selectedRole.badgeColor)}>
                            {selectedRole.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        {form.email.trim() || 'user@example.com'}
                      </p>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full bg-[#2f7d6d] text-white flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="h-11 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 px-7 rounded-2xl bg-[#2f7d6d] hover:bg-[#256658] active:bg-[#1e5146] disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-[#2f7d6d]/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating User...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} strokeWidth={3} />
                      <span>Save & Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
  );
}
