import React from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Sparkles,
  ShieldCheck,
  Camera,
  Lock,
  Zap,
  AlertTriangle,
  HeartPulse,
  Waves,
  Flame,
  Bell,
  Shield,
  UserCheck,
  Clock,
  Users,
  UserX,
  PawPrint,
  CigaretteOff,
  WineOff,
  Store,
  ShoppingBag,
  Wifi,
  Wind,
  Fan,
  Droplets,
  WashingMachine,
  Utensils,
  Refrigerator,
  Microwave,
  Car,
  Dumbbell,
  BookOpen,
  Bed,
  Trees,
  Blinds,
  Tv,
  Building2,
  Ban,
  CheckCircle2,
  FileText,
  MapPin,
  DoorOpen,
  Star,
  BadgeCheck,
  Warehouse,
  Bike,
  CircleDot,
  Sun,
  Sofa,
  Droplet,
  User,
  Wrench,
  UtensilsCrossed,
  ShowerHead,
  Laptop,
  Archive,
  Square,
  CreditCard,
  KeyRound,
  Fingerprint,
  AlertCircle,
  Cross,
  DoorClosed,
  Home,
  Hotel,
  Sprout,
  Building
} from 'lucide-react';

// Static Icon Map prevents Turbopack from tree-shaking icons away when dynamically requested
const STATIC_ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sparkles,
  ShieldCheck,
  Camera,
  Lock,
  Zap,
  AlertTriangle,
  HeartPulse,
  Waves,
  Flame,
  Bell,
  Shield,
  UserCheck,
  Clock,
  Users,
  UserX,
  PawPrint,
  CigaretteOff,
  WineOff,
  Store,
  ShoppingBag,
  Wifi,
  Wind,
  Fan,
  Droplets,
  WashingMachine,
  Utensils,
  Refrigerator,
  Microwave,
  Car,
  Dumbbell,
  BookOpen,
  Bed,
  Trees,
  Blinds,
  Tv,
  Building2,
  Ban,
  CheckCircle2,
  FileText,
  MapPin,
  DoorOpen,
  Star,
  BadgeCheck,
  Warehouse,
  Bike,
  CircleDot,
  Sun,
  Sofa,
  Droplet,
  User,
  Wrench,
  UtensilsCrossed,
  ShowerHead,
  Laptop,
  Archive,
  Square,
  CreditCard,
  KeyRound,
  Fingerprint,
  AlertCircle,
  Cross,
  DoorClosed,
  Home,
  Hotel,
  Sprout,
  Building,
};

// Common keyword fallback map for attributes, features, rules, and amenities
const FEATURE_ICON_KEYWORD_MAP: [RegExp, string][] = [
  // Security & Safety
  [/24\/7|security guard|guard/i, 'ShieldCheck'],
  [/cctv|camera|surveillance/i, 'Camera'],
  [/keycard|rfid|door lock|smart lock|digital lock/i, 'Lock'],
  [/emergency hallway|emergency light|hallway light/i, 'Zap'],
  [/emergency/i, 'AlertTriangle'],
  [/first aid|medical|firstaid/i, 'HeartPulse'],
  [/flood-free|flood free|flood/i, 'Waves'],
  [/fire extinguisher|fire safety|fire alarm|fire/i, 'Flame'],
  [/smoke detector|smoke alarm/i, 'Flame'],
  [/alarm|security system/i, 'Bell'],
  [/fence|gated/i, 'Shield'],

  // Rules & Policies
  [/visitor|guest/i, 'UserCheck'],
  [/curfew/i, 'Clock'],
  [/female only|male only|gender/i, 'Users'],
  [/pet/i, 'PawPrint'],
  [/smoke|smoking/i, 'CigaretteOff'],
  [/alcohol|drinking/i, 'WineOff'],

  // Shared Amenities & Comfort
  [/convenience store|sari-sari|sari sari|store|shop/i, 'Store'],
  [/carinderia|eatery/i, 'Utensils'],
  [/water refilling|water tank|water pump|poso/i, 'Droplets'],
  [/wifi|wi-fi|internet/i, 'Wifi'],
  [/aircon|air conditioning|ac\b|cooling/i, 'Wind'],
  [/fan/i, 'Fan'],
  [/shower|water heater|hot water/i, 'Droplets'],
  [/laundry|washing machine|washer/i, 'WashingMachine'],
  [/kitchen|cooking|dining/i, 'Utensils'],
  [/fridge|refrigerator/i, 'Refrigerator'],
  [/microwave/i, 'Microwave'],
  [/parking|garage/i, 'Car'],
  [/pool|swimming/i, 'Waves'],
  [/gym|fitness/i, 'Dumbbell'],
  [/study|desk|table/i, 'BookOpen'],
  [/bed|mattress/i, 'Bed'],
  [/balcony|veranda|terrace|roof deck|garden/i, 'Trees'],
  [/curtain|blinds/i, 'Blinds'],
  [/tv|television/i, 'Tv'],
  [/elevator|lift/i, 'Building2'],
  [/caretaker|housekeeping|maintenance/i, 'UserCheck'],
  [/generator|power/i, 'Zap'],
];

/**
 * Safely resolves a Lucide Icon component dynamically by its exact string name set in the database (e.g., "Wifi", "ShieldCheck", "User", "Users", "Building"),
 * or by intelligent keyword matching against common feature & amenity names.
 */
export function getDynamicIcon(iconName?: string | null, fallbackIcon: any = Sparkles): React.ComponentType<any> {
  const fallback = typeof fallbackIcon === 'string'
    ? (STATIC_ICON_MAP[fallbackIcon] || (LucideIcons as Record<string, any>)[fallbackIcon] || Sparkles)
    : fallbackIcon || Sparkles;

  if (!iconName) {
    return fallback;
  }

  const rawStr = String(iconName).trim();
  let labelPart = rawStr;
  let iconPart = '';

  if (rawStr.includes('|')) {
    const parts = rawStr.split('|');
    labelPart = parts[0].trim();
    iconPart = parts[1]?.trim() || '';
  }

  // Helper to test if a key resolves to a valid non-Sparkles Lucide icon
  const getSpecificIcon = (key?: string | null) => {
    if (!key || key === 'Sparkles' || key === 'Sparkle') return null;

    // Check Static Map first (prevents Turbopack tree-shaking missing module factory errors)
    if (STATIC_ICON_MAP[key]) return STATIC_ICON_MAP[key];
    
    // Direct lookup fallback
    const direct = (LucideIcons as Record<string, any>)[key];
    if (direct && typeof direct !== 'string' && direct !== Sparkles) return direct;

    // PascalCase lookup
    const pascal = key
      .replace(/(?:^|[\s-_])([a-z0-9])/gi, (_, char) => char.toUpperCase())
      .replace(/[\s-_]/g, '');
    if (STATIC_ICON_MAP[pascal]) return STATIC_ICON_MAP[pascal];

    const pascalComp = (LucideIcons as Record<string, any>)[pascal];
    if (pascalComp && typeof pascalComp !== 'string' && pascalComp !== Sparkles) return pascalComp;

    return null;
  };

  // Helper to check keyword matches on a text string
  const getKeywordIcon = (text: string) => {
    if (!text) return null;
    for (const [pattern, lucideKey] of FEATURE_ICON_KEYWORD_MAP) {
      if (pattern.test(text)) {
        if (STATIC_ICON_MAP[lucideKey]) return STATIC_ICON_MAP[lucideKey];
        const MatchedComp = (LucideIcons as Record<string, any>)[lucideKey];
        if (MatchedComp && typeof MatchedComp !== 'string') {
          return MatchedComp;
        }
      }
    }
    return null;
  };

  // 1. If an explicit icon part was provided (e.g. "Label|Camera"), try resolving it first if it's not generic Sparkles
  if (iconPart) {
    const explicitIcon = getSpecificIcon(iconPart);
    if (explicitIcon) return explicitIcon;
  }

  // 2. Perform keyword matching on the human label (e.g. "24/7 Security Guard", "CCTV Cameras", "RFID Keycard Door Lock")
  const keywordIcon = getKeywordIcon(labelPart);
  if (keywordIcon) return keywordIcon;

  // 3. Try resolving the labelPart itself directly if it happens to be a valid Lucide icon name (e.g. "Wifi", "ShieldCheck", "Building")
  const directLabelIcon = getSpecificIcon(labelPart);
  if (directLabelIcon) return directLabelIcon;

  // 4. Final fallback
  return fallback;
}
