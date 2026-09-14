'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '@/components/modals/Modal';
import { 
  Sparkles, X, CheckCircle2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft 
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface AmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenities?: any[];
  groupedSubGroups?: { key: string; label: string; items: { id: string; name: string; icon?: string }[] }[];
}

export default function AmenitiesModal({
  isOpen,
  onClose,
  amenities = [],
  groupedSubGroups = []
}: AmenitiesModalProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic Lucide Icon Resolver
  const renderItemIcon = (iconName?: string, name?: string) => {
    if (iconName && (LucideIcons as any)[iconName]) {
      const DynamicIcon = (LucideIcons as any)[iconName];
      return <DynamicIcon size={16} className="text-blue-500 shrink-0" />;
    }

    const lower = (name || '').toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return <LucideIcons.Wifi size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('car') || lower.includes('parking') || lower.includes('garage')) return <LucideIcons.Car size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('bike') || lower.includes('bicycle')) return <LucideIcons.Bike size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('stove') || lower.includes('cook') || lower.includes('kitchen') || lower.includes('eatery')) return <LucideIcons.Utensils size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('refrigerator') || lower.includes('fridge')) return <LucideIcons.Refrigerator size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('kettle') || lower.includes('coffee')) return <LucideIcons.Coffee size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('microwave')) return <LucideIcons.Microwave size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('laundry') || lower.includes('wash') || lower.includes('sampayan')) return <LucideIcons.WashingMachine size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('water') || lower.includes('bidet') || lower.includes('droplet') || lower.includes('drum')) return <LucideIcons.Droplets size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('generator') || lower.includes('pump') || lower.includes('power') || lower.includes('zap')) return <LucideIcons.Zap size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('store') || lower.includes('shop') || lower.includes('sari-sari')) return <LucideIcons.ShoppingBag size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('shower') || lower.includes('heater') || lower.includes('cr') || lower.includes('bath')) return <LucideIcons.ShowerHead size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('study') || lower.includes('book')) return <LucideIcons.BookOpen size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('caretaker') || lower.includes('housekeeping')) return <LucideIcons.UserCheck size={16} className="text-blue-500 shrink-0" />;
    if (lower.includes('sofa') || lower.includes('lounge')) return <LucideIcons.Sofa size={16} className="text-blue-500 shrink-0" />;

    return <CheckCircle2 size={16} className="text-blue-500 shrink-0" />;
  };

  // Scroll category tabs left/right
  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Total amenity count calculation
  const totalCount = useMemo(() => {
    if (groupedSubGroups.length > 0) {
      return groupedSubGroups.reduce((sum, g) => sum + g.items.length, 0);
    }
    return amenities.length;
  }, [groupedSubGroups, amenities]);

  // Dynamic category pills with item counts
  const categoryTabs = useMemo(() => {
    if (groupedSubGroups.length > 0) {
      const tabs = groupedSubGroups.map(g => ({
        key: g.key,
        label: g.label,
        count: g.items.length,
      }));
      return [{ key: 'ALL', label: 'All Amenities', count: totalCount }, ...tabs];
    }
    return [{ key: 'ALL', label: 'All Amenities', count: totalCount }];
  }, [groupedSubGroups, totalCount]);

  // Active sub-step index and navigation helper
  const subGroupList = useMemo(() => {
    return groupedSubGroups.map(g => ({ key: g.key, label: g.label }));
  }, [groupedSubGroups]);

  const activeSubStepIndex = useMemo(() => {
    return subGroupList.findIndex(g => g.key === activeTab);
  }, [subGroupList, activeTab]);

  // Auto-scroll active category tab into center view smoothly
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

  // Filter groups by active category tab and search query
  const filteredGroups = useMemo(() => {
    if (groupedSubGroups.length === 0) return [];
    
    const query = searchQuery.trim().toLowerCase();

    return groupedSubGroups
      .filter(g => activeTab === 'ALL' || g.key === activeTab)
      .map(g => {
        if (!query) return g;
        const matchingItems = g.items.filter(item => item.name.toLowerCase().includes(query));
        return { ...g, items: matchingItems };
      })
      .filter(g => g.items.length > 0);
  }, [groupedSubGroups, activeTab, searchQuery]);

  // Filter fallback items if groupedSubGroups is empty
  const filteredFallbackItems = useMemo(() => {
    if (groupedSubGroups.length > 0) return [];
    const query = searchQuery.trim().toLowerCase();
    return amenities.filter((item: any) => {
      const name = typeof item === 'object' ? item.name || item.attribute?.name : String(item);
      return !query || name.toLowerCase().includes(query);
    });
  }, [amenities, groupedSubGroups, searchQuery]);

  const hasResults = filteredGroups.length > 0 || filteredFallbackItems.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="lg" fullOnMobile>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 h-full sm:h-[620px] max-h-none sm:max-h-[85vh] min-h-0 sm:min-h-[500px] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
              <Sparkles size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                Shared Property Amenities
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400">
                {totalCount} Verified Property Amenities
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
            placeholder="Search amenities (e.g., WiFi, Stove, Bidet, Parking)..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
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
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
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

        {/* Single Smooth Vertical Content Area */}
        <div ref={contentScrollRef} className="overflow-y-auto flex-1 no-scrollbar space-y-4 py-1 pr-1 scroll-smooth">
          {hasResults ? (
            groupedSubGroups.length > 0 ? (
              filteredGroups.map(group => (
                <div key={group.key} className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-1.5">
                    <h5 className="font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      {group.label}
                    </h5>
                    <span className="text-[10px] font-bold text-gray-400">({group.items.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {group.items.map(item => (
                      <div 
                        key={item.id || item.name} 
                        className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-blue-500/30 transition-colors"
                      >
                        <div className="p-1.5 bg-blue-500/10 rounded-lg shrink-0">
                          {renderItemIcon(item.icon, item.name)}
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredFallbackItems.map((item: any, idx: number) => {
                  const name = typeof item === 'object' ? item.name || item.attribute?.name : String(item);
                  const iconName = typeof item === 'object' ? item.icon || item.attribute?.icon : '';

                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/60"
                    >
                      <div className="p-1.5 bg-blue-500/10 rounded-lg shrink-0">
                        {renderItemIcon(iconName, name)}
                      </div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate" title={name}>
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-200 dark:border-gray-700/60 rounded-3xl p-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Sparkles size={28} />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {searchQuery ? `No amenities matching "${searchQuery}"` : "No amenities listed"}
              </h4>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm">
                {searchQuery ? "Try searching for another keyword like wifi, aircon, parking, or laundry." : "There are no specific property amenities listed under this category."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); handleTabChange('ALL'); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all cursor-pointer shadow-sm mt-2"
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
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-1 sm:flex-initial justify-center"
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
                  {activeSubStepIndex > 0 ? `Prev: ${subGroupList[activeSubStepIndex - 1].label}` : 'All Amenities'}
                </span>
              </button>

              {activeSubStepIndex < subGroupList.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleTabChange(subGroupList[activeSubStepIndex + 1].key)}
                  className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
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
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}


