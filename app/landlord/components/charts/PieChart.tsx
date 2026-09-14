"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/admin/components/ui/chart"
import dynamic from 'next/dynamic'
const ModernSelect = dynamic(() => import('@/components/common/ModernSelect'), { ssr: false })
import { Layers, Hash, Filter } from "lucide-react"

export const description = "Property Type Distribution"

interface ChartDataItem {
  type: string;
  count: number;
  revenue: number;
  fill?: string;
}

interface ChartPieLabelProps {
  data?: ChartDataItem[];
}

const colors = [
  "#10b981", // Emerald Green
  "#3b82f6", // Vibrant Royal Blue
  "#8b5cf6", // Radiant Purple/Violet
  "#f59e0b", // Amber Gold
  "#ec4899", // Electric Pink
  "#06b6d4", // Cyan
  "#f97316", // Coral Orange
];

const categoryColorMap: Record<string, string> = {
  "Boarding House": "#10b981",
  "Apartment": "#3b82f6",
  "Studio": "#8b5cf6",
  "House": "#f59e0b",
  "Transient House": "#ec4899",
  "Agri-Hostel": "#06b6d4",
  "Dormitory": "#f97316",
  "Other": "#64748b",
};

const defaultChartData: ChartDataItem[] = [
  { type: "Boarding House", count: 12, revenue: 45000 },
  { type: "Apartment", count: 8, revenue: 58000 },
  { type: "Studio", count: 15, revenue: 32000 },
  { type: "Transient House", count: 5, revenue: 25000 },
]

const chartConfig = {
  count: {
    label: "Unit Count",
  },
  revenue: {
    label: "Revenue Contribution",
  },
} satisfies ChartConfig

export function ChartPieLabel({ data }: ChartPieLabelProps) {
  const [activeMetric, setActiveMetric] = React.useState<keyof typeof chartConfig>("count")
  const [viewType, setViewType] = React.useState("donut")
  const [tick, setTick] = React.useState(0)

  const processedData = React.useMemo(() => {
    const source = data && data.length > 0 ? data : defaultChartData;
    return source.map((d, i) => ({
      ...d,
      fill: d.fill || categoryColorMap[d.type] || colors[i % colors.length]
    }));
  }, [data]);

  const handleMetricChange = (val: string) => {
    setActiveMetric(val as keyof typeof chartConfig);
    setTick(t => t + 1);
  };

  return (
    <Card className="pt-0 pb-0 border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 space-y-0 px-0! pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Property Types</CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Breakdown of your properties by category
          </CardDescription>
        </div>
        
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
          <ModernSelect
            instanceId="pieMetric"
            value={activeMetric}
            onChange={handleMetricChange}
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
            options={[
              { value: "count", label: "By Count" },
              { value: "revenue", label: "By Revenue" },
            ]}
          />
          <ModernSelect
            instanceId="pieView"
            value={viewType}
            onChange={setViewType}
            size="sm"
            icon={<Hash className="w-3.5 h-3.5" />}
            options={[
              { value: "donut", label: "Donut" },
              { value: "pie", label: "Pie" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-4 flex flex-col items-center justify-start">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[215px] sm:h-[250px] w-full"
        >
          <PieChart key={`${activeMetric}-${tick}`}>
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  className="w-[170px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-xs font-medium"
                  nameKey="type" 
                />
              }
            />
            <Pie
              data={processedData}
              dataKey={activeMetric}
              nameKey="type"
              cx="50%"
              cy="45%"
              innerRadius={viewType === "donut" ? 50 : 0}
              outerRadius={80}
              strokeWidth={3}
              stroke="transparent"
              paddingAngle={4}
            >
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  className="transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))" }}
                />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: "12px" }}
              formatter={(value) => <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mx-1">{value}</span>}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}