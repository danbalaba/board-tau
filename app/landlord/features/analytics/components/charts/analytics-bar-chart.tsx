'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/admin/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/app/admin/components/ui/chart';
import { BarChart3, Building2, Search, Check, X, Filter } from 'lucide-react';
import { AnalyticsSelect, type AnalyticsOption } from '../analytics-select';
import { LandlordMobileFilterSheet } from '@/app/landlord/components/landlord-mobile-filter-sheet';
import { cn } from '@/utils/helper';

interface BarChartDataItem {
  date: string;
  [key: string]: any;
}

interface AnalyticsBarChartProps {
  data?: BarChartDataItem[];
  listings?: Array<{ id: string; title: string }>;
  listingMap?: Record<string, string>;
  propertyName?: string;
  isSingleProperty?: boolean;
  selectedPropertyId?: string;
}

const colors = ['#2f7d6d', '#1473E6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

export function AnalyticsBarChart({
  data = [],
  listings = [],
  listingMap = {},
  propertyName = 'All Properties Portfolio',
  isSingleProperty = false,
  selectedPropertyId = 'all',
}: AnalyticsBarChartProps) {
  // Chart configuration with listings colors
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      revenue: { label: 'Revenue (₱)', color: '#2f7d6d' },
      all: { label: 'All Properties Combined', color: '#2f7d6d' },
    };
    listings.forEach((l, i) => {
      config[l.id] = { label: l.title, color: colors[i % colors.length] };
    });
    return config;
  }, [listings]);

  // Aggregate monthly data summing revenue across all listings for each month
  const processedData = React.useMemo(() => {
    return data.map((d) => {
      const allRev = listings.reduce((sum, l) => sum + (Number(d[l.id]) || 0), 0);
      return {
        ...d,
        all: allRev,
      };
    });
  }, [data, listings]);

  // If viewing a single property, build monthly data specifically for that listing
  const singlePropertyMonthlyData = React.useMemo(() => {
    if (!isSingleProperty || !selectedPropertyId) return [];

    return data.map((d) => {
      const rev = Number(d[selectedPropertyId]) || 0;
      return {
        date: d.date,
        revenue: rev,
      };
    });
  }, [isSingleProperty, selectedPropertyId, data]);

  // Active property selection: defaults to 'all' or selectedPropertyId
  const [activePropertyKey, setActivePropertyKey] = React.useState<string>(
    selectedPropertyId && selectedPropertyId !== 'all' ? selectedPropertyId : 'all'
  );
  const [draftPropertyKey, setDraftPropertyKey] = React.useState<string>(activePropertyKey);
  const [mobileSearchQuery, setMobileSearchQuery] = React.useState<string>('');

  React.useEffect(() => {
    if (selectedPropertyId) {
      setActivePropertyKey(selectedPropertyId);
      setDraftPropertyKey(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const filteredMobileListings = React.useMemo(() => {
    if (!mobileSearchQuery.trim()) return listings;
    const q = mobileSearchQuery.toLowerCase();
    return listings.filter((l) => l.title.toLowerCase().includes(q));
  }, [listings, mobileSearchQuery]);

  // Options for AnalyticsSelect dropdown: "All Properties" + each listing
  const propertyOptions: AnalyticsOption[] = React.useMemo(() => {
    const allOption: AnalyticsOption = {
      value: 'all',
      label: `All Properties (${listings.length} listings)`,
      icon: <Building2 className="w-3.5 h-3.5 text-[#2f7d6d]" />,
    };

    const individualOptions: AnalyticsOption[] = listings.map((l) => ({
      value: l.id,
      label: l.title,
      icon: <Building2 className="w-3.5 h-3.5 text-slate-400" />,
    }));

    return [allOption, ...individualOptions];
  }, [listings]);

  // Single property view vs Multi-property view
  if (isSingleProperty) {
    const totalSingleRevenue = singlePropertyMonthlyData.reduce(
      (sum, d) => sum + d.revenue,
      0
    );

    return (
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="flex flex-col space-y-0 px-0! pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400 shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {propertyName} — Revenue Trajectory
              </CardTitle>
            </div>

            <div className="self-start sm:self-auto px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold shrink-0 whitespace-nowrap">
              Total: ₱{totalSingleRevenue.toLocaleString()}
            </div>
          </div>

          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            6-month monthly revenue history for this property
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0! pt-5">
          {singlePropertyMonthlyData.length === 0 ? (
            <div className="h-[230px] flex items-center justify-center text-xs font-semibold text-slate-400">
              No monthly trajectory available for this property yet.
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[230px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-emerald-500/10 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-emerald-500/10 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:opacity-60 [&_.recharts-rectangle.recharts-tooltip-cursor]:rx-2"
            >
              <BarChart
                data={singlePropertyMonthlyData}
                margin={{ top: 15, right: 15, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-slate-200/60 dark:stroke-slate-800/60"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(val: any) => {
                    const [y, m] = String(val).split('-');
                    const date = new Date(Number(y), Number(m) - 1, 1);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }}
                  className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val: any) =>
                    `₱${Number(val) >= 1000 ? Number(val) / 1000 + 'k' : val}`
                  }
                  className="text-[11px] font-bold text-slate-400 dark:text-slate-500"
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(47, 125, 109, 0.08)', rx: 6 }}
                  content={
                    <ChartTooltipContent
                      className="w-[170px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                      formatter={(val: any) => [
                        `₱${Number(val).toLocaleString()}`,
                        'Monthly Revenue',
                      ]}
                      labelFormatter={(val: any) => {
                        const [y, m] = String(val).split('-');
                        const date = new Date(Number(y), Number(m) - 1, 1);
                        return date.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        });
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="#2f7d6d"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // Multi-property portfolio comparison
  const activeListingTitle =
    activePropertyKey === 'all'
      ? `All Properties (${listings.length} listings)`
      : listingMap[activePropertyKey] ||
        listings.find((l) => l.id === activePropertyKey)?.title ||
        'Selected Property';

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-0! pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
              Monthly Revenue by Property
            </CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {activePropertyKey === 'all'
              ? 'Combined monthly revenue across all registered listings'
              : `Performance history for ${activeListingTitle}`}
          </CardDescription>
        </div>

        {/* Property Selector: Mobile Drawer (< sm) & Desktop Dropdown (>= sm) */}
        {listings.length > 0 && (
          <>
            {/* Desktop Dropdown */}
            <div className="hidden sm:block w-[260px] shrink-0">
              <AnalyticsSelect
                value={activePropertyKey}
                onChange={setActivePropertyKey}
                size="sm"
                icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
                searchable={true}
                placeholder="Select property..."
                options={propertyOptions}
              />
            </div>

            {/* Mobile Bottom Sheet Drawer */}
            <div className="block sm:hidden w-full pt-1">
              <LandlordMobileFilterSheet
                activeFilterCount={activePropertyKey !== 'all' ? 1 : 0}
                triggerLabel={activeListingTitle}
                triggerLabelClassName="max-w-[210px] text-left"
                triggerIcon={<Building2 size={14} className="stroke-[2.2] text-[#2f7d6d] shrink-0" />}
                title="Select Revenue Property"
                subtitle="Filter revenue by property or view all listings combined"
                applyLabel="Apply Selection"
                className="w-full h-10 px-3.5 rounded-xl justify-between border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-xs"
                onClearAll={() => {
                  setDraftPropertyKey('all');
                  setActivePropertyKey('all');
                }}
                onApply={() => {
                  setActivePropertyKey(draftPropertyKey);
                }}
                onOpenChange={(isOpen) => {
                  if (isOpen) {
                    setDraftPropertyKey(activePropertyKey);
                    setMobileSearchQuery('');
                  }
                }}
              >
                <div className="space-y-4">
                  {/* Search within properties */}
                  {listings.length > 4 && (
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search property name..."
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

                  {/* All Properties Scope */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Filter size={12} className="text-[#2f7d6d]" /> Combined Portfolio
                    </span>
                    <button
                      type="button"
                      onClick={() => setDraftPropertyKey('all')}
                      className={cn(
                        "w-full px-4 py-3 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-between cursor-pointer select-none",
                        draftPropertyKey === 'all'
                          ? "bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border-2 border-[#2f7d6d]/40 shadow-xs"
                          : "bg-slate-50/80 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "p-1.5 rounded-lg border",
                          draftPropertyKey === 'all'
                            ? "bg-[#2f7d6d]/15 border-[#2f7d6d]/30 text-[#2f7d6d] dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                        )}>
                          <Building2 size={16} />
                        </div>
                        <div className="text-left">
                          <div className="font-black">All Properties (Combined)</div>
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            {listings.length} listings total
                          </div>
                        </div>
                      </div>
                      {draftPropertyKey === 'all' && (
                        <Check size={18} strokeWidth={3} className="text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  </div>

                  {/* Individual Properties */}
                  {filteredMobileListings.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between">
                        <span>Individual Properties ({filteredMobileListings.length})</span>
                        {draftPropertyKey !== 'all' && (
                          <button
                            type="button"
                            onClick={() => setDraftPropertyKey('all')}
                            className="text-[10px] font-extrabold text-rose-500 hover:underline uppercase tracking-widest cursor-pointer"
                          >
                            Reset Scope
                          </button>
                        )}
                      </span>
                      <div className="space-y-2">
                        {filteredMobileListings.map((l) => {
                          const isSelected = draftPropertyKey === l.id;
                          return (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => setDraftPropertyKey(l.id)}
                              className={cn(
                                "w-full px-4 py-3 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-between cursor-pointer select-none text-left",
                                isSelected
                                  ? "bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border-2 border-[#2f7d6d]/40 shadow-xs"
                                  : "bg-slate-50/80 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <Building2 size={15} className="text-slate-400 shrink-0" />
                                <span className="truncate font-black text-slate-900 dark:text-white">
                                  {l.title}
                                </span>
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

                  {filteredMobileListings.length === 0 && mobileSearchQuery && (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No properties matching &ldquo;{mobileSearchQuery}&rdquo;
                    </div>
                  )}
                </div>
              </LandlordMobileFilterSheet>
            </div>
          </>
        )}
      </CardHeader>

      <CardContent className="px-0! pt-5">
        {data.length === 0 ? (
          <div className="h-[230px] flex items-center justify-center text-xs font-semibold text-slate-400">
            No monthly performance recorded yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[230px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-emerald-500/10 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-emerald-500/10 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:opacity-60 [&_.recharts-rectangle.recharts-tooltip-cursor]:rx-2"
          >
            <BarChart
              data={processedData}
              margin={{ top: 15, right: 15, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-slate-200/60 dark:stroke-slate-800/60"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(val: any) => {
                  const [y, m] = String(val).split('-');
                  const date = new Date(Number(y), Number(m) - 1, 1);
                  return date.toLocaleDateString('en-US', { month: 'short' });
                }}
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: any) =>
                  `₱${Number(val) >= 1000 ? Number(val) / 1000 + 'k' : val}`
                }
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500"
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(47, 125, 109, 0.08)', rx: 6 }}
                content={
                  <ChartTooltipContent
                    className="w-[185px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                    formatter={(val: any) => [
                      `₱${Number(val).toLocaleString()}`,
                      activeListingTitle,
                    ]}
                    labelFormatter={(val: any) => {
                      const [y, m] = String(val).split('-');
                      const date = new Date(Number(y), Number(m) - 1, 1);
                      return date.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      });
                    }}
                  />
                }
              />
              <Bar
                dataKey={activePropertyKey}
                fill="#2f7d6d"
                radius={[8, 8, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default AnalyticsBarChart;
