'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Maximize2,
  ListChecks,
  Shield,
  Star,
  Bed,
  ChevronUp,
  X,
  Search
} from 'lucide-react';
import { getDynamicIcon } from '@/lib/iconResolver';
import { cn } from '@/utils/helper';
import { useIsClient } from '@/hooks/useIsClient';
import {
  getCachedAttributes,
  getCachedSubGroups,
  getSyncAttributes,
  getSyncSubGroups
} from '@/lib/landlordTaxonomyCache';

export interface SharedAmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
  initialCategory?: 'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY' | 'ROOMS';
  amenities?: string[] | any[];
  customRules?: string[];
  customFeatures?: string[];
  rulesObj?: {
    femaleOnly?: boolean;
    maleOnly?: boolean;
    noCurfew?: boolean;
    visitorsAllowed?: boolean;
    petsAllowed?: boolean;
    customRules?: string[];
    [key: string]: any;
  };
  featuresObj?: {
    security24h?: boolean;
    cctv?: boolean;
    fireSafety?: boolean;
    customFeatures?: string[];
    [key: string]: any;
  };
  rooms?: any[];
}

export function SharedAmenitiesModal({
  isOpen,
  onClose,
  propertyTitle = 'Property Features & Rules Breakdown',
  initialCategory = 'ALL',
  amenities = [],
  customRules = [],
  customFeatures = [],
  rulesObj = {},
  featuresObj = {},
  rooms = []
}: SharedAmenitiesModalProps) {
  const isClient = useIsClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY' | 'ROOMS'>(
    initialCategory
  );
  
  const [attributes, setAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    AMENITIES: true,
    RULES: true,
    SECURITY: true,
    ROOMS: true
  });

  useEffect(() => {
    if (!isOpen) return;
    getCachedAttributes().then((attrs) => {
      if (attrs) setAttributes(attrs);
    });
    getCachedSubGroups().then((sgs) => {
      if (sgs) setDbSubGroups(sgs);
    });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveCategory(initialCategory || 'ALL');
    } else {
      setSearchQuery('');
    }
  }, [isOpen, initialCategory]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle || '';
    };
  }, [isOpen]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getItemIcon = (name: string, attrId?: string) => {
    const cleanName = (name || '').trim();
    return getDynamicIcon(cleanName, Sparkles);
  };

  const resolveAmenityName = (attrId: string) => {
    if (!attrId) return '';
    const cleanId = attrId.includes('|') ? attrId.split('|')[0] : attrId;
    const matched = attributes.find(
      (a) =>
        a.id === cleanId ||
        a.value === cleanId ||
        a._id === cleanId ||
        a.code === cleanId ||
        cleanId.startsWith(a.id + '|')
    );
    if (matched) return matched.name || matched.label || matched.title;
    if (!/^[a-f0-9]{24}$/i.test(cleanId)) return cleanId.replace(/-/g, ' ');
    return cleanId;
  };

  const groupedTaxonomy = useMemo(() => {
    const rawAmenitiesList: string[] = Array.isArray(amenities) ? amenities : [];
    const rawRulesList: string[] = [
      ...(Array.isArray(customRules) ? customRules : []),
      ...(Array.isArray(rulesObj.customRules) ? rulesObj.customRules : [])
    ];
    const rawFeaturesList: string[] = [
      ...(Array.isArray(customFeatures) ? customFeatures : []),
      ...(Array.isArray(featuresObj.customFeatures) ? featuresObj.customFeatures : [])
    ];

    const getSubGroupTitle = (key: string, defaultTitle: string) => {
      const matched = dbSubGroups.find((s) => s.key === key);
      return matched?.tabLabel || matched?.title || defaultTitle;
    };

    const amenitiesMap: Record<string, { key: string; label: string; items: string[] }> = {};
    const rulesMap: Record<string, { key: string; label: string; items: string[] }> = {};
    const featuresMap: Record<string, { key: string; label: string; items: string[] }> = {};

    const RULE_SUBGROUPS = new Set([
      'GENDER_POLICY',
      'CURFEW',
      'VISITOR_POLICY',
      'PET_POLICY',
      'SMOKING_POLICY',
      'ALCOHOL_POLICY',
      'SMOKE_ALCOHOL',
      'HOUSE_RULES',
      'POLICY'
    ]);
    const SECURITY_SUBGROUPS = new Set(['SECURITY', 'DISASTER_SAFETY', 'DISASTER_PREP', 'SAFETY', 'FIRE_SAFETY']);

    // Process raw amenities
    rawAmenitiesList.forEach((attrId) => {
      const name = resolveAmenityName(attrId);
      if (!name) return;
      const matched = attributes.find(
        (a) => a.id === attrId || a.value === attrId || a.code === attrId || attrId.startsWith(a.id + '|')
      );
      const key = matched?.subGroupKey || matched?.subGroup || 'STORES';
      const type = matched?.type;
      const lowerName = name.toLowerCase();

      const isSecurity =
        type === 'FEATURE' ||
        SECURITY_SUBGROUPS.has(key) ||
        lowerName.includes('smoke detector') ||
        lowerName.includes('fire extinguisher') ||
        lowerName.includes('first aid') ||
        lowerName.includes('emergency hallway') ||
        lowerName.includes('flood-free') ||
        lowerName.includes('security') ||
        lowerName.includes('cctv') ||
        lowerName.includes('keycard') ||
        lowerName.includes('biometric');

      const isRule =
        !isSecurity &&
        (type === 'RULE' ||
          RULE_SUBGROUPS.has(key) ||
          lowerName.includes('curfew') ||
          lowerName.includes('guest') ||
          lowerName.includes('visitor') ||
          lowerName.includes('pet policy') ||
          (lowerName.includes('smoke') && !lowerName.includes('detector')) ||
          lowerName.includes('alcohol') ||
          lowerName.includes('gender') ||
          lowerName.includes('male & female') ||
          lowerName.includes('female only') ||
          lowerName.includes('male only'));

      if (isSecurity) {
        const label = getSubGroupTitle(key, 'Security & Safety');
        if (!featuresMap[key]) featuresMap[key] = { key, label, items: [] };
        if (!featuresMap[key].items.includes(name)) featuresMap[key].items.push(name);
      } else if (isRule) {
        const label = getSubGroupTitle(key, 'House Rules');
        if (!rulesMap[key]) rulesMap[key] = { key, label, items: [] };
        if (!rulesMap[key].items.includes(name)) rulesMap[key].items.push(name);
      } else {
        const label = getSubGroupTitle(key, 'Shared Amenities');
        if (!amenitiesMap[key]) amenitiesMap[key] = { key, label, items: [] };
        if (!amenitiesMap[key].items.includes(name)) amenitiesMap[key].items.push(name);
      }
    });

    // Add explicit boolean rules
    if (rulesObj.femaleOnly) {
      const title = getSubGroupTitle('GENDER_POLICY', 'Gender Policy');
      if (!rulesMap['GENDER_POLICY']) rulesMap['GENDER_POLICY'] = { key: 'GENDER_POLICY', label: title, items: [] };
      if (!rulesMap['GENDER_POLICY'].items.includes('Female Only Accommodation'))
        rulesMap['GENDER_POLICY'].items.push('Female Only Accommodation');
    }
    if (rulesObj.maleOnly) {
      const title = getSubGroupTitle('GENDER_POLICY', 'Gender Policy');
      if (!rulesMap['GENDER_POLICY']) rulesMap['GENDER_POLICY'] = { key: 'GENDER_POLICY', label: title, items: [] };
      if (!rulesMap['GENDER_POLICY'].items.includes('Male Only Accommodation'))
        rulesMap['GENDER_POLICY'].items.push('Male Only Accommodation');
    }
    if (rulesObj.noCurfew) {
      const title = getSubGroupTitle('CURFEW', 'Curfew & Gate Rules');
      if (!rulesMap['CURFEW']) rulesMap['CURFEW'] = { key: 'CURFEW', label: title, items: [] };
      if (!rulesMap['CURFEW'].items.includes('24/7 Open Gate (No Curfew)'))
        rulesMap['CURFEW'].items.push('24/7 Open Gate (No Curfew)');
    }
    if (rulesObj.visitorsAllowed) {
      const title = getSubGroupTitle('VISITOR_POLICY', 'Visitor Policy');
      if (!rulesMap['VISITOR_POLICY']) rulesMap['VISITOR_POLICY'] = { key: 'VISITOR_POLICY', label: title, items: [] };
      if (!rulesMap['VISITOR_POLICY'].items.includes('Visitors Allowed'))
        rulesMap['VISITOR_POLICY'].items.push('Visitors Allowed');
    }
    if (rulesObj.petsAllowed) {
      const title = getSubGroupTitle('PET_POLICY', 'Pet Policy');
      if (!rulesMap['PET_POLICY']) rulesMap['PET_POLICY'] = { key: 'PET_POLICY', label: title, items: [] };
      if (!rulesMap['PET_POLICY'].items.includes('Pets Allowed'))
        rulesMap['PET_POLICY'].items.push('Pets Allowed');
    }

    rawRulesList.forEach((attrId) => {
      const name = resolveAmenityName(attrId);
      if (!name) return;
      const matched = attributes.find(
        (a) => a.id === attrId || a.value === attrId || a.code === attrId || attrId.startsWith(a.id + '|')
      );
      const key = matched?.subGroupKey || matched?.subGroup || 'HOUSE_RULES';
      const label = getSubGroupTitle(key, 'House Rules');

      if (!rulesMap[key]) rulesMap[key] = { key, label, items: [] };
      if (!rulesMap[key].items.includes(name)) rulesMap[key].items.push(name);
    });

    // Add explicit boolean features
    if (featuresObj.security24h) {
      const title = getSubGroupTitle('SECURITY', 'Security');
      if (!featuresMap['SECURITY']) featuresMap['SECURITY'] = { key: 'SECURITY', label: title, items: [] };
      if (!featuresMap['SECURITY'].items.includes('24/7 Security Guard'))
        featuresMap['SECURITY'].items.push('24/7 Security Guard');
    }
    if (featuresObj.cctv) {
      const title = getSubGroupTitle('SECURITY', 'Security');
      if (!featuresMap['SECURITY']) featuresMap['SECURITY'] = { key: 'SECURITY', label: title, items: [] };
      if (!featuresMap['SECURITY'].items.includes('CCTV Cameras'))
        featuresMap['SECURITY'].items.push('CCTV Cameras');
    }
    if (featuresObj.fireSafety) {
      const title = getSubGroupTitle('DISASTER_PREP', 'Disaster Safety');
      if (!featuresMap['DISASTER_PREP'])
        featuresMap['DISASTER_PREP'] = { key: 'DISASTER_PREP', label: title, items: [] };
      if (!featuresMap['DISASTER_PREP'].items.includes('Fire Safety Extinguishers'))
        featuresMap['DISASTER_PREP'].items.push('Fire Safety Extinguishers');
    }

    rawFeaturesList.forEach((attrId) => {
      const name = resolveAmenityName(attrId);
      if (!name) return;
      const matched = attributes.find(
        (a) => a.id === attrId || a.value === attrId || a.code === attrId || attrId.startsWith(a.id + '|')
      );
      const key = matched?.subGroupKey || matched?.subGroup || 'SECURITY';
      const label = getSubGroupTitle(key, 'Security Features');

      if (!featuresMap[key]) featuresMap[key] = { key, label, items: [] };
      if (!featuresMap[key].items.includes(name)) featuresMap[key].items.push(name);
    });

    return {
      amenitiesBySubGroup: Object.values(amenitiesMap),
      rulesBySubGroup: Object.values(rulesMap),
      featuresBySubGroup: Object.values(featuresMap)
    };
  }, [amenities, customRules, customFeatures, rulesObj, featuresObj, attributes, dbSubGroups]);

  // Filtered by Search Query
  const filteredTaxonomy = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return groupedTaxonomy;

    const filterGroup = (groups: { key: string; label: string; items: string[] }[]) => {
      return groups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => item.toLowerCase().includes(q) || g.label.toLowerCase().includes(q))
        }))
        .filter((g) => g.items.length > 0);
    };

    return {
      amenitiesBySubGroup: filterGroup(groupedTaxonomy.amenitiesBySubGroup),
      rulesBySubGroup: filterGroup(groupedTaxonomy.rulesBySubGroup),
      featuresBySubGroup: filterGroup(groupedTaxonomy.featuresBySubGroup)
    };
  }, [groupedTaxonomy, searchQuery]);

  const totalAmenitiesCount = groupedTaxonomy.amenitiesBySubGroup.reduce((acc, g) => acc + g.items.length, 0);
  const totalRulesCount = groupedTaxonomy.rulesBySubGroup.reduce((acc, g) => acc + g.items.length, 0);
  const totalFeaturesCount = groupedTaxonomy.featuresBySubGroup.reduce((acc, g) => acc + g.items.length, 0);
  const totalGrandCount = totalAmenitiesCount + totalRulesCount + totalFeaturesCount;

  if (!isClient || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-6 antialiased">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl sm:rounded-[2.5rem] max-w-4xl w-full h-full sm:h-auto max-h-full sm:max-h-[88vh] shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Top Header Bar */}
          <div className="p-4 sm:p-6 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Maximize2 size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                  {activeCategory === 'AMENITIES'
                    ? 'Shared Property Amenities Breakdown'
                    : activeCategory === 'RULES'
                    ? 'House Rules & Policies Breakdown'
                    : activeCategory === 'SECURITY'
                    ? 'Security & Safety Features Breakdown'
                    : activeCategory === 'ROOMS'
                    ? 'In-Unit Room Amenities Breakdown'
                    : propertyTitle}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block truncate">
                  {activeCategory === 'AMENITIES'
                    ? `${totalAmenitiesCount} Verified Shared Amenities`
                    : activeCategory === 'RULES'
                    ? `${totalRulesCount} Verified House Rules`
                    : activeCategory === 'SECURITY'
                    ? `${totalFeaturesCount} Verified Security Features`
                    : `${totalGrandCount} Verified Taxonomy Items`}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search & Category Filter Navigation Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search amenities, rules, or features (e.g. WiFi, Aircon, Curfew, CCTV)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {[
                { id: 'ALL', label: 'All Categories', count: totalGrandCount },
                { id: 'AMENITIES', label: 'Shared Amenities', count: totalAmenitiesCount },
                { id: 'RULES', label: 'House Rules', count: totalRulesCount },
                { id: 'SECURITY', label: 'Security & Safety', count: totalFeaturesCount },
                ...(rooms && rooms.length > 0 ? [{ id: 'ROOMS', label: `In-Unit Rooms (${rooms.length})`, count: rooms.length }] : [])
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0',
                    activeCategory === cat.id
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700'
                  )}
                >
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-md text-[9px] font-black',
                      activeCategory === cat.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    )}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            {/* SECTION 1: SHARED AMENITIES */}
            {(activeCategory === 'ALL' || activeCategory === 'AMENITIES') && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div
                  onClick={() => toggleSection('AMENITIES')}
                  className="flex items-center justify-between cursor-pointer select-none pb-3 border-b border-slate-200/80 dark:border-slate-800 group"
                >
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                    <ListChecks size={16} className="text-blue-500" />
                    <span>Shared Property Amenities</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      ({totalAmenitiesCount})
                    </span>
                  </h4>
                  <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                    <motion.div animate={{ rotate: expandedSections.AMENITIES ? 0 : 180 }} transition={{ duration: 0.2 }}>
                      <ChevronUp size={14} />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expandedSections.AMENITIES && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-4"
                    >
                      {filteredTaxonomy.amenitiesBySubGroup.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                          {filteredTaxonomy.amenitiesBySubGroup.map((group) => (
                            <div
                              key={group.key}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-sm"
                            >
                              <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">
                                {group.label}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {group.items.map((item, i) => {
                                  const ItemIcon = getItemIcon(item);
                                  return (
                                    <span
                                      key={i}
                                      className="px-3 py-1.5 rounded-xl bg-blue-50/60 dark:bg-slate-800 border border-blue-200/60 dark:border-blue-500/30 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                                    >
                                      <ItemIcon size={13} className="text-blue-500 shrink-0" />
                                      <span>{item}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-400 italic pt-1">
                          {searchQuery ? `No amenities matching "${searchQuery}"` : 'No shared property amenities listed.'}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* SECTION 2: HOUSE RULES */}
            {(activeCategory === 'ALL' || activeCategory === 'RULES') && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div
                  onClick={() => toggleSection('RULES')}
                  className="flex items-center justify-between cursor-pointer select-none pb-3 border-b border-slate-200/80 dark:border-slate-800 group"
                >
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 flex items-center gap-2">
                    <Shield size={16} className="text-purple-500" />
                    <span>House Rules & Policies</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">({totalRulesCount})</span>
                  </h4>
                  <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-purple-500 transition-colors">
                    <motion.div animate={{ rotate: expandedSections.RULES ? 0 : 180 }} transition={{ duration: 0.2 }}>
                      <ChevronUp size={14} />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expandedSections.RULES && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-4"
                    >
                      {filteredTaxonomy.rulesBySubGroup.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                          {filteredTaxonomy.rulesBySubGroup.map((group) => (
                            <div
                              key={group.key}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-sm"
                            >
                              <span className="text-[9px] font-black uppercase tracking-wider text-purple-500 block">
                                {group.label}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {group.items.map((item, i) => {
                                  const ItemIcon = getItemIcon(item);
                                  return (
                                    <span
                                      key={i}
                                      className="px-3 py-1.5 rounded-xl bg-purple-50/60 dark:bg-slate-800 border border-purple-200/60 dark:border-purple-500/30 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                                    >
                                      <ItemIcon size={13} className="text-purple-500 shrink-0" />
                                      <span>{item}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-400 italic pt-1">
                          {searchQuery ? `No house rules matching "${searchQuery}"` : 'No specific house rules listed.'}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* SECTION 3: SECURITY & SAFETY */}
            {(activeCategory === 'ALL' || activeCategory === 'SECURITY') && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div
                  onClick={() => toggleSection('SECURITY')}
                  className="flex items-center justify-between cursor-pointer select-none pb-3 border-b border-slate-200/80 dark:border-slate-800 group"
                >
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
                    <Star size={16} className="text-amber-500" />
                    <span>Security & Safety Features</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      ({totalFeaturesCount})
                    </span>
                  </h4>
                  <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
                    <motion.div animate={{ rotate: expandedSections.SECURITY ? 0 : 180 }} transition={{ duration: 0.2 }}>
                      <ChevronUp size={14} />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expandedSections.SECURITY && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-4"
                    >
                      {filteredTaxonomy.featuresBySubGroup.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                          {filteredTaxonomy.featuresBySubGroup.map((group) => (
                            <div
                              key={group.key}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-sm"
                            >
                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 block">
                                {group.label}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {group.items.map((item, i) => {
                                  const ItemIcon = getItemIcon(item);
                                  return (
                                    <span
                                      key={i}
                                      className="px-3 py-1.5 rounded-xl bg-amber-50/60 dark:bg-slate-800 border border-amber-200/60 dark:border-amber-500/30 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                                    >
                                      <ItemIcon size={13} className="text-amber-500 shrink-0" />
                                      <span>{item}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-400 italic pt-1">
                          {searchQuery ? `No security features matching "${searchQuery}"` : 'No security features listed.'}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* SECTION 4: IN-UNIT ROOM AMENITIES (IF ROOMS PASSED) */}
            {rooms && rooms.length > 0 && (activeCategory === 'ALL' || activeCategory === 'ROOMS') && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div
                  onClick={() => toggleSection('ROOMS')}
                  className="flex items-center justify-between cursor-pointer select-none pb-3 border-b border-slate-200/80 dark:border-slate-800 group"
                >
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                    <Bed size={16} />
                    <span>In-Unit Room Amenities ({rooms.length} Units)</span>
                  </h4>
                  <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <motion.div animate={{ rotate: expandedSections.ROOMS ? 0 : 180 }} transition={{ duration: 0.2 }}>
                      <ChevronUp size={14} />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expandedSections.ROOMS && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                        {rooms.map((room, idx) => {
                          const roomAmenities: string[] = Array.isArray(room.amenities) ? room.amenities : [];
                          return (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                                  {room.name || room.title || `Room ${idx + 1}`}
                                </span>
                                {room.price && (
                                  <span className="text-[10px] font-black text-primary uppercase">
                                    ₱{Number(room.price).toLocaleString()}/mo
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {roomAmenities.length > 0 ? (
                                  roomAmenities.map((attrId, i) => {
                                    const name = resolveAmenityName(attrId);
                                    const ItemIcon = getItemIcon(name, attrId);
                                    return (
                                      <span
                                        key={i}
                                        className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                                      >
                                        <ItemIcon size={12} className="text-purple-500 shrink-0" />
                                        <span>{name}</span>
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400 italic">
                                    Standard room setup
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:inline-block">
              BoardTAU Dynamic Taxonomy Engine
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary/90 shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              Close Breakdown
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

export default SharedAmenitiesModal;
