'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Legend } from 'recharts';
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
import { Layers, BedDouble, PieChart as PieIcon } from 'lucide-react';

interface PropertyTypeItem {
  type: string;
  count: number;
  revenue: number;
  fill?: string;
}

interface RoomDetailItem {
  name: string;
  capacity: number;
  occupiedSlots: number;
  availableSlots: number;
}

interface AnalyticsPieChartProps {
  data?: PropertyTypeItem[];
  propertyName?: string;
  isSingleProperty?: boolean;
  occupiedSlots?: number;
  vacantSlots?: number;
  totalCapacity?: number;
  occupancyRate?: number;
  roomDetails?: RoomDetailItem[];
}

const colors = [
  '#2f7d6d', // Emerald Teal
  '#6366f1', // Indigo
  '#f59e0b', // Amber Gold
  '#06b6d4', // Sky Cyan
  '#ec4899', // Rose
  '#8b5cf6', // Purple
  '#10b981', // Mint
];

const categoryColorMap: Record<string, string> = {
  'Boarding House': '#2f7d6d',
  Apartment: '#6366f1',
  Dormitory: '#f59e0b',
  Studio: '#8b5cf6',
  House: '#10b981',
  'Transient House': '#06b6d4',
  'Agri-Hostel': '#ec4899',
  Other: '#64748b',
};

const defaultPortfolioData: PropertyTypeItem[] = [
  { type: 'Boarding House', count: 1, revenue: 0 },
];

export function AnalyticsPieChart({
  data = [],
  propertyName = 'All Properties Portfolio',
  isSingleProperty = false,
  occupiedSlots = 0,
  vacantSlots = 0,
  totalCapacity = 0,
  occupancyRate = 0,
  roomDetails = [],
}: AnalyticsPieChartProps) {
  // Single Property View Mode: 'occupancy' (Occupied vs Vacant) or 'rooms' (Beds by room)
  const [singleMode, setSingleMode] = React.useState<'occupancy' | 'rooms'>('occupancy');

  // Portfolio View Mode: 'count' (Units) or 'revenue' (Income ₱)
  const [portfolioMetric, setPortfolioMetric] = React.useState<'count' | 'revenue'>('count');
  const [isDonut, setIsDonut] = React.useState<boolean>(true);

  // Single Property Chart Data
  const singleChartData = React.useMemo(() => {
    if (singleMode === 'occupancy') {
      return [
        {
          name: 'Occupied Beds',
          value: occupiedSlots,
          fill: '#2f7d6d',
          percentage: totalCapacity > 0 ? Math.round((occupiedSlots / totalCapacity) * 100) : 0,
        },
        {
          name: 'Available Beds',
          value: vacantSlots,
          fill: '#f59e0b',
          percentage: totalCapacity > 0 ? Math.round((vacantSlots / totalCapacity) * 100) : 0,
        },
      ].filter((d) => d.value > 0);
    }

    // By Room distribution
    return roomDetails.map((r, i) => ({
      name: r.name,
      value: r.capacity,
      occupied: r.occupiedSlots,
      available: r.availableSlots,
      fill: colors[i % colors.length],
      percentage: totalCapacity > 0 ? Math.round((r.capacity / totalCapacity) * 100) : 0,
    }));
  }, [singleMode, occupiedSlots, vacantSlots, totalCapacity, roomDetails]);

  // Portfolio Chart Data
  const portfolioChartData = React.useMemo(() => {
    const source = data && data.length > 0 ? data : defaultPortfolioData;
    return source.map((d, i) => ({
      name: d.type,
      value: portfolioMetric === 'revenue' ? d.revenue : d.count,
      rawCount: d.count,
      rawRevenue: d.revenue,
      fill: d.fill || categoryColorMap[d.type] || colors[i % colors.length],
    }));
  }, [data, portfolioMetric]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: { label: isSingleProperty ? 'Beds' : portfolioMetric === 'revenue' ? 'Revenue' : 'Units' },
    };
    return config;
  }, [isSingleProperty, portfolioMetric]);

  // SINGLE PROPERTY MODE
  if (isSingleProperty) {
    const hasCapacity = totalCapacity > 0;

    return (
      <Card className="pt-0 pb-0 border-none shadow-none bg-transparent">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 space-y-0 px-0! pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
                <BedDouble className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {propertyName} — Bedspace Capacity
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Capacity breakdown across registered rooms ({totalCapacity} total beds)
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Occupancy Rate Badge */}
            <div className="px-3 py-1 rounded-xl bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border border-[#2f7d6d]/20 text-xs font-black">
              {occupancyRate}% Occupied
            </div>

            {/* Toggle if rooms exist */}
            {roomDetails.length > 1 && (
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setSingleMode('occupancy')}
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    singleMode === 'occupancy'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Occupancy
                </button>
                <button
                  type="button"
                  onClick={() => setSingleMode('rooms')}
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    singleMode === 'rooms'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Rooms
                </button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0! pt-3 sm:pt-4 flex flex-col items-center justify-start min-h-[275px] sm:min-h-[290px]">
          {!hasCapacity || singleChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[265px] sm:h-[285px] w-full text-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <BedDouble className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No rooms or beds configured yet
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px] mt-1">
                Add room details in Room Management to see bedspace occupancy metrics.
              </p>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[265px] sm:h-[285px] w-full"
            >
              <PieChart margin={{ top: 12, right: 10, bottom: 8, left: 10 }}>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[170px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-xs font-medium"
                      nameKey="name"
                      formatter={(val: any, name: any, item: any) => {
                        const payload = item?.payload as any;
                        if (singleMode === 'occupancy') {
                          return [`${val} beds (${payload?.percentage}%)`, payload?.name];
                        }
                        return [
                          `${val} beds (${payload?.occupied} occ / ${payload?.available} avail)`,
                          payload?.name,
                        ];
                      }}
                    />
                  }
                />
                <Pie
                  data={singleChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="40%"
                  innerRadius={isDonut ? 44 : 0}
                  outerRadius={70}
                  strokeWidth={2}
                  stroke="transparent"
                  paddingAngle={4}
                >
                  {singleChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      className="transition-opacity hover:opacity-90 cursor-pointer"
                      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: '12px', paddingBottom: '4px' }}
                  formatter={(value: any) => (
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-200 mx-1 leading-tight">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // FULL PORTFOLIO MODE
  const totalValue = portfolioChartData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  return (
    <Card className="pt-0 pb-0 border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 space-y-0 px-0! pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Property Portfolio Types
            </CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Breakdown across your registered properties
          </CardDescription>
        </div>

        {/* Portfolio metric & view toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setPortfolioMetric('count')}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                portfolioMetric === 'count'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Units
            </button>
            <button
              type="button"
              onClick={() => setPortfolioMetric('revenue')}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                portfolioMetric === 'revenue'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Income
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsDonut(!isDonut)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title={isDonut ? 'Switch to Solid Pie' : 'Switch to Donut'}
          >
            <PieIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-3 sm:pt-4 flex flex-col items-center justify-start min-h-[275px] sm:min-h-[290px]">
        {totalValue === 0 ? (
          <div className="flex flex-col items-center justify-center h-[265px] sm:h-[285px] w-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              <Layers className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-[200px]">
              No {portfolioMetric === 'revenue' ? 'revenue' : 'properties'} recorded yet across categories
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[265px] sm:h-[285px] w-full"
          >
            <PieChart margin={{ top: 12, right: 10, bottom: 8, left: 10 }}>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[170px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-xs font-medium"
                    nameKey="name"
                    formatter={(val: any, name: any, item: any) => {
                      const payload = item?.payload as any;
                      if (portfolioMetric === 'revenue') {
                        return [`₱${Number(val).toLocaleString()}`, payload?.name];
                      }
                      return [`${val} properties`, payload?.name];
                    }}
                  />
                }
              />
              <Pie
                data={portfolioChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="40%"
                innerRadius={isDonut ? 44 : 0}
                outerRadius={70}
                strokeWidth={2}
                stroke="transparent"
                paddingAngle={4}
              >
                {portfolioChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="transition-opacity hover:opacity-90 cursor-pointer"
                    style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: '12px', paddingBottom: '4px' }}
                formatter={(value: any) => (
                  <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-200 mx-1 leading-tight">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default AnalyticsPieChart;
