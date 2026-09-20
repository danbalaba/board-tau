'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import { 
  ShieldCheck, Flame, X, Shield, Search, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { getCachedAttributes, getSyncAttributes } from '@/lib/landlordTaxonomyCache';
import { getDynamicIcon } from '@/lib/iconResolver';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: any[]; // Array of strings or DynamicAttribute objects
  customFeatures?: string[];
}

export default function SafetyModal({
  isOpen,
  onClose,
  features = [],
  customFeatures = []
}: SafetyModalProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attributes, setAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCachedAttributes().then(res => {
      if (res && Array.isArray(res)) {
        setAttributes(res);
      }
    });
  }, []);

  // Helper to parse feature item whether string ("Name|Icon"), object, or raw
  const parseFeatureItem = (item: any) => {
    let rawName = '';
    let iconName = '';
    let subGroupKey = '';
    let attrId = '';

    if (typeof item === 'object' && item !== null) {
      rawName = item.name || item.attribute?.name || item.title || '';
      iconName = item.icon || item.attribute?.icon || '';
      subGroupKey = item.subGroupKey || '';
      attrId = item.id || item.attributeId || item.attribute?.id || '';
    } else if (typeof item === 'string') {
      if (item.includes('|')) {
        const parts = item.split('|');
        rawName = parts[0].trim();
        iconName = parts[1]?.trim() || '';
      } else {
        rawName = item.trim();
      }
    }

    const cleanName = rawName.includes('|') ? rawName.split('|')[0].trim() : rawName;
    if (!iconName && rawName.includes('|')) {
      iconName = rawName.split('|')[1]?.trim() || '';
    }

    // Determine subGroupKey if missing based on keywords matching 1_taxonomy.ts (SECURITY vs DISASTER_PREP)
    if (!subGroupKey) {
      const lower = cleanName.toLowerCase();
      if (lower.includes('cctv') || lower.includes('camera') || lower.includes('guard') || lower.includes('rfid') || lower.includes('keycard') || lower.includes('lock') || lower.includes('door') || lower.includes('biometric') || lower.includes('fingerprint') || lower.includes('security')) {
        subGroupKey = 'SECURITY';
      } else if (lower.includes('fire') || lower.includes('smoke') || lower.includes('extinguisher') || lower.includes('flood') || lower.includes('disaster') || lower.includes('first aid') || lower.includes('emergency') || lower.includes('hallway light') || lower.includes('light') || lower.includes('kit') || lower.includes('medical') || lower.includes('safety') || lower.includes('alarm')) {
        subGroupKey = 'DISASTER_PREP';
      } else {
        subGroupKey = 'CUSTOM';
      }
    }

    return { name: cleanName, icon: iconName, subGroupKey, attrId };
  };

  // Sub-group category definitions matching 1_taxonomy.ts (Exactly 2 Sub-Steps)
  const rawSubGroups = useMemo(() => [
    { key: 'SECURITY', label: 'Gate & Door Security', icon: ShieldCheck },
    { key: 'DISASTER_PREP', label: 'Fire & Disaster Safety', icon: Flame },
  ], []);

  // Parse and group features into sub-steps
  const { groupedFeatures, parsedCustomNotes, totalCount } = useMemo(() => {
    const map: Record<string, { key: string; label: string; items: { name: string; icon: string; subGroupKey: string; attrId?: string; description?: string }[] }> = {};
    const customList: { name: string; icon: string; attrId?: string }[] = [];
    const addedNames = new Set<string>();

    const allRawItems = [...features, ...customFeatures];

    allRawItems.forEach(item => {
      if (!item) return;
      const parsed = parseFeatureItem(item);
      if (!parsed.name || addedNames.has(parsed.name.toLowerCase())) return;
      addedNames.add(parsed.name.toLowerCase());

      const desc = typeof item === 'object' ? item.description || item.attribute?.description : '';

      // Add taxonomy description fallback if description not provided
      let finalDesc = desc;
      if (!finalDesc) {
        const lowerName = parsed.name.toLowerCase();
        if (lowerName.includes('cctv')) finalDesc = "Surveillance cameras installed on property common areas.";
        else if (lowerName.includes('guard')) finalDesc = "Uniformed guard on duty.";
        else if (lowerName.includes('rfid') && lowerName.includes('gate')) finalDesc = "Electronic RFID card or key fob entry at main gate.";
        else if (lowerName.includes('rfid') && lowerName.includes('door')) finalDesc = "Electronic RFID smart keycard lock on main unit/bedroom door.";
        else if (lowerName.includes('biometric') || lowerName.includes('fingerprint')) finalDesc = "Fingerprint scanner entry at main entrance or lobby door.";
        else if (lowerName.includes('flood')) finalDesc = "Located on high ground not prone to typhoon flooding.";
        else if (lowerName.includes('fire extinguisher')) finalDesc = "Accessible fire extinguishers.";
        else if (lowerName.includes('emergency hallway') || lowerName.includes('hallway light')) finalDesc = "Battery backup lights for blackouts.";
        else if (lowerName.includes('smoke detector')) finalDesc = "In-room or hallway smoke alarms.";
        else if (lowerName.includes('first aid')) finalDesc = "Emergency medical supplies on site.";
      }

      if (parsed.subGroupKey && parsed.subGroupKey !== 'CUSTOM') {
        const matchedSg = rawSubGroups.find(s => s.key === parsed.subGroupKey);
        const label = matchedSg?.label || 'Security & Safety';

        if (!map[parsed.subGroupKey]) {
          map[parsed.subGroupKey] = { key: parsed.subGroupKey, label, items: [] };
        }
        map[parsed.subGroupKey].items.push({
          name: parsed.name,
          icon: parsed.icon,
          subGroupKey: parsed.subGroupKey,
          attrId: parsed.attrId,
          description: finalDesc,
        });
      } else {
        customList.push({ name: parsed.name, icon: parsed.icon, attrId: parsed.attrId });
      }
    });

    // Ensure sub-group display order matching taxonomy
    const ordered = rawSubGroups
      .map(sg => map[sg.key])
      .filter(Boolean);

    const total = ordered.reduce((sum, g) => sum + g.items.length, 0) + customList.length;

    return { groupedFeatures: ordered, parsedCustomNotes: customList, totalCount: total };
  }, [features, customFeatures, rawSubGroups]);

  // Dynamic category tabs with item counts
  const categoryTabs = useMemo(() => {
    const tabs = groupedFeatures.map(g => ({
      key: g.key,
      label: g.label,
      count: g.items.length,
    }));
    return [{ key: 'ALL', label: 'All Safety Features', count: totalCount }, ...tabs];
  }, [groupedFeatures, totalCount]);

  // Sub-step list for wizard navigation
  const subGroupList = useMemo(() => {
    return groupedFeatures.map(g => ({ key: g.key, label: g.label }));
  }, [groupedFeatures]);

  const activeSubStepIndex = useMemo(() => {
    return subGroupList.findIndex(g => g.key === activeTab);
  }, [subGroupList, activeTab]);

  // Dynamic Lucide Icon Resolver for Security Features
  const renderFeatureIcon = (iconName?: string, name?: string, attrId?: string) => {
    let resolvedIcon = iconName;

    if (!resolvedIcon && attributes.length > 0) {
      const matched = attributes.find((a: any) =>
        (attrId && a.id === attrId) ||
        (name && a.name?.toLowerCase() === name.toLowerCase())
      );
      if (matched?.icon) {
        resolvedIcon = matched.icon;
      }
    }

    const iconInput = (name && resolvedIcon) ? `${name}|${resolvedIcon}` : (name || resolvedIcon);
    const DynamicIcon = getDynamicIcon(iconInput, ShieldCheck);
    if (!DynamicIcon) return null;

    return <DynamicIcon size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />;
  };

  // Auto-scroll active category tab into center view
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tabsScrollRef.current) {
        const activeEl = tabsScrollRef.current.querySelector('[data-active="true"]');
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filter features by active category and search query
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groupedFeatures
      .filter(g => activeTab === 'ALL' || g.key === activeTab)
      .map(g => {
        if (!query) return g;
        const matching = g.items.filter(item => {
          return item.name.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query));
        });
        return { ...g, items: matching };
      })
      .filter(g => g.items.length > 0);
  }, [groupedFeatures, activeTab, searchQuery]);

  // Filter custom landlord notes by search query
  const filteredCustomNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return parsedCustomNotes;
    return parsedCustomNotes.filter(cf => cf.name.toLowerCase().includes(query));
  }, [parsedCustomNotes, searchQuery]);

  const hasResults = filteredGroups.length > 0 || (activeTab === 'ALL' && filteredCustomNotes.length > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="lg" fullOnMobile>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 h-full sm:h-[620px] max-h-none sm:max-h-[85vh] min-h-0 sm:min-h-[500px] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldCheck size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                Security & Safety Measures
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400">
                {totalCount} Verified Safety Measures
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="relative shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search security features (e.g., CCTV, guard, smoke, flood, keycard)..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sub-step Category Tabs Strip with Left/Right Scroll Chevrons */}
        {categoryTabs.length > 1 && (
          <div className="relative flex items-center shrink-0 group">
            <button
              type="button"
              onClick={() => handleScrollTabs('left')}
              className="hidden sm:flex p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white shrink-0 mr-1.5 cursor-pointer z-10"
              title="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>

            <div 
              ref={tabsScrollRef}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar scroll-smooth flex-1 touch-pan-x"
            >
              {categoryTabs.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    data-active={isActive ? "true" : "false"}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleScrollTabs('right')}
              className="hidden sm:flex p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white shrink-0 ml-1.5 cursor-pointer z-10"
              title="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div ref={contentScrollRef} className="overflow-y-auto flex-1 no-scrollbar space-y-4 py-1 pr-1 scroll-smooth">
          {hasResults ? (
            <>
              {filteredGroups.map(group => (
                <div key={group.key} className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-1.5">
                    <h5 className="font-black text-xs text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                      {group.label}
                    </h5>
                    <span className="text-[10px] font-bold text-gray-400">({group.items.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {group.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-amber-500/30 transition-colors"
                      >
                        <div className="p-2 bg-amber-500/10 rounded-xl shrink-0">
                          {renderFeatureIcon(item.icon, item.name, item.attrId)}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-gray-900 dark:text-white">{item.name}</h5>
                          {item.description && (
                            <p className="text-[10px] font-medium text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredCustomNotes.length > 0 && activeTab === 'ALL' && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                  <h6 className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Additional Landlord Safety Notes ({filteredCustomNotes.length})
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredCustomNotes.map((note, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50 text-xs font-bold text-amber-900 dark:text-amber-300">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg shrink-0">
                          {renderFeatureIcon(note.icon, note.name, note.attrId)}
                        </div>
                        <span>{note.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-200 dark:border-gray-700/60 rounded-3xl p-8">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldCheck size={28} />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {searchQuery ? `No safety features matching "${searchQuery}"` : "No safety features listed"}
              </h4>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm">
                {searchQuery ? "Try searching for CCTV, guard, smoke detector, fire extinguisher, or flood-free." : "Standard safety and emergency measures apply for this property."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); handleTabChange('ALL'); }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-all cursor-pointer shadow-sm mt-2"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sub-step Wizard Footer Navigation */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 gap-2">
          {activeTab === 'ALL' ? (
            subGroupList.length > 0 ? (
              <button
                type="button"
                onClick={() => handleTabChange(subGroupList[0].key)}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-1 sm:flex-initial justify-center"
              >
                <span>Start Sub-Step: {subGroupList[0].label}</span>
                <ArrowRight size={14} />
              </button>
            ) : <div />
          ) : (
            <div className="flex items-center gap-2 w-full justify-between">
              <button
                type="button"
                onClick={() => {
                  if (activeSubStepIndex > 0) {
                    handleTabChange(subGroupList[activeSubStepIndex - 1].key);
                  } else {
                    handleTabChange('ALL');
                  }
                }}
                className="px-3 sm:px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>
                  {activeSubStepIndex > 0 ? `Prev: ${subGroupList[activeSubStepIndex - 1].label}` : 'All Safety Features'}
                </span>
              </button>

              {activeSubStepIndex < subGroupList.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleTabChange(subGroupList[activeSubStepIndex + 1].key)}
                  className="px-3.5 sm:px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <span>Next Sub-Step: {subGroupList[activeSubStepIndex + 1].label}</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleTabChange('ALL')}
                  className="px-3.5 sm:px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <span>View All Summary ✓</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'ALL' && (
            <button
              onClick={onClose}
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
