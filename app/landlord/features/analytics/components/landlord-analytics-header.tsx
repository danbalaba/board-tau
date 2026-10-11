'use client';

import React, { useState } from 'react';
import { Building2, Sparkles, BarChart3, Search, Check, X, Filter } from 'lucide-react';
import Skeleton from '@/components/common/Skeleton';
import { AnalyticsSelect } from './analytics-select';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import { LandlordPropertyOption } from '@/services/landlord/analytics';
import { LandlordMobileFilterSheet } from '@/app/landlord/components/landlord-mobile-filter-sheet';
import { cn } from '@/utils/helper';

interface LandlordAnalyticsHeaderProps {
  propertyList?: LandlordPropertyOption[];
  selectedPropertyId?: string;
  onSelectProperty?: (val: string) => void;
  handleGenerateReport?: () => Promise<void>;
  propertyName?: string;
  isSingleProperty?: boolean;
  isLoading?: boolean;
}

export function LandlordAnalyticsHeader({
  propertyList = [],
  selectedPropertyId = 'all',
  onSelectProperty,
  handleGenerateReport,
  propertyName = 'All Properties Portfolio',
  isSingleProperty = false,
  isLoading = false,
}: LandlordAnalyticsHeaderProps) {
  // Mobile sheet draft states
  const [draftPropertyId, setDraftPropertyId] = useState(selectedPropertyId);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="relative z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Title & Scope Branding Skeleton */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 sm:h-8 w-56 sm:w-80 rounded-xl" variant="text" />
              <Skeleton className="h-4 w-44 sm:w-64 rounded-lg opacity-60" variant="text" />
            </div>
          </div>

          {/* Filter Controls Bar Skeleton */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <Skeleton className="h-9 sm:h-11 w-28 lg:w-[300px] xl:w-[340px] rounded-xl sm:rounded-2xl" />
            <Skeleton className="h-9 sm:h-11 w-32 sm:w-36 rounded-xl sm:rounded-2xl shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  const selectedPropertyObj = propertyList.find((p) => p.id === selectedPropertyId);

  const propertyOptions = [
    {
      value: 'all',
      label: propertyList.length > 0
        ? `All Properties (${propertyList.length} listings)`
        : 'All Properties',
    },
    ...propertyList.map((p) => {
      const titleLower = p.title.toLowerCase();
      const typeLower = (p.propertyType || '').toLowerCase();
      const typeFormatted = p.propertyType ? p.propertyType.replace(/[-_]/g, ' ') : '';

      const alreadyHasType = Boolean(
        typeLower && (titleLower.includes(typeLower) || titleLower.includes(typeFormatted.toLowerCase()))
      );

      const label = alreadyHasType || !p.propertyType
        ? p.title
        : `${p.title} • ${p.propertyType}`;

      return {
        value: p.id,
        label,
      };
    }),
  ];

  // Filter properties in mobile drawer search
  const filteredMobileList = propertyList.filter((p) => {
    if (!mobileSearchQuery.trim()) return true;
    const query = mobileSearchQuery.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(query);
    const typeMatch = (p.propertyType || '').toLowerCase().includes(query);
    return titleMatch || typeMatch;
  });

  return (
    <div className="relative z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Title & Scope Branding */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#2f7d6d]/10 dark:bg-emerald-500/10 text-[#2f7d6d] dark:text-emerald-400 border border-[#2f7d6d]/20 flex items-center justify-center shrink-0 shadow-xs">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Analytics & Performance
              </h1>
              {isSingleProperty && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border border-[#2f7d6d]/20 tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Listing View
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-relaxed">
                {isSingleProperty ? `Viewing details for: ${propertyName}` : 'Track your earnings, room occupancy, and student bookings'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          {/* Desktop Universal Property Dropdown (lg screens and up) */}
          <div className="hidden lg:block w-[300px] xl:w-[340px]">
            <AnalyticsSelect
              value={selectedPropertyId}
              onChange={(val: string) => onSelectProperty?.(val)}
              options={propertyOptions}
              searchable={true}
              icon={<Building2 className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Mobile Bottom Sheet Drawer Trigger (lg:hidden) */}
          <div className="block lg:hidden flex-1 sm:flex-none">
            <LandlordMobileFilterSheet
              activeFilterCount={selectedPropertyId !== 'all' ? 1 : 0}
              triggerLabel={selectedPropertyId !== 'all' ? (selectedPropertyObj?.title || '1 Listing') : 'Filters & Sort'}
              title="Select Property Scope"
              subtitle="Filter analytics by property or view entire portfolio"
              className="w-full sm:w-auto h-9 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-2xl justify-center"
              onClearAll={() => {
                setDraftPropertyId('all');
                onSelectProperty?.('all');
              }}
              onApply={() => {
                onSelectProperty?.(draftPropertyId);
              }}
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  setDraftPropertyId(selectedPropertyId);
                  setMobileSearchQuery('');
                }
              }}
            >
              {/* Drawer Content Body: Search & Property Selector */}
              <div className="space-y-4">
                {/* 1. Quick Search Filter */}
                {propertyList.length > 4 && (
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search property name or type..."
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2f7d6d] transition-all"
                    />
                    {mobileSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMobileSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* 2. All Properties Portfolio Option */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Filter size={12} className="text-[#2f7d6d]" /> Portfolio Scope
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraftPropertyId('all')}
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer select-none",
                      draftPropertyId === 'all'
                        ? "bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border-2 border-[#2f7d6d]/40 shadow-xs"
                        : "bg-slate-50/80 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "p-1.5 rounded-lg border",
                        draftPropertyId === 'all'
                          ? "bg-[#2f7d6d]/15 border-[#2f7d6d]/30 text-[#2f7d6d] dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                      )}>
                        <Building2 size={16} />
                      </div>
                      <div className="text-left">
                        <div className="font-black">All Properties Portfolio</div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 lowercase">
                          {propertyList.length} total listings
                        </div>
                      </div>
                    </div>
                    {draftPropertyId === 'all' && (
                      <Check size={18} strokeWidth={3} className="text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                </div>

                {/* 3. Individual Listings Selection */}
                {filteredMobileList.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span>Specific Listings ({filteredMobileList.length})</span>
                      {draftPropertyId !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setDraftPropertyId('all')}
                          className="text-[10px] font-extrabold text-rose-500 hover:underline uppercase tracking-widest cursor-pointer"
                        >
                          Reset Scope
                        </button>
                      )}
                    </span>
                    <div className="space-y-2">
                      {filteredMobileList.map((p) => {
                        const isSelected = draftPropertyId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setDraftPropertyId(p.id)}
                            className={cn(
                              "w-full px-4 py-3 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-between cursor-pointer select-none text-left",
                              isSelected
                                ? "bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border-2 border-[#2f7d6d]/40 shadow-xs"
                                : "bg-slate-50/80 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div className="truncate font-black text-slate-900 dark:text-white">
                                {p.title}
                              </div>
                              {p.propertyType && (
                                <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 shrink-0">
                                  {p.propertyType.replace(/[-_]/g, ' ')}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <Check size={18} strokeWidth={3} className="text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredMobileList.length === 0 && mobileSearchQuery && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No properties matching &ldquo;{mobileSearchQuery}&rdquo;
                  </div>
                )}
              </div>
            </LandlordMobileFilterSheet>
          </div>

          {/* Generate Report Button */}
          <GenerateReportButton
            onGeneratePDF={handleGenerateReport || (async () => {})}
            moduleType="property"
            moduleTitle="Analytics"
            label="Generate Report"
            outline={false}
            className="flex-1 sm:flex-none w-full sm:w-auto h-9 sm:h-11 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-[#2f7d6d] hover:bg-[#256658] text-white font-black uppercase text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest shadow-md shadow-[#2f7d6d]/20 border-b-2 sm:border-b-4 border-[#256658] active:border-b-0 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

