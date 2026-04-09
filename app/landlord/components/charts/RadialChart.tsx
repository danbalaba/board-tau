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

interface ChartDataItem {
  rating: string;
  value: number;
  fill?: string;
  percentage?: number;
}

interface ChartRadialLabelProps {
  data?: ChartDataItem[];
  listings?: Array<{ id: string; title: string }>;
}

const colors = ["#2f7d6d", "#1473E6", "#F59E0B", "#8B5CF6", "#EC4899"];

const defaultGlobalData: ChartDataItem[] = [
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

export function ChartRadialLabel({ data, listings }: ChartRadialLabelProps) {
  const [propertyId, setPropertyId] = React.useState("all")
  const [activeMetric, setActiveMetric] = React.useState("rating")
  
  const processedData = data && data.length > 0
    ? data.map((d, i) => ({ ...d, fill: colors[i % colors.length] }))
    : defaultGlobalData.map((d, i) => ({ ...d, fill: colors[i % colors.length] }));
  
  const chartDomain = [0, Math.max(...processedData.map(d => d.value)) * 1.1] as [number, number];

  const propertyOptions = [
    { value: "all", label: "Global" },
    ...(listings ? listings.map(l => ({ value: l.id, label: l.title })) : [
      { value: "prop-a", label: "Property A (Luxury)" },
      { value: "prop-b", label: "Property B (Studio)" },
    ])
  ];

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
            options={propertyOptions}
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
            data={processedData} 
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