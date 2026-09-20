import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

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
  [/balcony|terrace/i, 'Square'],
  [/curtain|blinds/i, 'Blinds'],
  [/tv|television/i, 'Tv'],
  [/elevator|lift/i, 'Building2'],
  [/generator|power/i, 'Zap'],
];

/**
 * Safely resolves a Lucide Icon component dynamically by its exact string name set in the database (e.g., "Wifi", "ShieldCheck", "User", "Users", "Building"),
 * or by intelligent keyword matching against common feature & amenity names.
 */
export function getDynamicIcon(iconName?: string | null, fallbackIcon: any = Sparkles): React.ComponentType<any> {
  const fallback = typeof fallbackIcon === 'string'
    ? (LucideIcons as Record<string, any>)[fallbackIcon] || Sparkles
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
    
    // Direct lookup
    const direct = (LucideIcons as Record<string, any>)[key];
    if (direct && typeof direct !== 'string' && direct !== Sparkles) return direct;

    // PascalCase lookup
    const pascal = key
      .replace(/(?:^|[\s-_])([a-z0-9])/gi, (_, char) => char.toUpperCase())
      .replace(/[\s-_]/g, '');
    const pascalComp = (LucideIcons as Record<string, any>)[pascal];
    if (pascalComp && typeof pascalComp !== 'string' && pascalComp !== Sparkles) return pascalComp;

    return null;
  };

  // Helper to check keyword matches on a text string
  const getKeywordIcon = (text: string) => {
    if (!text) return null;
    for (const [pattern, lucideKey] of FEATURE_ICON_KEYWORD_MAP) {
      if (pattern.test(text)) {
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

