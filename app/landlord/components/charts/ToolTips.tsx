"use client"

import * as React from "react"
import { Bar, BarChart, XAxis, CartesianGrid, YAxis } from "recharts"
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
import { IconFilter, IconListSearch } from "@tabler/icons-react"

export const description = "Inquiry Sources Breakdown"

const chartData = [
  { date: "2024-04", direct: 120, email: 80, social: 50 },
  { date: "2024-05", direct: 150, email: 95, social: 60 },
  { date: "2024-06", direct: 180, email: 110, social: 75 },
  { date: "2024-07", direct: 200, email: 125, social: 85 },
  { date: "2024-08", direct: 210, email: 130, social: 90 },
  { date: "2024-09", direct: 230, email: 140, social: 100 },
]

const chartConfig = {
  direct: {
    label: "Direct Traffic",
    color: "#2f7d6d",
  },
  email: {
    label: "Email Marketing",
    color: "#1473E6",
  },
  social: {
    label: "Social Media",
    color: "#F59E0B",
  },
} satisfies ChartConfig

export function ChartTooltipDefault() {
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [displayMode, setDisplayMode] = React.useState("stacked")

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-0! pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Lead Origin Analysis</CardTitle>
          <CardDescription className="text-xs font-medium text-gray-500">
            Channel conversion breakdown
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2 w-auto">
          <ModernSelect
            instanceId="sourceSelect"
            value={sourceFilter}
            onChange={setSourceFilter}
            size="sm"
            icon={<IconFilter size={12} />}
            options={[
              { value: "all", label: "All Channels" },
              { value: "direct", label: "Direct" },
              { value: "email", label: "Email" },
              { value: "social", label: "Social" },
            ]}
          />
          <ModernSelect
            instanceId="displayModeInquiry"
            value={displayMode}
            onChange={setDisplayMode}
            size="sm"
            icon={<IconListSearch size={12} />}
            options={[
              { value: "stacked", label: "Stacked" },
              { value: "grouped", label: "Compare" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 12, right: 5, left: 5, bottom: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-gray-100 dark:stroke-gray-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
              }}
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            />
            <YAxis 
               tickLine={false}
               axisLine={false}
               tickFormatter={(value) => value >= 1000 ? value / 1000 + 'k' : value}
               className="text-[10px] font-bold text-gray-300"
            />
            <Bar
              dataKey="direct"
              stackId={displayMode === "stacked" ? "a" : undefined}
              fill="#2f7d6d"
              radius={displayMode === "stacked" ? [3, 3, 3, 3] : [6, 6, 3, 3]}
              barSize={displayMode === "stacked" ? 35 : 18}
              hide={sourceFilter !== "all" && sourceFilter !== "direct"}
            />
            <Bar
              dataKey="email"
              stackId={displayMode === "stacked" ? "a" : undefined}
              fill="#1473E6"
              radius={displayMode === "stacked" ? [3, 3, 3, 3] : [6, 6, 3, 3]}
              barSize={displayMode === "stacked" ? 35 : 18}
              hide={sourceFilter !== "all" && sourceFilter !== "email"}
            />
            <Bar
              dataKey="social"
              stackId={displayMode === "stacked" ? "a" : undefined}
              fill="#F59E0B"
              radius={displayMode === "stacked" ? [6, 6, 3, 3] : [6, 6, 3, 3]}
              barSize={displayMode === "stacked" ? 35 : 18}
              hide={sourceFilter !== "all" && sourceFilter !== "social"}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  className="w-[160px] p-3 rounded-xl border-none shadow-xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md" 
                />
              }
              cursor={{ fill: 'var(--primary)', opacity: 0.05, radius: 8 }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
