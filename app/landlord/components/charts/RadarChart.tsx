"use client"

import * as React from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, PolarRadiusAxis } from "recharts"
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
import { IconTrophy, IconBinary } from "@tabler/icons-react"

export const description = "Property Performance Metrics"

const chartData = [
  { metric: "Location", value: 85 },
  { metric: "Value", value: 90 },
  { metric: "Cleanliness", value: 75 },
  { metric: "Amenities", value: 80 },
  { metric: "Communication", value: 95 },
  { metric: "Accuracy", value: 88 },
]

const chartConfig = {
  value: {
    label: "Performance Score",
    color: "#2f7d6d",
  },
} satisfies ChartConfig

export function ChartRadarDots() {
  const [propertyId, setPropertyId] = React.useState("all")
  const [viewType, setViewType] = React.useState("radar")

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-0! pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Factor Performance Area</CardTitle>
          <CardDescription className="text-xs font-medium text-gray-500">
            Weighted performance score map
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2 w-auto">
          <ModernSelect
            instanceId="propertyRadar"
            value={propertyId}
            onChange={setPropertyId}
            size="sm"
            icon={<IconTrophy size={12} />}
            options={[
              { value: "all", label: "Global" },
              { value: "prop-a", label: "Property A" },
              { value: "prop-b", label: "Property B" },
            ]}
          />
          <ModernSelect
            instanceId="viewRadar"
            value={viewType}
            onChange={setViewType}
            size="sm"
            icon={<IconBinary size={12} />}
            options={[
              { value: "radar", label: "Area" },
              { value: "dot", label: "Dot" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-4 flex flex-col items-center">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[220px] w-full"
        >
          <RadarChart data={chartData} margin={{ top: 15, right: 25, left: 25, bottom: 15 }}>
            <PolarGrid className="stroke-gray-200 dark:stroke-gray-800" strokeDasharray="5 5" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: "#9ca3af", fontSize: 8, fontWeight: 700, style: { textTransform: "uppercase", letterSpacing: "0.1em" } }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  className="w-[160px] p-3 rounded-xl border-none shadow-xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
                  indicator="dot" 
                />
              }
            />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="#2f7d6d"
              strokeWidth={3}
              fill="#2f7d6d"
              fillOpacity={0.25}
              dot={viewType === "dot" ? { r: 4, fillOpacity: 1, fill: "white", strokeWidth: 2, stroke: "#2f7d6d" } : false}
              activeDot={{ r: 6, fill: "#2f7d6d", stroke: "white", strokeWidth: 2 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
