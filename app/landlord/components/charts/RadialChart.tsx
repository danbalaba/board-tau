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

// Data for Global (all properties combined)
const globalRatingData = [
  { rating: "5 Star", value: 45, fill: "#2f7d6d" },
  { rating: "4 Star", value: 30, fill: "#1473E6" },
  { rating: "3 Star", value: 15, fill: "#F59E0B" },
  { rating: "2 Star", value: 7, fill: "#8B5CF6" },
  { rating: "1 Star", value: 3, fill: "#EC4899" },
]

// Data for Property A (Luxury)
const propertyARatingData = [
  { rating: "5 Star", value: 52, fill: "#2f7d6d" },
  { rating: "4 Star", value: 28, fill: "#1473E6" },
  { rating: "3 Star", value: 12, fill: "#F59E0B" },
  { rating: "2 Star", value: 5, fill: "#8B5CF6" },
  { rating: "1 Star", value: 3, fill: "#EC4899" },
]

// Data for Property B (Studio)
const propertyBRatingData = [
  { rating: "5 Star", value: 38, fill: "#2f7d6d" },
  { rating: "4 Star", value: 32, fill: "#1473E6" },
  { rating: "3 Star", value: 18, fill: "#F59E0B" },
  { rating: "2 Star", value: 8, fill: "#8B5CF6" },
  { rating: "1 Star", value: 4, fill: "#EC4899" },
]

// Volume data for Global
const globalVolumeData = [
  { rating: "5 Star", value: 150, fill: "#2f7d6d" },
  { rating: "4 Star", value: 95, fill: "#1473E6" },
  { rating: "3 Star", value: 45, fill: "#F59E0B" },
  { rating: "2 Star", value: 20, fill: "#8B5CF6" },
  { rating: "1 Star", value: 10, fill: "#EC4899" },
]

// Volume data for Property A
const propertyAVolumeData = [
  { rating: "5 Star", value: 85, fill: "#2f7d6d" },
  { rating: "4 Star", value: 50, fill: "#1473E6" },
  { rating: "3 Star", value: 25, fill: "#F59E0B" },
  { rating: "2 Star", value: 12, fill: "#8B5CF6" },
  { rating: "1 Star", value: 5, fill: "#EC4899" },
]

// Volume data for Property B
const propertyBVolumeData = [
  { rating: "5 Star", value: 65, fill: "#2f7d6d" },
  { rating: "4 Star", value: 45, fill: "#1473E6" },
  { rating: "3 Star", value: 20, fill: "#F59E0B" },
  { rating: "2 Star", value: 8, fill: "#8B5CF6" },
  { rating: "1 Star", value: 5, fill: "#EC4899" },
]

// Helper function to get the correct data based on property and metric selection
const getChartData = (propertyId: string, activeMetric: string) => {
  const isVolume = activeMetric === "volume";
  
  switch (propertyId) {
    case "prop-a":
      return isVolume ? propertyAVolumeData : propertyARatingData;
    case "prop-b":
      return isVolume ? propertyBVolumeData : propertyBRatingData;
    case "all":
    default:
      return isVolume ? globalVolumeData : globalRatingData;
  }
}

// Helper function to get domain for the chart based on data
const getChartDomain = (data: { rating: string; value: number; fill: string }[]) => {
  const maxValue = Math.max(...data.map(d => d.value));
  return [0, Math.ceil(maxValue * 1.1)] as [number, number];
}

const chartConfig = {
  value: {
    label: "Reviews Count",
    color: "#2f7d6d",
  },
} satisfies ChartConfig

export function ChartRadialLabel() {
  const [propertyId, setPropertyId] = React.useState("all")
  const [activeMetric, setActiveMetric] = React.useState("rating")

  // Get the current chart data based on selections
  const chartData = getChartData(propertyId, activeMetric);
  const chartDomain = getChartDomain(chartData);

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-0! pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Public Sentiments</CardTitle>
          <CardDescription className="text-xs font-medium text-gray-500">
            A breakdown of your guest ratings
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2 w-auto">
          <ModernSelect
            instanceId="radialProperty"
            value={propertyId}
            onChange={setPropertyId}
            size="sm"
            icon={<IconLayoutGrid size={12} />}
            options={[
              { value: "all", label: "Global" },
              { value: "prop-a", label: "Property A (Luxury)" },
              { value: "prop-b", label: "Property B (Studio)" },
            ]}
          />
          <ModernSelect
            instanceId="radialMetric"
            value={activeMetric}
            onChange={setActiveMetric}
            size="sm"
            icon={<IconStar size={12} />}
            options={[
              { value: "rating", label: "Rating" },
              { value: "volume", label: "Volume" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-2 flex flex-col items-center">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[200px] w-full"
        >
          <RadialBarChart 
            data={chartData} 
            innerRadius="25%" 
            outerRadius="90%"
            barSize={10}
            startAngle={180}
            endAngle={-180}
          >
            <PolarAngleAxis 
              type="number" 
              domain={chartDomain} 
              angleAxisId={0} 
              tick={false} 
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  className="w-[160px] p-3 rounded-xl border-none shadow-xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
                  indicator="dot" 
                  nameKey="rating"
                />
              }
            />
            <RadialBar
              label={{ position: 'insideStart', fill: '#9ca3af', fontSize: 7, fontWeight: 700, style: { textTransform: "uppercase", letterSpacing: "0.1em" } }}
              background={{ fill: 'var(--primary)', opacity: 0.04 }}
              dataKey="value"
              cornerRadius={8}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
