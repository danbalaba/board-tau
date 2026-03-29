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
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6 px-0! py-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1.5 flex-1">
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Lead Origin Analysis</CardTitle>
          <CardDescription className="text-sm font-medium text-gray-500">
            Channel conversion breakdown
          </CardDescription>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <ModernSelect
            instanceId="sourceSelect"
            value={sourceFilter}
            onChange={setSourceFilter}
            size="sm"
            icon={<IconFilter size={14} />}
            options={[
              { value: "all", label: "All Active Channels" },
              { value: "direct", label: "Direct Traffic" },
              { value: "email", label: "Email Marketing" },
              { value: "social", label: "Social Presence" },
            ]}
          />
          <ModernSelect
            instanceId="displayModeInquiry"
            value={displayMode}
            onChange={setDisplayMode}
            size="sm"
            icon={<IconListSearch size={14} />}
            options={[
              { value: "stacked", label: "Stacked View" },
              { value: "grouped", label: "Comparison Mode" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-12">
        <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-gray-100 dark:stroke-gray-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
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
               className="text-[10px] font-black text-gray-300"
            />
            <Bar
              dataKey="direct"
              stackId={displayMode === "stacked" ? "a" : undefined}
              fill="#2f7d6d"
              radius={displayMode === "stacked" ? [4, 4, 4, 4] : [8, 8, 4, 4]}
              barSize={displayMode === "stacked" ? 50 : 25}
              hide={sourceFilter !== "all" && sourceFilter !== "direct"}
            />
            <Bar
              dataKey="email"
              stackId={displayMode === "stacked" ? "a" : undefined}
              fill="#1473E6"
              radius={displayMode === "stacked" ? [4, 4, 4, 4] : [8, 8, 4, 4]}
              barSize={displayMode === "stacked" ? 50 : 25}
              hide={sourceFilter !== "all" && sourceFilter !== "email"}
            />
            <Bar
              dataKey="social"
              stackId={displayMode === "stacked" ? "a" : undefined}
              fill="#F59E0B"
              radius={displayMode === "stacked" ? [8, 8, 4, 4] : [8, 8, 4, 4]}
              barSize={displayMode === "stacked" ? 50 : 25}
              hide={sourceFilter !== "all" && sourceFilter !== "social"}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  className="w-[200px] p-5 rounded-[20px] border-none shadow-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md" 
                />
              }
              cursor={{ fill: 'var(--primary)', opacity: 0.05, radius: 12 }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
