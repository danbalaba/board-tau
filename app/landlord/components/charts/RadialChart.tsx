"use client"

import * as React from "react"
import { RadialBar, RadialBarChart, Label, ResponsiveContainer, PolarAngleAxis } from "recharts"
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
import { IconStar, IconLayoutGrid } from "@tabler/icons-react"

export const description = "Review Ratings Breakdown"

const chartData = [
  { rating: "5 Star", value: 45, fill: "#2f7d6d" },
  { rating: "4 Star", value: 30, fill: "#1473E6" },
  { rating: "3 Star", value: 15, fill: "#F59E0B" },
  { rating: "2 Star", value: 7, fill: "#8B5CF6" },
  { rating: "1 Star", value: 3, fill: "#EC4899" },
]

const chartConfig = {
  value: {
    label: "Reviews Count",
    color: "#2f7d6d",
  },
} satisfies ChartConfig

export function ChartRadialLabel() {
  const [propertyId, setPropertyId] = React.useState("all")
  const [activeMetric, setActiveMetric] = React.useState("rating")

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6 px-0! py-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1.5 flex-1">
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Public Sentiments</CardTitle>
          <CardDescription className="text-sm font-medium text-gray-500">
            A breakdown of your guest ratings
          </CardDescription>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <ModernSelect
            instanceId="radialProperty"
            value={propertyId}
            onChange={setPropertyId}
            size="sm"
            icon={<IconLayoutGrid size={14} />}
            options={[
              { value: "all", label: "Global Rating" },
              { value: "prop-a", label: "Property A (Luxury)" },
              { value: "prop-b", label: "Property B (Studio)" },
            ]}
          />
          <ModernSelect
            instanceId="radialMetric"
            value={activeMetric}
            onChange={setActiveMetric}
            size="sm"
            icon={<IconStar size={14} />}
            options={[
              { value: "rating", label: "By Rating Score" },
              { value: "volume", label: "By Review Volume" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-12 flex flex-col items-center">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[400px] w-full"
        >
          <RadialBarChart 
            data={chartData} 
            innerRadius="25%" 
            outerRadius="105%"
            barSize={18}
            startAngle={180}
            endAngle={-180}
          >
            <PolarAngleAxis 
              type="number" 
              domain={[0, 100]} 
              angleAxisId={0} 
              tick={false} 
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  className="w-[200px] p-5 rounded-[20px] border-none shadow-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
                  indicator="dot" 
                  nameKey="rating"
                />
              }
            />
            <RadialBar
              label={{ position: 'insideStart', fill: '#9ca3af', fontSize: 10, fontWeight: 900, style: { textTransform: "uppercase", letterSpacing: "0.1em" } }}
              background={{ fill: 'var(--primary)', opacity: 0.04 }}
              dataKey="value"
              cornerRadius={15}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
