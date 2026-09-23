"use client";

import React, { useMemo } from "react";
import SafeImage from "../common/SafeImage";
import Link from "next/link";
import { formatPrice, calculateAverageRating } from "@/utils/helper";
import { computeStudentBadges } from "./compare-utils";
import { getDynamicIcon } from "@/lib/iconResolver";
import { 
  Star, 
  Sparkles,
  MapPin,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  DoorOpen,
  DollarSign,
  Award,
  Layers,
  Zap,
  Users,
  FileSpreadsheet
} from "lucide-react";

export interface CompareTableViewProps {
  listings: any[];
  attributes?: any[];
  dbSubGroups?: any[];
  resolveAmenityName?: (id: string) => string;
  getItemIcon?: (name: string, attrId?: string, explicitIcon?: string) => any;
  onClose: () => void;
  clearListings: () => void;
  onExportCsv?: () => void;
}

export interface SubGroupItem {
  key: string;
  title: string;
  tabLabel: string;
  displayOrder: number;
  type?: string;
  attributes: any[];
}

// Helper to check if a listing possesses a database attribute
export const checkListingHasAttribute = (l: any, attr: any): boolean => {
  if (!l || !attr) return false;

  const attrId = String(attr.id || attr._id || '');
  const attrName = String(attr.name || attr.label || '').toLowerCase();
  const attrCode = String(attr.code || '').toLowerCase();

  // 1. Check listingLinks
  if (Array.isArray(l.listingLinks)) {
    const foundLink = l.listingLinks.some((link: any) => {
      const linkId = String(link.attributeId || link.attribute?.id || link.attribute?._id || '');
      const linkName = String(link.attribute?.name || '').toLowerCase();
      const linkCode = String(link.attribute?.code || '').toLowerCase();
      return (
        (attrId && linkId === attrId) ||
        (attrName && linkName === attrName) ||
        (attrCode && linkCode === attrCode)
      );
    });
    if (foundLink) return true;
  }

  // 2. Check amenities_list or amenities
  const rawAmenities = [
    ...(Array.isArray(l.amenities_list) ? l.amenities_list : []),
    ...(Array.isArray(l.amenities) ? l.amenities : []),
  ];
  if (rawAmenities.length > 0) {
    const foundAmenity = rawAmenities.some((item: any) => {
      if (!item) return false;
      const str = String(typeof item === 'string' ? item : (item.id || item.name || '')).toLowerCase();
      return (
        (attrId && str === attrId.toLowerCase()) ||
        (attrName && str === attrName) ||
        (attrCode && str === attrCode) ||
        (str.includes('|') && str.startsWith(attrId.toLowerCase() + '|'))
      );
    });
    if (foundAmenity) return true;
  }

  // 3. Check features
  const features = l.features || {};
  if (Array.isArray(features.customFeatures)) {
    const foundCF = features.customFeatures.some((item: any) => {
      const str = String(typeof item === 'string' ? item : (item.id || item.name || '')).toLowerCase();
      return (attrId && str === attrId.toLowerCase()) || (attrName && str === attrName);
    });
    if (foundCF) return true;
  }
  if (features.cctv && (attrName.includes('cctv') || attrName.includes('camera'))) return true;
  if (features.security24h && (attrName.includes('24/7') || attrName.includes('guard'))) return true;
  if (features.fireSafety && (attrName.includes('fire') || attrName.includes('extinguisher'))) return true;

  // 4. Check rules
  const rules = l.rules || {};
  if (Array.isArray(rules.customRules)) {
    const foundCR = rules.customRules.some((item: any) => {
      const str = String(typeof item === 'string' ? item : (item.id || item.name || '')).toLowerCase();
      return (attrId && str === attrId.toLowerCase()) || (attrName && str === attrName);
    });
    if (foundCR) return true;
  }
  if (rules.noCurfew && (attrName.includes('curfew') || attrName.includes('24/7 access'))) return true;
  if (rules.visitorsAllowed && (attrName.includes('visitor') || attrName.includes('guest'))) return true;
  if (rules.petsAllowed && attrName.includes('pet')) return true;

  return false;
};

// Map sub-group key to human student-friendly label and color coding
export const getSubGroupTheme = (key: string, rawTitle?: string, type?: string) => {
  const k = key.toUpperCase();
  const lowerTitle = (rawTitle || '').toLowerCase();

  // 1. SECURITY & SAFETY (Amber/Orange Theme)
  if (k.includes('SECURITY') || k.includes('DISASTER') || k.includes('SAFETY') || type === 'FEATURE' || lowerTitle.includes('security') || lowerTitle.includes('safety')) {
    let label = 'Security & Safety Features';
    if (k === 'SECURITY') label = 'Security & Gate Access';
    if (k === 'DISASTER_PREP' || k === 'DISASTER_SAFETY') label = 'Emergency & Disaster Safety';

    return {
      label: rawTitle ? rawTitle.replace(/^Step \d+-\d+:\s*/i, '') : label,
      theme: 'AMBER',
      Icon: ShieldCheck,
      bgHeader: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      subHeader: 'bg-amber-500/10 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/20',
      iconColor: 'text-amber-500 dark:text-amber-400'
    };
  }

  // 2. RULES & POLICIES (Purple/Violet Theme)
  if (k.includes('POLICY') || k.includes('CURFEW') || k.includes('RULE') || type === 'RULE' || lowerTitle.includes('policy') || lowerTitle.includes('rule') || lowerTitle.includes('curfew')) {
    let label = 'House Rules & Policies';
    if (k === 'GENDER_POLICY') label = 'Gender & Co-living Policy';
    if (k === 'CURFEW') label = 'Gate Access & Curfew Rules';
    if (k === 'VISITOR_POLICY') label = 'Visitor & Guest Rules';
    if (k === 'PET_POLICY') label = 'Pet Policy';

    return {
      label: rawTitle ? rawTitle.replace(/^Step \d+-\d+:\s*/i, '') : label,
      theme: 'PURPLE',
      Icon: FileText,
      bgHeader: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      subHeader: 'bg-purple-500/10 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-500/20',
      iconColor: 'text-purple-500 dark:text-purple-400'
    };
  }

  // 3. SHARED AMENITIES & COMFORTS (Blue Theme)
  let label = rawTitle ? rawTitle.replace(/^Step \d+-\d+:\s*/i, '') : key.replace(/_/g, ' ');
  if (k === 'STORES') label = 'Nearby Essentials & Daily Stores';
  if (k === 'WIFI') label = 'Internet & High-Speed WiFi';
  if (k === 'POWER_WATER') label = 'Backup Power & Water Supply';
  if (k === 'PARKING') label = 'Vehicle & Parking Setup';
  if (k === 'LAUNDRY') label = 'Laundry & Washing Facilities';
  if (k === 'STUDY_LOUNGE') label = 'Shared Study & Lounge Areas';
  if (k === 'CARETAKER') label = 'Management & Caretaker Onsite';
  if (k === 'GARDEN') label = 'Outdoor & Green Spaces';
  if (k === 'COOLING') label = 'Aircon & Room Cooling';
  if (k === 'FURNITURE') label = 'Bedroom Furniture & Storage';
  if (k === 'BATHROOM_FIX') label = 'Bathroom Setup & Fixtures';

  return {
    label,
    theme: 'BLUE',
    Icon: Sparkles,
    bgHeader: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    subHeader: 'bg-blue-500/10 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-500/20',
    iconColor: 'text-blue-500 dark:text-blue-400'
  };
};

// Global Export Helper function for CSV / Excel
export const exportCompareListingsToCsv = (
  listings: any[],
  attributes: any[] = [],
  dbSubGroups: any[] = []
) => {
  if (!listings || listings.length === 0) return;

  const comparedPropertyTypeNames = new Set<string>();
  listings.forEach(l => {
    if (l.propertyType?.name) comparedPropertyTypeNames.add(l.propertyType.name);
    if (Array.isArray(l.category)) {
      l.category.forEach((c: any) => {
        if (typeof c === 'string') comparedPropertyTypeNames.add(c);
        else if (c.name) comparedPropertyTypeNames.add(c.name);
      });
    } else if (typeof l.category === 'string') {
      comparedPropertyTypeNames.add(l.category);
    }
  });
  const propTypesArr = Array.from(comparedPropertyTypeNames);

  const relevantAttributes = attributes.filter(attr => {
    const isPossessed = listings.some(l => checkListingHasAttribute(l, attr));
    if (isPossessed) return true;
    const attrPropTypeNames: string[] = Array.isArray(attr.propertyTypeNames)
      ? attr.propertyTypeNames
      : (Array.isArray(attr.propertyTypes) ? attr.propertyTypes.map((pt: any) => pt.name) : []);
    if (attrPropTypeNames.length > 0 && propTypesArr.length > 0) {
      const matchesPropertyType = attrPropTypeNames.some(ptName =>
        propTypesArr.some(cpt => cpt.toLowerCase() === String(ptName).toLowerCase())
      );
      return matchesPropertyType && isPossessed;
    }
    return false;
  });

  const subGroupMap = new Map<string, SubGroupItem>();
  if (dbSubGroups && dbSubGroups.length > 0) {
    dbSubGroups.forEach(sg => {
      subGroupMap.set(sg.key, {
        key: sg.key,
        title: sg.title || sg.tabLabel || sg.key,
        tabLabel: sg.tabLabel || sg.title || sg.key,
        displayOrder: sg.displayOrder ?? 99,
        type: sg.type,
        attributes: []
      });
    });
  }

  relevantAttributes.forEach(attr => {
    const sgKey = attr.subGroupKey || attr.subGroup || 'GENERAL';
    if (!subGroupMap.has(sgKey)) {
      subGroupMap.set(sgKey, {
        key: sgKey,
        title: sgKey.replace(/_/g, ' '),
        tabLabel: sgKey.replace(/_/g, ' '),
        displayOrder: 99,
        type: attr.type,
        attributes: []
      });
    }
    subGroupMap.get(sgKey)?.attributes.push(attr);
  });

  const dynamicSubGroups = Array.from(subGroupMap.values())
    .filter(group => group.attributes.length > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const categorizedSections = [
    { id: 'AMENITIES', title: 'SHARED AMENITIES & FACILITIES', subGroups: [] as SubGroupItem[] },
    { id: 'SECURITY', title: 'SAFETY & DISASTER SECURITY', subGroups: [] as SubGroupItem[] },
    { id: 'RULES', title: 'HOUSE RULES & POLICIES', subGroups: [] as SubGroupItem[] }
  ];

  dynamicSubGroups.forEach(group => {
    const { theme } = getSubGroupTheme(group.key, group.tabLabel || group.title, group.type);
    if (theme === 'AMBER') categorizedSections[1].subGroups.push(group);
    else if (theme === 'PURPLE') categorizedSections[2].subGroups.push(group);
    else categorizedSections[0].subGroups.push(group);
  });

  const activeSections = categorizedSections.filter(sec => sec.subGroups.length > 0);

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[][] = [];

  // 1. Header Row
  rows.push(["Feature / Attribute", ...listings.map(l => l.title || "Property")]);

  // 2. Overview & Pricing
  rows.push(["--- OVERVIEW & PRICING ---", ...listings.map(() => "")]);
  rows.push(["Location / Area", ...listings.map(l => l.region || l.city || "Tarlac")]);
  rows.push(["Monthly Base Rent", ...listings.map(l => `₱${formatPrice(l.price)}`)]);

  rows.push(["Average Rating", ...listings.map(l => {
    const reviews = l.reviews || [];
    const reviewCount = l.reviewCount || reviews.length || 0;
    const avg = calculateAverageRating(reviews, reviewCount > 0 ? l.rating : null);
    return avg ? `${Number(avg).toFixed(1)} / 5 (${reviewCount} reviews)` : "New (No reviews)";
  })]);

  rows.push(["Smart Badges", ...listings.map(l => {
    const badges = computeStudentBadges(l, listings);
    return badges.map(b => b.label).join("; ");
  })]);

  rows.push(["Room Options", ...listings.map(l => {
    const rooms = l.roomOptions || l.rooms || [];
    if (!rooms.length) return "N/A";
    return rooms.map((r: any) => `${r.name || r.title || 'Room'} (₱${formatPrice(r.price)})`).join("; ");
  })]);

  // 3. Categorized Sections (Shared Amenities, Security, House Rules)
  activeSections.forEach(section => {
    rows.push([`--- ${section.title} ---`, ...listings.map(() => "")]);

    section.subGroups.forEach(group => {
      const { label } = getSubGroupTheme(group.key, group.tabLabel || group.title, group.type);
      rows.push([`[ ${label.toUpperCase()} ]`, ...listings.map(() => "")]);

      group.attributes.forEach((attr: any) => {
        const attrName = attr.name || attr.label || "Attribute";
        const attrRow = [
          attrName,
          ...listings.map(l => checkListingHasAttribute(l, attr) ? "✓ Included" : "✕ Not Included")
        ];
        rows.push(attrRow);
      });
    });
  });

  const csvContent = "\uFEFF" + rows.map(row => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `BoardTAU_Property_Comparison_${dateStr}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const CompareTableView: React.FC<CompareTableViewProps> = ({
  listings,
  attributes = [],
  dbSubGroups = [],
  getItemIcon,
  onClose,
  clearListings,
  onExportCsv
}) => {
  // Extract all property types / categories present in the compared listings
  const comparedPropertyTypeNames = useMemo(() => {
    const names = new Set<string>();
    listings.forEach(l => {
      if (l.propertyType?.name) names.add(l.propertyType.name);
      if (Array.isArray(l.category)) {
        l.category.forEach((c: any) => {
          if (typeof c === 'string') names.add(c);
          else if (c.name) names.add(c.name);
        });
      } else if (typeof l.category === 'string') {
        names.add(l.category);
      }
    });
    return Array.from(names);
  }, [listings]);

  // Filter attributes based on compared listings' property types AND actual presence
  const relevantAttributes = useMemo(() => {
    if (!attributes || attributes.length === 0) return [];

    return attributes.filter(attr => {
      // 1. Is this attribute possessed by AT LEAST ONE compared listing?
      const isPossessed = listings.some(l => checkListingHasAttribute(l, attr));
      if (isPossessed) return true;

      // 2. Check if this attribute specifically applies to the compared listings' property types
      const attrPropTypeNames: string[] = Array.isArray(attr.propertyTypeNames)
        ? attr.propertyTypeNames
        : (Array.isArray(attr.propertyTypes) ? attr.propertyTypes.map((pt: any) => pt.name) : []);

      if (attrPropTypeNames.length > 0 && comparedPropertyTypeNames.length > 0) {
        const matchesPropertyType = attrPropTypeNames.some(ptName =>
          comparedPropertyTypeNames.some(cpt => cpt.toLowerCase() === String(ptName).toLowerCase())
        );
        return matchesPropertyType && isPossessed;
      }

      return false;
    });
  }, [attributes, listings, comparedPropertyTypeNames]);

  // Group dynamic database attributes by AttributeSubGroup
  const dynamicSubGroups = useMemo<SubGroupItem[]>(() => {
    if (!relevantAttributes || relevantAttributes.length === 0) return [];

    const subGroupMap = new Map<string, SubGroupItem>();

    if (dbSubGroups && dbSubGroups.length > 0) {
      dbSubGroups.forEach(sg => {
        subGroupMap.set(sg.key, {
          key: sg.key,
          title: sg.title || sg.tabLabel || sg.key,
          tabLabel: sg.tabLabel || sg.title || sg.key,
          displayOrder: sg.displayOrder ?? 99,
          type: sg.type,
          attributes: []
        });
      });
    }

    relevantAttributes.forEach(attr => {
      const sgKey = attr.subGroupKey || attr.subGroup || 'GENERAL';
      if (!subGroupMap.has(sgKey)) {
        subGroupMap.set(sgKey, {
          key: sgKey,
          title: sgKey.replace(/_/g, ' '),
          tabLabel: sgKey.replace(/_/g, ' '),
          displayOrder: 99,
          type: attr.type,
          attributes: []
        });
      }
      subGroupMap.get(sgKey)?.attributes.push(attr);
    });

    const groups = Array.from(subGroupMap.values())
      .filter(group => group.attributes.length > 0)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return groups;
  }, [dbSubGroups, relevantAttributes]);

  // Group dynamic database attributes into 3 Major Top-Level Sections: SHARED AMENITIES, SECURITY & SAFETY, HOUSE RULES
  const categorizedSections = useMemo(() => {
    if (!dynamicSubGroups || dynamicSubGroups.length === 0) return [];

    const sections: {
      id: string;
      title: string;
      bgHeader: string;
      Icon: any;
      subGroups: SubGroupItem[];
    }[] = [
      {
        id: 'AMENITIES',
        title: 'SHARED AMENITIES & FACILITIES',
        bgHeader: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        Icon: Sparkles,
        subGroups: []
      },
      {
        id: 'SECURITY',
        title: 'SAFETY & DISASTER SECURITY',
        bgHeader: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        Icon: ShieldCheck,
        subGroups: []
      },
      {
        id: 'RULES',
        title: 'HOUSE RULES & POLICIES',
        bgHeader: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
        Icon: FileText,
        subGroups: []
      }
    ];

    dynamicSubGroups.forEach((group: SubGroupItem) => {
      const { theme } = getSubGroupTheme(group.key, group.tabLabel || group.title, group.type);
      if (theme === 'AMBER') {
        sections[1].subGroups.push(group);
      } else if (theme === 'PURPLE') {
        sections[2].subGroups.push(group);
      } else {
        sections[0].subGroups.push(group);
      }
    });

    return sections.filter(sec => sec.subGroups.length > 0);
  }, [dynamicSubGroups]);

  // Export comparison table to CSV / Excel spreadsheet
  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv();
    } else {
      exportCompareListingsToCsv(listings, attributes, dbSubGroups);
    }
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar px-1 sm:px-4 pb-2 sm:pb-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <table className="w-full text-left border-collapse min-w-0 sm:min-w-[780px] table-fixed">
        <colgroup>
          <col className="w-[170px] sm:w-[280px]" />
          {listings.map((l) => (
            <col key={l.id} className="w-[85px] sm:w-[280px]" />
          ))}
        </colgroup>

        {/* Solid Floating Sticky Header */}
        <thead className="sticky top-0 z-30 bg-white dark:bg-slate-900 shadow-sm">
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* Top-Left Corner Cell: Frozen both top & left */}
            <th className="p-2 sm:p-3.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[170px] sm:w-[280px] align-top bg-white dark:bg-slate-900 sticky top-0 left-0 z-40 border-r border-b border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col gap-1 sm:gap-2 p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[#2f7d6d] dark:text-emerald-400 font-black text-xs sm:text-sm">
                  <Sparkles size={14} className="text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
                  <span>Comparison</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[9px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="px-1.5 py-0.5 rounded-md bg-[#2f7d6d]/15 text-[#2f7d6d] dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold text-[8px] sm:text-[10px]">
                    {listings.length} Props
                  </span>
                  <span className="hidden sm:inline">Side-by-side</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="mt-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#2f7d6d] hover:bg-[#256558] text-white font-bold text-[9px] sm:text-xs transition shadow-2xs cursor-pointer w-full active:scale-95"
                  title="Export comparison sheet to Excel / CSV"
                >
                  <FileSpreadsheet size={13} className="shrink-0" />
                  <span className="truncate">Export Sheet</span>
                </button>
              </div>
            </th>
            {listings.map((l) => {
              const reviews = l.reviews || [];
              const reviewCount = l.reviewCount || reviews.length || 0;
              const avgRatingRaw = calculateAverageRating(reviews, reviewCount > 0 ? l.rating : null);
              const avgRating = (reviewCount > 0 && avgRatingRaw) ? Number(avgRatingRaw).toFixed(1) : null;

              return (
                <th key={l.id} className="p-1.5 sm:p-3.5 text-sm font-black text-slate-900 dark:text-white align-top bg-white dark:bg-slate-900 sticky top-0 z-30">
                  <div className="group relative flex flex-col items-center sm:items-stretch text-center sm:text-left gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-[#2f7d6d]/50 transition-all">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-1.5 right-1.5 sm:left-3 sm:right-3 h-0.5 bg-gradient-to-r from-[#2f7d6d] to-emerald-400 rounded-full opacity-80 group-hover:opacity-100 transition-opacity" />

                    <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 pt-0.5">
                      <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs bg-slate-100 dark:bg-slate-800">
                        <SafeImage src={l.imageSrc} alt={l.title} />
                      </div>
                      <div className="min-w-0 flex-1 text-center sm:text-left w-full">
                        <span className="truncate block font-black text-[11px] sm:text-sm text-slate-900 dark:text-white leading-tight" title={l.title}>
                          {l.title}
                        </span>
                        <div className="flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                          <span className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5 min-w-0 truncate">
                            <MapPin size={9} className="text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{l.region || 'Tarlac'}</span>
                          </span>
                          <div className="hidden sm:flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-amber-500 shrink-0">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span>{avgRating ? avgRating : 'New'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between pt-1 sm:pt-2 border-t border-slate-200/80 dark:border-slate-700/80 w-full gap-1">
                      <div>
                        <span className="hidden sm:block text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Base Rent</span>
                        <span className="text-[11px] sm:text-sm font-black text-[#2f7d6d] dark:text-emerald-400 leading-tight block">
                          ₱{formatPrice(l.price)}
                          <span className="hidden sm:inline text-[9px] sm:text-[10px] font-normal text-slate-400">/mo</span>
                        </span>
                      </div>
                      <Link
                        href={`/listings/${l.id}`}
                        onClick={() => {
                          onClose();
                          clearListings();
                        }}
                        className="w-full sm:w-auto px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-[#2f7d6d] hover:bg-[#256558] text-white font-bold text-[10px] sm:text-xs transition shadow-2xs no-underline cursor-pointer text-center block"
                      >
                        Reserve
                      </Link>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {/* CORE METRICS 1: MONTHLY BASE RENT */}
          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <td className="p-2 sm:p-4 font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] sm:text-[11px] sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign size={14} className="text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
                <span>Monthly Base Rent</span>
              </div>
            </td>
            {listings.map((l) => (
              <td key={l.id} className="p-2 sm:p-4 font-extrabold text-[#2f7d6d] dark:text-emerald-400 text-xs sm:text-base text-center">
                ₱{formatPrice(l.price)}<span className="hidden sm:inline text-xs font-normal text-slate-500"> / month</span>
              </td>
            ))}
          </tr>

          {/* CORE METRICS 2: STUDENT SMART BADGES */}
          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <td className="p-2 sm:p-4 font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] sm:text-[11px] sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Award size={14} className="text-amber-500 shrink-0" />
                <span>Smart Badges</span>
              </div>
            </td>
            {listings.map((l) => (
              <td key={l.id} className="p-1.5 sm:p-4 text-center">
                <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1">
                  {computeStudentBadges(l, listings).map((b, idx) => (
                    <span key={idx} className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider border ${b.bg} ${b.color} ${b.border} shadow-2xs`}>
                      {b.label}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* CORE METRICS 3: REGISTERED ROOM OPTIONS */}
          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <td className="p-2 sm:p-4 font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] sm:text-[11px] sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DoorOpen size={14} className="text-indigo-500 shrink-0" />
                <span>Room Options</span>
              </div>
            </td>
            {listings.map((l) => {
              const rooms = l.rooms || l.roomOptions || [];
              return (
                <td key={l.id} className="p-1.5 sm:p-4 text-center">
                  {rooms.length > 0 ? (
                    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs">
                        {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
                      </span>
                      <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1">
                        {rooms.slice(0, 2).map((r: any, rIdx: number) => {
                          const roomTitle = r.title || r.name || r.roomNumber || `Room #${rIdx + 1}`;
                          const rPrice = r.price ? `₱${formatPrice(r.price)}` : null;

                          return (
                            <span key={rIdx} className="px-1 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-[8px] sm:text-[9px] font-bold">
                              {roomTitle} {rPrice ? `(${rPrice})` : ''}
                            </span>
                          );
                        })}
                        {rooms.length > 2 && (
                          <span className="text-[8px] text-slate-400 font-bold self-center">+{rooms.length - 2}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[10px]">None</span>
                  )}
                </td>
              );
            })}
          </tr>

          {/* DYNAMIC DATABASE TAXONOMY GROUPED BY 3 MAJOR TOP-LEVEL SECTIONS */}
          {categorizedSections.map((sec) => {
            const SectionIcon = sec.Icon;

            return (
              <React.Fragment key={sec.id}>
                {/* Major Category Section Banner Header */}
                <tr className={`font-black text-xs uppercase tracking-wider border-y ${sec.bgHeader}`}>
                  <td colSpan={listings.length + 1} className="px-2.5 sm:px-4 py-1.5 sm:py-3">
                    <div className="sticky left-2 sm:left-4 flex items-center gap-1.5 sm:gap-2 font-extrabold text-[11px] sm:text-sm max-w-max">
                      <SectionIcon size={15} className="shrink-0" />
                      <span>{sec.title}</span>
                    </div>
                  </td>
                </tr>

                {/* Sub-Groups belonging to this Section */}
                {sec.subGroups.map((group: SubGroupItem) => {
                  const { label, Icon: SubGroupIcon, subHeader, iconColor } = getSubGroupTheme(group.key, group.tabLabel || group.title, group.type);

                  return (
                    <React.Fragment key={group.key}>
                      {/* Sub-Group Mini Header with Parent Theme Color */}
                      <tr className={`text-[9px] sm:text-[11px] font-black uppercase tracking-wider border-y ${subHeader || 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80'}`}>
                        <td colSpan={listings.length + 1} className="px-2.5 sm:px-4 py-1 sm:py-2.5">
                          <div className="sticky left-2 sm:left-4 flex items-center gap-1 sm:gap-2 pl-0.5 sm:pl-2 max-w-max">
                            <SubGroupIcon size={12} className={`shrink-0 ${iconColor || 'text-[#2f7d6d] dark:text-emerald-400'}`} />
                            <span className="font-extrabold">{label}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Attribute Rows */}
                      {group.attributes.map((attr: any) => {
                        const IconComponent = getItemIcon 
                          ? getItemIcon(attr.name, attr.id, attr.icon) 
                          : getDynamicIcon(attr.icon);

                        const iconBadgeClass = sec.id === 'AMENITIES'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : sec.id === 'SECURITY'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400';

                        return (
                          <tr key={attr.id || attr.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            {/* Frozen Left Feature Label Cell */}
                            <td className="p-2 sm:p-3.5 pl-2 sm:pl-5 font-bold text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">
                              <div className="flex items-center gap-1.5 sm:gap-2.5">
                                <div className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${iconBadgeClass}`}>
                                  <IconComponent size={13} className="shrink-0" />
                                </div>
                                <span className="line-clamp-2 leading-tight">{attr.name}</span>
                              </div>
                            </td>
                            {listings.map((l) => {
                              const hasAttribute = checkListingHasAttribute(l, attr);
                              return (
                                <td key={l.id} className="p-1 sm:p-3.5 align-middle text-center">
                                  {hasAttribute ? (
                                    <>
                                      {/* Desktop Full Badge */}
                                      <div className="hidden sm:inline-flex items-center justify-center gap-1 w-[110px] py-1 rounded-full bg-[#2f7d6d]/15 text-[#2f7d6d] dark:bg-emerald-500/20 dark:text-emerald-400 border border-[#2f7d6d]/30 dark:border-emerald-500/30 font-bold text-xs shadow-2xs">
                                        <CheckCircle2 size={12} className="shrink-0 text-[#2f7d6d] dark:text-emerald-400" />
                                        <span>Included</span>
                                      </div>
                                      {/* Mobile Compact Icon Badge */}
                                      <div className="inline-flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-[#2f7d6d]/15 text-[#2f7d6d] dark:bg-emerald-500/20 dark:text-emerald-400 border border-[#2f7d6d]/30 dark:border-emerald-500/30 font-black shadow-2xs mx-auto">
                                        <CheckCircle2 size={14} className="shrink-0 text-[#2f7d6d] dark:text-emerald-400" />
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {/* Desktop Full Badge */}
                                      <div className="hidden sm:inline-flex items-center justify-center gap-1 w-[110px] py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 font-medium text-xs">
                                        <XCircle size={12} className="shrink-0 opacity-50" />
                                        <span className="line-through">Not Available</span>
                                      </div>
                                      {/* Mobile Compact Icon Badge */}
                                      <div className="inline-flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 font-medium mx-auto">
                                        <XCircle size={14} className="shrink-0 opacity-40" />
                                      </div>
                                    </>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* CORE METRICS 4: HOST & REVIEWS */}
          <tr className="bg-slate-100/80 dark:bg-slate-800/70 font-black text-slate-800 dark:text-slate-200 text-[10px] sm:text-[11px] uppercase tracking-wider">
            <td colSpan={listings.length + 1} className="px-3 sm:px-4 py-2 sm:py-2.5">
              <div className="sticky left-2 sm:left-4 max-w-max">
                <span>Host Verification & Student Ratings</span>
              </div>
            </td>
          </tr>

          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <td className="p-2 sm:p-4 font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] sm:text-[11px] sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">Property Host</td>
            {listings.map((l) => (
              <td key={l.id} className="p-2 sm:p-4 text-slate-700 dark:text-slate-300 text-center">
                <span className="font-extrabold block text-slate-900 dark:text-white text-[11px] sm:text-sm truncate">{l.user?.name || 'BoardTAU Host'}</span>
                <span className="text-[8px] sm:text-[10px] text-[#2f7d6d] dark:text-emerald-400 font-bold block truncate">✓ Official Host</span>
              </td>
            ))}
          </tr>

          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <td className="p-2 sm:p-4 font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] sm:text-[11px] sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">Student Reviews</td>
            {listings.map((l) => {
              const reviews = l.reviews || [];
              const reviewCount = l.reviewCount || reviews.length || 0;
              const avgRatingRaw = calculateAverageRating(reviews, reviewCount > 0 ? l.rating : null);
              const avgRating = (reviewCount > 0 && avgRatingRaw) ? Number(avgRatingRaw).toFixed(1) : null;
              return (
                <td key={l.id} className="p-2 sm:p-4 text-slate-700 dark:text-slate-300 text-center">
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-amber-500 font-extrabold text-[11px] sm:text-sm">
                    <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                    <span>{avgRating ? avgRating : 'New'}</span>
                    <span className="text-slate-400 font-normal text-[9px] sm:text-xs">({reviewCount})</span>
                  </div>
                </td>
              );
            })}
          </tr>

          {/* ACTION BUTTON */}
          <tr className="bg-slate-50 dark:bg-slate-800/40">
            <td className="p-2 sm:p-4 font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] sm:text-[11px] sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs">Direct Reserve</td>
            {listings.map((l) => (
              <td key={l.id} className="p-2 sm:p-4 text-center">
                <Link
                  href={`/listings/${l.id}`}
                  onClick={() => {
                    onClose();
                    clearListings();
                  }}
                  className="block w-full text-center px-2 py-1.5 sm:px-4 sm:py-3 rounded-xl bg-[#2f7d6d] hover:bg-[#256558] text-white font-extrabold text-[10px] sm:text-xs transition shadow-md no-underline cursor-pointer"
                >
                  Reserve
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
