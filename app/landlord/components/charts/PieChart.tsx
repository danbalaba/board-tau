"use client"

import * as React from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
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
import { IconChartPie, IconHash } from "@tabler/icons-react"

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

const colors = ["#2f7d6d", "#1473E6", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];

const defaultChartData: ChartDataItem[] = [
  { type: "Apartment", count: 12, revenue: 45000 },
  { type: "House", count: 8, revenue: 58000 },
  { type: "Studio", count: 15, revenue: 32000 },
  { type: "Loft", count: 5, revenue: 25000 },
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
      fill: d.fill || colors[i % colors.length]
    }));
  }, [data]);

  const handleMetricChange = (val: string) => {
    setActiveMetric(val as keyof typeof chartConfig);
    setTick(t => t + 1);
  };

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-0! pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Portfolio Allocation</CardTitle>
          <CardDescription className="text-xs font-medium text-gray-500">
            Distribution across categories
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2 w-auto">
          <ModernSelect
            instanceId="pieMetric"
            value={activeMetric}
            onChange={handleMetricChange}
            size="sm"
            icon={<IconChartPie size={12} />}
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
            icon={<IconHash size={12} />}
            options={[
              { value: "donut", label: "Donut" },
              { value: "pie", label: "Pie" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-1 flex flex-col items-center">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[200px] w-full"
        >
          <PieChart key={`${activeMetric}-${tick}`}>
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  className="w-[140px] p-3 rounded-xl border-none shadow-xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
                  nameKey="type" 
                />
              }
            />
            <Pie
              data={processedData}
              dataKey={activeMetric}
              nameKey="type"
              innerRadius={viewType === "donut" ? 50 : 0}
              outerRadius={80}
              strokeWidth={4}
              stroke="white"
              paddingAngle={3}
            >
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.06))" }}
                />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mx-1">{value}</span>}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}