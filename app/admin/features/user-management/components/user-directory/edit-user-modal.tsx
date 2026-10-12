'use client';

import React, { useState, useContext } from 'react';
import { ModalContext } from '@/components/modals/Modal';
import {
  UserCog,
  User,
  Mail,
  Building2,
  GraduationCap,
  ShieldCheck,
  Crown,
  Check,
  AlertCircle,
  Loader2,
  X,
  Eye,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/app/admin/components/ui/sonner';
import { User as UserType } from '../user-tables/columns';
import { useUpdateUser } from '@/app/admin/hooks/use-users';

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

const STATUSES = [
  {
    value: 'active',
    label: 'Active',
    hint: 'Full verified platform access',
    dot: 'bg-emerald-500',
    color: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    activeRing: 'ring-2 ring-emerald-500/20',
  },
  {
    value: 'inactive',
    label: 'Inactive',
    hint: 'Deactivated account access',
    dot: 'bg-amber-500',
    color: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    activeRing: 'ring-2 ring-amber-500/20',
  },
  {
    value: 'suspended',
    label: 'Suspended',
    hint: 'Temporary restriction',
    dot: 'bg-rose-500',
    color: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    activeRing: 'ring-2 ring-rose-500/20',
  },
  {
    value: 'banned',
    label: 'Banned',
    hint: 'Permanent platform restriction',
    dot: 'bg-red-600',
    color: 'text-red-600 dark:text-red-400',
    border: 'border-red-600/30',
    bg: 'bg-red-600/10',
    activeRing: 'ring-2 ring-red-600/20',
  },
];

function normalizeRole(role?: string): string {
  if (!role) return 'USER';
  const r = role.toUpperCase();
  if (r === 'RENTER' || r === 'USER') return 'USER';
  if (r === 'HOST' || r === 'LANDLORD') return 'LANDLORD';
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  return r;
}

function normalizeStatus(status?: string): 'active' | 'inactive' | 'suspended' | 'banned' {
  const s = (status || 'active').toLowerCase();
  if (['active', 'inactive', 'suspended', 'banned'].includes(s)) {
    return s as any;
  }
  return 'active';
}

interface EditUserModalProps {
  user: UserType;
  onClose?: () => void;
  onCloseModal?: () => void;
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  email: string;
  role: string;
  status: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
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

  if (!form.role) {
    errors.role = 'Please select an account role';
  }

  if (!form.status) {
    errors.status = 'Please select an account status';
  }

  return errors;
}

export function EditUserModal({ user, onClose, onCloseModal, onSuccess }: EditUserModalProps) {
  const modalContext = useContext(ModalContext);
  const contextClose = modalContext?.close || (() => {});
  const queryClient = useQueryClient();
  const updateUserMutation = useUpdateUser();

  const [form, setForm] = useState<FormState>({
    name: user.name || '',
    email: user.email || '',
    role: normalizeRole(user.role),
    status: normalizeStatus(user.status),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState('');

  const selectedRole = ROLES.find(r => r.value === form.role) || ROLES[0];
  const selectedStatus = STATUSES.find(s => s.value === form.status) || STATUSES[0];

  function handleClose() {
    if (status === 'loading') return;
    setErrors({});
    setStatus('idle');
    setApiError('');
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
      await updateUserMutation.mutateAsync({
        id: user.id,
        userData: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role as any,
          status: form.status as any,
        },
      });

      setStatus('success');
      toast.success(`User "${form.name.trim()}" updated successfully!`);

      // Invalidate queries to refresh the directory and stats
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });

      if (onSuccess) onSuccess();

      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to update user account';
      setApiError(errorMsg);
      setStatus('error');
      toast.error(errorMsg);
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
            <UserCog size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Edit User Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Update credentials, assign system roles, and modify account status for {user.name || user.email}.
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

      {/* Success State */}
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
              <p className="text-base font-bold text-slate-900 dark:text-white">User Updated!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {form.name} changes have been saved successfully.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* User Profile Fields (Name & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Full Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g. Juan dela Cruz"
                  className={cn(
                    'w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-slate-900 border text-xs sm:text-sm font-medium transition-all outline-none',
                    errors.name
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:border-[#2f7d6d] focus:ring-2 focus:ring-[#2f7d6d]/20'
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={13} /> {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Email Address</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="user@example.com"
                  className={cn(
                    'w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-slate-900 border text-xs sm:text-sm font-medium transition-all outline-none',
                    errors.email
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:border-[#2f7d6d] focus:ring-2 focus:ring-[#2f7d6d]/20'
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

          {/* Account Status Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Account Status</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Access privilege status</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STATUSES.map(st => {
                const isSelected = form.status === st.value;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => handleChange('status', st.value)}
                    className={cn(
                      'p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5',
                      isSelected
                        ? cn(st.border, st.bg, st.activeRing, 'border-2 shadow-xs')
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-2 h-2 rounded-full', st.dot)} />
                        <span className={cn('text-xs font-bold', isSelected ? st.color : 'text-slate-700 dark:text-slate-300')}>
                          {st.label}
                        </span>
                      </div>
                      {isSelected && <Check size={13} className={st.color} strokeWidth={3} />}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">
                      {st.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.status && (
              <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle size={13} /> {errors.status}
              </p>
            )}
          </div>

          {/* Account Role Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Assign Account Role</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Permissions configuration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map(role => {
                const isSelected = form.role === role.value;
                const IconComp = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleChange('role', role.value)}
                    className={cn(
                      'p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2.5',
                      isSelected
                        ? cn(role.activeBorder, role.activeBg, role.activeRing, 'border-2 shadow-xs')
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-xl flex items-center justify-center border',
                            role.iconBg,
                            role.iconColor
                          )}
                        >
                          <IconComp size={16} />
                        </div>
                        <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border', role.badgeColor)}>
                          {role.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <div className={cn('w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0', role.checkBg)}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
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
                <Sparkles size={11} /> Ready to Update
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#2f7d6d]/40 dark:border-[#2f7d6d]/30 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border overflow-hidden transition-all',
                    selectedRole
                      ? cn(selectedRole.iconBg, selectedRole.iconColor)
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  )}
                >
                  {user.image ? (
                    <img src={user.image} alt={form.name} className="w-full h-full object-cover" />
                  ) : form.name.trim() ? (
                    form.name.trim().charAt(0).toUpperCase()
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {form.name.trim() || 'User Account'}
                    </h4>
                    {selectedRole && (
                      <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border', selectedRole.badgeColor)}>
                        {selectedRole.label}
                      </span>
                    )}
                    {selectedStatus && (
                      <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1', selectedStatus.bg, selectedStatus.border, selectedStatus.color)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', selectedStatus.dot)} />
                        {selectedStatus.label}
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
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={3} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
