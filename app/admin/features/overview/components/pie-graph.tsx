'use client';

import * as React from 'react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import { Badge } from "../../../components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "../../../components/ui/chart";
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";
import { Layers } from 'lucide-react';

const categoryColorMap: Record<string, string> = {
  "Boarding House": "#2f7d6d",
  "Apartment": "#6366f1",
  "Dormitory": "#f59e0b",
  "Studio": "#8b5cf6",
  "House": "#10b981",
  "Transient House": "#06b6d4",
  "Agri-Hostel": "#ec4899",
  "Other": "#64748b",
};

const defaultColors = [
  "#2f7d6d",
  "#6366f1",
  "#f59e0b",
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#ec4899",
];

export function PieGraph({ data: propData }: { data?: any[] }) {
  const { data: apiResponse } = useExecutiveOverview('30d');
  const data = propData || apiResponse?.data?.charts?.propertyDistribution || [];
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

  const totalProperties = React.useMemo(() => {
    return data.reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);
  }, [data]);

  const chartData = React.useMemo(() => {
    return data.map((item: any, idx: number) => {
      const color = categoryColorMap[item.name] || item.color || defaultColors[idx % defaultColors.length];
      const percentage = totalProperties > 0 ? Math.round((item.value / totalProperties) * 100) : 0;
      return {
        ...item,
        fill: color,
        percentage,
      };
    }).sort((a: any, b: any) => b.value - a.value);
  }, [data, totalProperties]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      total: { label: 'Total' }
    };
    chartData.forEach(item => {
      config[item.name.toLowerCase()] = {
        label: item.name,
        color: item.fill
      };
    });
    return config;
  }, [chartData]);

  return (
    <Card className='flex h-full flex-col border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-xs hover:shadow-lg rounded-[24px] sm:rounded-[26px] overflow-hidden transition-all duration-300'>
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Properties by Category</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Distribution of platform listings by type
            </CardDescription>
          </div>
        </div>
        <Badge variant='outline' className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 font-extrabold uppercase text-[10px] h-6 px-2.5 rounded-full shadow-2xs">
          {totalProperties} Total
        </Badge>
      </CardHeader>

      <CardContent className='flex-1 flex flex-col justify-center p-6'>
        {chartData.length === 0 || totalProperties === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Listings Recorded</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Property distribution will appear as listings are approved.</p>
          </div>
        ) : (
          /* ── Balanced Responsive Split Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-5 flex items-center justify-center">
              <ChartContainer
                config={chartConfig}
                className='mx-auto aspect-square max-h-[220px] min-h-[200px] w-full'
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-xs font-medium"
                        hideLabel
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={85}
                    dataKey='value'
                    nameKey='name'
                    strokeWidth={3}
                    stroke="transparent"
                    paddingAngle={3}
                  >
                    {chartData.map((entry: any, index: number) => {
                      const isHovered = hoveredCategory === entry.name;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          className="transition-all duration-300 cursor-pointer"
                          style={{
                            opacity: hoveredCategory && !isHovered ? 0.45 : 1,
                            filter: isHovered ? "drop-shadow(0 6px 12px rgba(0,0,0,0.18))" : "drop-shadow(0 3px 6px rgba(0,0,0,0.06))",
                            transform: isHovered ? "scale(1.04)" : "scale(1)",
                            transformOrigin: "center center",
                          }}
                        />
                      );
                    })}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-slate-900 dark:fill-white text-2xl font-black tracking-tight"
                              >
                                {totalProperties.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-slate-400 dark:fill-slate-500 text-[10px] uppercase font-bold tracking-widest"
                              >
                                Units
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Rich Category Breakdown List */}
            <div className="sm:col-span-7 space-y-2.5">
              {chartData.map((cat: any, index: number) => {
                const isHovered = hoveredCategory === cat.name;

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`group p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? 'bg-slate-100 dark:bg-slate-800 border-[#2f7d6d]/40 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.fill }}
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                          {cat.value} {cat.value === 1 ? 'unit' : 'units'}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Proportional Mini Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.fill,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
