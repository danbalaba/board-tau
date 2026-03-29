"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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
import { IconChartLine, IconTrendingUp } from "@tabler/icons-react"

export const description = "Monthly Bookings & Revenue"

const chartData = [
  { date: "2024-04", bookings: 120, revenue: 45000 },
  { date: "2024-05", bookings: 150, revenue: 58000 },
  { date: "2024-06", bookings: 180, revenue: 67000 },
  { date: "2024-07", bookings: 200, revenue: 72000 },
  { date: "2024-08", bookings: 210, revenue: 78000 },
  { date: "2024-09", bookings: 230, revenue: 85000 },
]

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "#2f7d6d",
  },
  revenue: {
    label: "Revenue (₱)",
    color: "#1473E6",
  },
} satisfies ChartConfig

export function ChartLineInteractive() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("bookings")
  const [viewType, setViewType] = React.useState("growth")

  const total = React.useMemo(
    () => ({
      bookings: chartData.reduce((acc, curr) => acc + curr.bookings, 0),
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
    }),
    []
  )

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6 px-0! py-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1.5 flex-1">
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Growth Trend Analysis</CardTitle>
          <CardDescription className="text-sm font-medium text-gray-500">
            Real-time trajectory over the past 6 months
          </CardDescription>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <ModernSelect
            instanceId="metricSelect"
            value={activeChart}
            onChange={(val) => setActiveChart(val as any)}
            size="sm"
            icon={<IconChartLine size={14} />}
            options={[
              { value: "bookings", label: "Bookings Volume" },
              { value: "revenue", label: "Revenue Growth" },
            ]}
          />
          <ModernSelect
            instanceId="viewTypeLine"
            value={viewType}
            onChange={setViewType}
            size="sm"
            icon={<IconTrendingUp size={14} />}
            options={[
              { value: "growth", label: "Growth View" },
              { value: "cumulative", label: "Comparison" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-8 sm:pt-10">
        <div className="mb-10 flex items-center gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {["bookings", "revenue"].map((key) => {
            const isSelected = activeChart === key;
            const color = chartConfig[key as keyof typeof chartConfig].color;
            return (
              <button
                key={key}
                onClick={() => setActiveChart(key as any)}
                className={`min-w-[180px] p-6 rounded-[24px] border transition-all duration-300 relative overflow-hidden group ${
                  isSelected 
                    ? "bg-white dark:bg-gray-950 border-primary/30 shadow-2xl shadow-primary/5 ring-1 ring-primary/5" 
                    : "bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-primary/10"
                }`}
              >
                <div className="flex flex-col relative z-10">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                    Total {chartConfig[key as keyof typeof chartConfig].label}
                  </span>
                  <span className={`text-2xl font-black mt-2 tracking-tight ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {total[key as keyof typeof total].toLocaleString()}
                  </span>
                  <div className={`mt-4 flex items-center gap-2 text-[10px] font-black tracking-widest uppercase ${isSelected ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <IconTrendingUp size={14} /> +15.5% Growth
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.03] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125" />
                )}
              </button>
            )
          })}
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-gray-100 dark:stroke-gray-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }}
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            />
            <YAxis 
               tickLine={false}
               axisLine={false}
               tickFormatter={(value) => value >= 1000 ? value / 1000 + 'k' : value}
               className="text-[10px] font-bold text-gray-300"
            />
            <ChartTooltip
              cursor={{ stroke: '#2f7d6d', strokeWidth: 1.5, strokeDasharray: '6 6' }}
              content={
                <ChartTooltipContent
                  className="w-[200px] p-5 rounded-[20px] border-none shadow-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
                  indicator="line"
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={chartConfig[activeChart as keyof typeof chartConfig].color}
              strokeWidth={4}
              dot={{ r: 6, fill: 'white', stroke: chartConfig[activeChart as keyof typeof chartConfig].color, strokeWidth: 3 }}
              activeDot={{ r: 8, fill: chartConfig[activeChart as keyof typeof chartConfig].color, stroke: 'white', strokeWidth: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
