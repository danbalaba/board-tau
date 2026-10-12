'use client';

import React, { useContext, useState } from 'react';
import { ModalContext } from '@/components/modals/Modal';
import {
  Eye,
  User,
  Mail,
  Building2,
  GraduationCap,
  ShieldCheck,
  Crown,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Copy,
  Check,
  Home,
  BookmarkCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from '@/app/admin/components/ui/sonner';
import { User as UserType } from '../user-tables/columns';

const ROLES: Record<string, {
  label: string;
  badge: string;
  icon: any;
  description: string;
  badgeColor: string;
  iconColor: string;
  iconBg: string;
}> = {
  USER: {
    label: 'Tenant / Student',
    badge: 'Standard Access',
    icon: GraduationCap,
    description: 'Browse, inquire, and book dorms or rooms across campus.',
    badgeColor: 'bg-[#2f7d6d]/15 text-[#2f7d6d] border-[#2f7d6d]/20',
    iconColor: 'text-[#2f7d6d]',
    iconBg: 'bg-[#2f7d6d]/10 border-[#2f7d6d]/20',
  },
  LANDLORD: {
    label: 'Landlord / Host',
    badge: 'Host Access',
    icon: Building2,
    description: 'Publish property listings, manage rooms, and handle tenant bookings.',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
  },
  ADMIN: {
    label: 'Administrator',
    badge: 'System Access',
    icon: ShieldCheck,
    description: 'Manage users, listings moderation, content reviews, and moderation logs.',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
  },
  SUPER_ADMIN: {
    label: 'Super Admin',
    badge: 'Full Control',
    icon: Crown,
    description: 'Root system privileges: audit logs, platform security, backups, and billing.',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
  },
};

const STATUSES: Record<string, {
  label: string;
  hint: string;
  dot: string;
  color: string;
  border: string;
  bg: string;
}> = {
  active: {
    label: 'Active',
    hint: 'Normal verified platform access',
    dot: 'bg-emerald-500',
    color: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/10',
  },
  inactive: {
    label: 'Inactive',
    hint: 'Deactivated account access',
    dot: 'bg-amber-500',
    color: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/10',
  },
  suspended: {
    label: 'Suspended',
    hint: 'Temporary restriction applied',
    dot: 'bg-rose-500',
    color: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/25',
    bg: 'bg-rose-500/10',
  },
  banned: {
    label: 'Banned',
    hint: 'Permanent platform restriction',
    dot: 'bg-red-600',
    color: 'text-red-600 dark:text-red-400',
    border: 'border-red-600/25',
    bg: 'bg-red-600/10',
  },
};

function normalizeRole(role?: string): string {
  if (!role) return 'USER';
  const r = role.toUpperCase();
  if (r === 'RENTER' || r === 'USER') return 'USER';
  if (r === 'HOST' || r === 'LANDLORD') return 'LANDLORD';
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  return r;
}

function normalizeStatus(status?: string): string {
  const s = (status || 'active').toLowerCase();
  if (['active', 'inactive', 'suspended', 'banned'].includes(s)) return s;
  return 'active';
}

function formatLastLogin(lastLogin?: string | null): string {
  if (!lastLogin) return 'No login recorded';
  const d = new Date(lastLogin);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) {
    return 'No login recorded';
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatJoinedDate(joinedAt?: string | null): string {
  if (!joinedAt) return 'N/A';
  const d = new Date(joinedAt);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) {
    return 'N/A';
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface ViewUserDetailsModalProps {
  user: UserType;
  onClose?: () => void;
  onCloseModal?: () => void;
}

export function ViewUserDetailsModal({ user, onClose, onCloseModal }: ViewUserDetailsModalProps) {
  const modalContext = useContext(ModalContext);
  const contextClose = modalContext?.close || (() => {});
  const [copied, setCopied] = useState(false);

  const roleKey = normalizeRole(user.role);
  const statusKey = normalizeStatus(user.status);

  const roleConfig = ROLES[roleKey] || ROLES.USER;
  const statusConfig = STATUSES[statusKey] || STATUSES.active;
  const RoleIcon = roleConfig.icon;

  function handleClose() {
    if (onClose) onClose();
    else if (onCloseModal) onCloseModal();
    else contextClose();
  }

  function handleCopyEmail() {
    if (!user.email) return;
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

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
            <Eye size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              User Profile Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Complete account credentials, system permissions, and activity metrics.
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

      {/* User Hero Identity Card */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 border overflow-hidden transition-all shadow-sm',
              roleConfig.iconBg,
              roleConfig.iconColor
            )}
          >
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : user.name?.trim() ? (
              user.name.trim().charAt(0).toUpperCase()
            ) : (
              <User size={28} />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {user.name || 'Anonymous User'}
              </h3>
              <span className={cn('px-2.5 py-0.5 rounded-md text-[10px] font-bold border', roleConfig.badgeColor)}>
                {roleConfig.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-2">
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* Status Pill Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span
            className={cn(
              'px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-xs',
              statusConfig.bg,
              statusConfig.border,
              statusConfig.color
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', statusConfig.dot)} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Platform Activity Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
              <Home size={18} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Published Listings
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active dorms or rental rooms
              </span>
            </div>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums pr-2">
            {user.listingsCount || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
              <BookmarkCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Bookings
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Reservations made or received
              </span>
            </div>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums pr-2">
            {user.bookingsCount || 0}
          </span>
        </div>
      </div>

      {/* Profile Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Full Name */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <User size={13} className="text-[#2f7d6d]" /> Full Name
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {user.name || 'Not provided'}
          </p>
        </div>

        {/* Email Address with Copy Button */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mail size={13} className="text-[#2f7d6d]" /> Email Address
            </span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="text-[11px] text-[#2f7d6d] hover:text-[#256658] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check size={11} /> Copied
                </>
              ) : (
                <>
                  <Copy size={11} /> Copy
                </>
              )}
            </button>
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {user.email}
          </p>
        </div>

        {/* Assigned System Role */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <RoleIcon size={13} className={roleConfig.iconColor} /> Assigned System Role
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {roleConfig.label}
            </span>
            <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border', roleConfig.badgeColor)}>
              {roleConfig.badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {roleConfig.description}
          </p>
        </div>

        {/* Account Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', statusConfig.dot)} /> Account Access Status
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {statusConfig.label}
            </span>
            <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border', statusConfig.bg, statusConfig.border, statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {statusConfig.hint}
          </p>
        </div>

        {/* Registration Date */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar size={13} className="text-[#2f7d6d]" /> Registration Date
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {formatJoinedDate(user.joinedAt)}
          </p>
        </div>

        {/* Last Activity / Login */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock size={13} className="text-[#2f7d6d]" /> Last Activity / Login
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {formatLastLogin(user.lastLogin)}
          </p>
        </div>
      </div>

      {/* Security & Verification Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center border border-[#2f7d6d]/20 shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Email Authentication Status
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Verified accounts have authenticated institutional or personal mail
            </span>
          </div>
        </div>

        {user.emailVerified ? (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 shrink-0">
            <CheckCircle2 size={13} /> Verified
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1 shrink-0">
            <XCircle size={13} /> Unverified
          </span>
        )}
      </div>

      {/* Modal Actions Footer */}
      <div className="pt-4 flex items-center justify-end border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={handleClose}
          className="h-11 px-7 rounded-2xl bg-[#2f7d6d] hover:bg-[#256658] active:bg-[#1e5146] text-white font-semibold text-xs shadow-md shadow-[#2f7d6d]/25 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Close</span>
        </button>
      </div>
    </motion.div>
  );
}
