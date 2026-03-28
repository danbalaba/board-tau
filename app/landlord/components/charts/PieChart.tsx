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

const chartData = [
  { type: "Apartment", count: 12, revenue: 45000, fill: "#2f7d6d" },
  { type: "House", count: 8, revenue: 58000, fill: "#1473E6" },
  { type: "Studio", count: 15, revenue: 32000, fill: "#F59E0B" },
  { type: "Loft", count: 5, revenue: 25000, fill: "#8B5CF6" },
]

const chartConfig = {
  count: {
    label: "Unit Count",
  },
  revenue: {
    label: "Revenue Contribution",
  },
} satisfies ChartConfig

export function ChartPieLabel() {
  const [activeMetric, setActiveMetric] = React.useState<keyof typeof chartConfig>("count")
  const [viewType, setViewType] = React.useState("donut")

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6 px-0! py-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1.5 flex-1">
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Portfolio Allocation</CardTitle>
          <CardDescription className="text-sm font-medium text-gray-500">
            Distribution across categories
          </CardDescription>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <ModernSelect
            instanceId="pieMetric"
            value={activeMetric}
            onChange={(val) => setActiveMetric(val as any)}
            size="sm"
            icon={<IconChartPie size={14} />}
            options={[
              { value: "count", label: "By Unit Count" },
              { value: "revenue", label: "By Revenue Share" },
            ]}
          />
          <ModernSelect
            instanceId="pieView"
            value={viewType}
            onChange={setViewType}
            size="sm"
            icon={<IconHash size={14} />}
            options={[
              { value: "donut", label: "Donut Chart" },
              { value: "pie", label: "Classic Pie" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-10 flex flex-col items-center">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[380px] w-full"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  className="w-[200px] p-5 rounded-[20px] border-none shadow-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
                  nameKey="type" 
                />
              }
            />
            <Pie
              data={chartData}
              dataKey={activeMetric}
              nameKey="type"
              innerRadius={viewType === "donut" ? 90 : 0}
              outerRadius={135}
              strokeWidth={8}
              stroke="white"
              paddingAngle={6}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))" }}
                />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: "60px" }}
              formatter={(value) => <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mx-2">{value}</span>}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
