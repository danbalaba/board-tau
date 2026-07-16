'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/admin/components/ui/dialog';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/admin/components/ui/select';
import { IconUser, IconMail, IconLock, IconShield, IconCheck, IconAlertCircle, IconLoader2, IconEye, IconEyeOff } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Full system access', color: 'text-rose-500' },
  { value: 'LANDLORD', label: 'Landlord', description: 'Manage properties & listings', color: 'text-amber-500' },
  { value: 'USER', label: 'Tenant', description: 'Standard user access', color: 'text-emerald-500' },
];

interface ProvisionUserModalProps {
  open: boolean;
  onClose: () => void;
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
  if (!form.name.trim()) errors.name = 'Full name is required';
  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!form.password) {
    errors.password = 'Password is required';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  if (!form.role) errors.role = 'Please select a role';
  return errors;
}

export function ProvisionUserModal({ open, onClose }: ProvisionUserModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', role: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState('');

  function handleClose() {
    if (status === 'loading') return;
    setForm({ name: '', email: '', password: '', role: '' });
    setErrors({});
    setStatus('idle');
    setApiError('');
    setShowPassword(false);
    onClose();
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
      return;
    }

    setStatus('loading');
    setApiError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data?.error || data?.message || 'Failed to create user');
        setStatus('error');
        return;
      }

      setStatus('success');
      // Invalidate the users query so the table refreshes
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });

      // Close after a short success animation
      setTimeout(() => handleClose(), 1400);
    } catch {
      setApiError('Network error — please try again');
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl shadow-2xl rounded-3xl">
        {/* Header gradient strip */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary to-primary-hover" />

        <div className="p-6 space-y-5">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-2xl bg-primary/10">
                <IconShield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Add New User
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Create a new account with verified email access.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

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
                  className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center"
                >
                  <IconCheck className="h-8 w-8 text-emerald-500" />
                </motion.div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-white">User Created!</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {form.name} has been added successfully.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4" id="provision-user-form">
              {/* API Error banner */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20"
                  >
                    <IconAlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{apiError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="provision-name" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Full Name
                </Label>
                <div className="relative">
                  <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="provision-name"
                    placeholder="e.g. Juan dela Cruz"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      'pl-10 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary/30 focus:border-primary',
                      errors.name && 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/30 focus:border-rose-500'
                    )}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <IconAlertCircle className="h-3 w-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="provision-email" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative">
                  <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="provision-email"
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      'pl-10 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary/30 focus:border-primary',
                      errors.email && 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/30 focus:border-rose-500'
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <IconAlertCircle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="provision-password" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Temporary Password
                </Label>
                <div className="relative">
                  <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="provision-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      'pl-10 pr-10 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary/30 focus:border-primary',
                      errors.password && 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/30 focus:border-rose-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <IconAlertCircle className="h-3 w-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="provision-role" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </Label>
                <Select
                  value={form.role}
                  onValueChange={v => handleChange('role', v)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="provision-role"
                    className={cn(
                      'rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary/30 focus:border-primary',
                      errors.role && 'border-rose-400 dark:border-rose-500'
                    )}
                  >
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                    {ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value} className="rounded-xl cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className={cn('font-semibold text-sm', r.color)}>{r.label}</span>
                          <span className="text-xs text-gray-400">—</span>
                          <span className="text-xs text-gray-500">{r.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <IconAlertCircle className="h-3 w-3" /> {errors.role}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg shadow-primary/25 transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
