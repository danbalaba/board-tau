import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import "lightswind";

// Utility function to merge class names with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to format a number with currency
export function formatCurrency(
  amount: number,
  currency = "USD",
  options?: Omit<Intl.NumberFormatOptions, "style" | "currency">
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...options,
  }).format(amount);
}

// Utility function to generate a unique ID
export function generateUniqueId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// Utility function to truncate text
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Utility function to format date
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

// Utility function to debounce function calls
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Utility function to throttle function calls
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number) {
  let inThrottle = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Utility function to format property accommodation type slugs to readable labels
export function formatPropertyType(type: any): string {
  if (!type || type === 'N/A') return 'Not Specified';
  const clean = String(type).trim().toLowerCase();
  if (clean === 'boarding-house' || clean === 'boarding_house' || clean === 'boardinghouse') return 'Boarding House';
  if (clean === 'dormitory') return 'Dormitory';
  if (clean === 'apartment' || clean === 'apartment-building') return 'Apartment Building';
  if (clean === 'hostel' || clean === 'hostel-transient') return 'Hostel / Transient';

  return clean
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Utility function to format Philippine phone numbers into clean spaced strings (+63 9XX XXX XXXX)
export function formatPhoneNumber(phone: any): string {
  if (!phone || phone === 'N/A') return 'N/A';
  const raw = String(phone).trim();
  const digits = raw.replace(/[^\d+]/g, '');

  if (digits.startsWith('+639') && digits.length === 13) {
    return `+63 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  if (digits.startsWith('639') && digits.length === 12) {
    return `+63 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  if (digits.startsWith('09') && digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return raw;
}

