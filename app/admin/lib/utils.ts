import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

export function getAdminGreetingName(name?: string | null, role?: string | null): string {
  if (!name) {
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'System Admin';
    return 'Admin';
  }
  const cleanName = name.trim();
  // Strip "BoardTAU" prefix if present so it doesn't greet with platform brand name
  if (cleanName.toLowerCase().startsWith('boardtau')) {
    const withoutPrefix = cleanName.substring(8).trim();
    if (withoutPrefix) return withoutPrefix; // e.g. "Super Admin" or "System Admin"
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'System Admin';
    return 'Admin';
  }
  // If the user has a personal name (e.g. "Dan Richie Balaba"), use their first name ("Dan")
  return cleanName.split(' ')[0];
}

export function getAdminDisplayName(name?: string | null, role?: string | null): string {
  if (!name) {
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'System Admin';
    return 'Admin User';
  }
  const cleanName = name.trim();
  if (cleanName.toLowerCase().startsWith('boardtau')) {
    const withoutPrefix = cleanName.substring(8).trim();
    if (withoutPrefix) return withoutPrefix;
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'System Admin';
    return 'Admin User';
  }
  return cleanName;
}

export function getAdminRoleBadge(role?: string | null): string {
  if (role === 'SUPER_ADMIN') return 'Super Admin';
  if (role === 'ADMIN') return 'System Admin';
  return 'Admin Account';
}
