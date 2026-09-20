'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import { 
  Shield, Users, Clock, PawPrint, VolumeX, X, Flame, Ban, Search, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { getCachedAttributes, getSyncAttributes } from '@/lib/landlordTaxonomyCache';
import { getDynamicIcon } from '@/lib/iconResolver';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rulesObj?: {
    femaleOnly?: boolean;
    maleOnly?: boolean;
    noCurfew?: boolean;
    visitorsAllowed?: boolean;
    petsAllowed?: boolean;
    smokingAllowed?: boolean;
    customRules?: string[];
  };
  customRules?: string[];
  rules?: any[];
}

export default function RulesModal({
  isOpen,
  onClose,
  rulesObj = {},
  customRules = [],
  rules = []
}: RulesModalProps) {
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

  // Dynamic Icon Resolver for Rules
  const renderRuleIcon = (iconObj?: any, title?: string, attrId?: string) => {
    let resolvedIcon: string | undefined = undefined;

    if (typeof iconObj === 'string') {
      resolvedIcon = iconObj;
    }

    if (!resolvedIcon && attributes.length > 0) {
      const matched = attributes.find((a: any) =>
        (attrId && a.id === attrId) ||
        (title && a.name?.toLowerCase() === title.toLowerCase())
      );
      if (matched?.icon) {
        resolvedIcon = matched.icon;
      }
    }

    if (iconObj && typeof iconObj !== 'string') {
      const IconComp = iconObj;
      return <IconComp size={18} className="text-purple-600 dark:text-purple-400 shrink-0" />;
    }

    const DynamicIcon = getDynamicIcon(resolvedIcon);
    if (!DynamicIcon) return null;

    return <DynamicIcon size={18} className="text-purple-600 dark:text-purple-400 shrink-0" />;
  };

  // Build active house rules from listing props
  const allHouseRules = useMemo(() => {
    const active: { icon: any; title: string; subtitle?: string; category: string; key: string; attrId?: string }[] = [];

    const addRule = (item: { icon?: any; title: string; subtitle?: string; category?: string; key?: string; attrId?: string }) => {
      let cleanTitle = item.title;
      let iconName = item.icon;

      if (typeof item.title === 'string' && item.title.includes('|')) {
        const parts = item.title.split('|');
        cleanTitle = parts[0].trim();
        if (parts[1]?.trim()) {
          iconName = parts[1].trim();
        }
      } else {
        cleanTitle = item.title?.trim() || '';
      }

      let category = item.category || '';
      let key = item.key || '';

      const lower = cleanTitle.toLowerCase();
      if (!key || key === 'CUSTOM') {
        if (lower.includes('visitor') || lower.includes('guest')) {
          category = 'Visitor Policy';
          key = 'VISITORS';
        } else if (lower.includes('female') || lower.includes('male') || lower.includes('gender') || lower.includes('co-living')) {
          category = 'Gender Policy';
          key = 'GENDER';
        } else if (lower.includes('curfew') || lower.includes('gate') || lower.includes('24/7') || lower.includes('night') || lower.includes('hours')) {
          category = 'Curfew & Access';
          key = 'CURFEW';
        } else if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) {
          category = 'Pet Policy';
          key = 'PETS';
        } else if (lower.includes('smoke') || lower.includes('vape') || lower.includes('smoking')) {
          category = 'Smoking Policy';
          key = 'SMOKING';
        } else if (lower.includes('alcohol') || lower.includes('drink') || lower.includes('liquor') || lower.includes('wine')) {
          category = 'Alcohol Policy';
          key = 'ALCOHOL';
        } else {
          category = 'Landlord Policies';
          key = 'CUSTOM';
        }
      }

      // Add taxonomy description fallback if subtitle not provided
      let subtitle = item.subtitle;
      if (!subtitle) {
        if (lower.includes('female-only') || lower.includes('female only')) subtitle = "Restricted strictly to female boarders.";
        else if (lower.includes('male-only') || lower.includes('male only')) subtitle = "Restricted strictly to male boarders.";
        else if (lower.includes('male & female') || lower.includes('co-living')) subtitle = "Open to both male and female boarders.";
        else if (lower.includes('24/7') || lower.includes('no curfew')) subtitle = "Entry permitted at any time via key/RFID.";
        else if (lower.includes('night curfew enforced') || lower.includes('10:00 pm')) subtitle = "Main gate locked at 10:00 PM.";
        else if (lower.includes('early night curfew') || lower.includes('9:00 pm')) subtitle = "Main gate locked at 9:00 PM.";
        else if (lower.includes('strict curfew') || lower.includes('8:00 pm')) subtitle = "Main gate locked early at 8:00 PM for maximum security.";
        else if (lower.includes('quiet hours')) subtitle = "Quiet study environment strictly enforced late night.";
        else if (lower.includes('male guests restricted')) subtitle = "Male guests restricted from female bedrooms.";
        else if (lower.includes('visitors allowed')) subtitle = "Outside guests permitted on property during day hours.";
        else if (lower.includes('no outside visitors') || lower.includes('no visitors')) subtitle = "Outside guests prohibited past main gate.";
        else if (cleanTitle.toLowerCase() === 'pets allowed') subtitle = "Allows pets on property with landlord permission.";
        else if (cleanTitle.toLowerCase() === 'no pets allowed') subtitle = "Strictly no pets permitted inside room or premises.";
        else if (lower.includes('no smoking') || lower.includes('non-smoking')) subtitle = "Strict non-smoking policy inside rooms and indoor areas.";
        else if (lower.includes('smoking allowed in designated') || lower.includes('smoking allowed')) subtitle = "Smoking permitted strictly in designated outdoor areas.";
        else if (lower.includes('no alcohol')) subtitle = "Alcoholic beverages prohibited on property grounds.";
        else if (lower.includes('moderate alcohol')) subtitle = "Moderate alcohol consumption permitted inside private units.";
      }

      // Check if already added to avoid duplication
      const exists = active.some(a => a.title.toLowerCase() === cleanTitle.toLowerCase());
      if (!exists && cleanTitle) {
        active.push({
          icon: iconName,
          title: cleanTitle,
          subtitle,
          category,
          key,
          attrId: item.attrId,
        });
      }
    };

    if (rules && Array.isArray(rules)) {
      rules.forEach(r => {
        if (!r) return;
        if (typeof r === 'object') {
          addRule({
            icon: r.icon || r.attribute?.icon,
            title: r.name || r.title || r.attribute?.name || '',
            subtitle: r.description || r.attribute?.description,
            category: r.subGroupLabel || r.category,
            key: r.subGroupKey || r.key,
            attrId: r.id || r.attributeId || r.attribute?.id,
          });
        } else if (typeof r === 'string') {
          addRule({ title: r });
        }
      });
    }

    // Structured boolean rules
    if (rulesObj?.femaleOnly) {
      addRule({ icon: "UserX", title: "Female Only Policy", subtitle: "Strictly for female tenants only", category: "Gender Policy", key: "GENDER" });
    } else if (rulesObj?.maleOnly) {
      addRule({ icon: "UserX", title: "Male Only Policy", subtitle: "Strictly for male tenants only", category: "Gender Policy", key: "GENDER" });
    } else if (rulesObj?.femaleOnly === false && rulesObj?.maleOnly === false) {
      addRule({ icon: "Users", title: "Co-living Allowed", subtitle: "Male and female tenants permitted", category: "Gender Policy", key: "GENDER" });
    }

    if (rulesObj?.noCurfew) {
      addRule({ icon: "Clock", title: "24/7 Gate Access (No Curfew)", subtitle: "Tenants can enter and leave at any hour", category: "Curfew & Access", key: "CURFEW" });
    } else if (rulesObj?.noCurfew === false) {
      addRule({ icon: "Lock", title: "Curfew Policy Enforced", subtitle: "Gate closed at specified evening hours", category: "Curfew & Access", key: "CURFEW" });
    }

    if (rulesObj?.visitorsAllowed) {
      addRule({ icon: "Users", title: "Visitors Allowed", subtitle: "Guest access permitted on premises", category: "Visitor Policy", key: "VISITORS" });
    } else if (rulesObj?.visitorsAllowed === false) {
      addRule({ icon: "Ban", title: "No Visitors Allowed", subtitle: "Outside visitors not permitted", category: "Visitor Policy", key: "VISITORS" });
    }

    if (rulesObj?.petsAllowed) {
      addRule({ icon: "PawPrint", title: "Pets Allowed", subtitle: "Pet-friendly property environment", category: "Pet Policy", key: "PETS" });
    } else if (rulesObj?.petsAllowed === false) {
      addRule({ icon: "Ban", title: "No Pets Allowed", subtitle: "Pets not permitted on premises", category: "Pet Policy", key: "PETS" });
    }

    if (rulesObj?.smokingAllowed) {
      addRule({ icon: "Flame", title: "Smoking Allowed", subtitle: "Designated smoking area provided", category: "Smoking Policy", key: "SMOKING" });
    } else if (rulesObj?.smokingAllowed === false) {
      addRule({ icon: "Ban", title: "No Smoking Allowed", subtitle: "Strict non-smoking property", category: "Smoking Policy", key: "SMOKING" });
    }

    // Merge custom rules array
    const mergedCustom = Array.from(new Set([...(rulesObj?.customRules || []), ...(customRules || [])]));
    mergedCustom.forEach((ruleStr: any) => {
      if (ruleStr && typeof ruleStr === 'string') {
        addRule({ title: ruleStr });
      }
    });

    return active;
  }, [rulesObj, customRules, rules]);

  // Order of categories matching taxonomy
  const categoryOrder = useMemo(() => ['GENDER', 'CURFEW', 'VISITORS', 'PETS', 'SMOKING', 'ALCOHOL', 'CUSTOM'], []);

  // Group house rules into sub-steps
  const groupedRules = useMemo(() => {
    const map: Record<string, { key: string; label: string; items: typeof allHouseRules }> = {};

    allHouseRules.forEach(rule => {
      if (!map[rule.key]) {
        map[rule.key] = { key: rule.key, label: rule.category, items: [] };
      }
      map[rule.key].items.push(rule);
    });

    // Sort by taxonomy category order
    return Object.values(map).sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.key);
      const idxB = categoryOrder.indexOf(b.key);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [allHouseRules, categoryOrder]);

  // Dynamic category pills with item counts
  const categoryTabs = useMemo(() => {
    const tabs = groupedRules.map(g => ({
      key: g.key,
      label: g.label,
      count: g.items.length,
    }));
    return [{ key: 'ALL', label: 'All House Rules', count: allHouseRules.length }, ...tabs];
  }, [groupedRules, allHouseRules]);

  // Sub-step list for wizard navigation
  const subGroupList = useMemo(() => {
    return groupedRules.map(g => ({ key: g.key, label: g.label }));
  }, [groupedRules]);

  const activeSubStepIndex = useMemo(() => {
    return subGroupList.findIndex(g => g.key === activeTab);
  }, [subGroupList, activeTab]);

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

  // Filter rules by active category and search query
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groupedRules
      .filter(g => activeTab === 'ALL' || g.key === activeTab)
      .map(g => {
        if (!query) return g;
        const matching = g.items.filter(r => 
          r.title.toLowerCase().includes(query) || 
          (r.subtitle && r.subtitle.toLowerCase().includes(query)) ||
          r.category.toLowerCase().includes(query)
        );
        return { ...g, items: matching };
      })
      .filter(g => g.items.length > 0);
  }, [groupedRules, activeTab, searchQuery]);

  const hasResults = filteredGroups.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="lg" fullOnMobile>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 h-full sm:h-[620px] max-h-none sm:max-h-[85vh] min-h-0 sm:min-h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
              <Shield size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                House Rules & Tenant Policies
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400">
                {allHouseRules.length} Verified Property Guidelines
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
            placeholder="Search rules (e.g., curfew, visitors, pets, female only)..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
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
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
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
            filteredGroups.map(group => (
              <div key={group.key} className="space-y-2.5">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-1.5">
                  <h5 className="font-black text-xs text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                    {group.label}
                  </h5>
                  <span className="text-[10px] font-bold text-gray-400">({group.items.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.items.map((rule, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="p-2 bg-purple-500/10 rounded-xl shrink-0">
                        {renderRuleIcon(rule.icon, rule.title, rule.attrId)}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-gray-900 dark:text-white">{rule.title}</h5>
                        {rule.subtitle && (
                          <p className="text-[10px] font-medium text-gray-400 mt-0.5 leading-relaxed">{rule.subtitle}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-200 dark:border-gray-700/60 rounded-3xl p-8">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Shield size={28} />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {searchQuery ? `No house rules matching "${searchQuery}"` : "No custom house rules"}
              </h4>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm">
                {searchQuery ? "Try searching for curfew, visitors, pets, smoking, or gender policy." : "Standard property guidelines and respectful co-living practices apply for this residence."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); handleTabChange('ALL'); }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition-all cursor-pointer shadow-sm mt-2"
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
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-1 sm:flex-initial justify-center"
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
                  {activeSubStepIndex > 0 ? `Prev: ${subGroupList[activeSubStepIndex - 1].label}` : 'All House Rules'}
                </span>
              </button>

              {activeSubStepIndex < subGroupList.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleTabChange(subGroupList[activeSubStepIndex + 1].key)}
                  className="px-3.5 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
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
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

