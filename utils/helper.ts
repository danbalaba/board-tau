import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US").format(price);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Haversine distance in km between two points (lat/lng in degrees). */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateAverageRating(reviews?: { rating: number }[], fallbackRating?: number | null): number | null {
  if (!reviews || reviews.length === 0) {
    return fallbackRating ?? null;
  }
  const total = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  return total / reviews.length;
}

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

/**
 * Global text normalization helper for BoardTAU.
 * Converts mixed capitalization (e.g., "dAnILo DoRmItOrY", "sTuDiO uNiT") into clean Title Case
 * while preserving standard uppercase acronyms (TAU, CR, AC, BH, 1BR, 2BR, CCTV, RFID).
 */
export function formatCleanTitle(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  const ACRONYMS = new Set([
    'TAU', 'CR', 'AC', 'BH', '1BR', '2BR', '3BR', '4BR', 'CCTV', 'RFID',
    'BFP', 'DTI', 'BIR', 'LGU', 'TV', 'WI-FI', 'WIFI', 'GPS', 'ID', 'SQM'
  ]);

  const LOWERCASE_WORDS = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with'
  ]);

  const words = trimmed.split(/\s+/);

  return words
    .map((word, index) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

      if (ACRONYMS.has(cleanWord)) {
        return word.replace(/[a-zA-Z0-9]+/g, (m) => m.toUpperCase());
      }

      const lowerWord = word.toLowerCase();
      if (index > 0 && index < words.length - 1 && LOWERCASE_WORDS.has(lowerWord)) {
        return lowerWord;
      }

      return word.replace(/[a-zA-Z]+/g, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
    })
    .join(' ');
}
