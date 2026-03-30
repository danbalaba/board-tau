"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
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
import { IconSortDescending, IconBuildingCommunity } from "@tabler/icons-react"

export const description = "Monthly Revenue by Property"

const chartData = [
  { date: "2024-04", propertyA: 45000, propertyB: 38000, propertyC: 52000 },
  { date: "2024-05", propertyA: 52000, propertyB: 41000, propertyC: 58000 },
  { date: "2024-06", propertyA: 48000, propertyB: 39000, propertyC: 54000 },
  { date: "2024-07", propertyA: 55000, propertyB: 44000, propertyC: 61000 },
  { date: "2024-08", propertyA: 62000, propertyB: 48000, propertyC: 67000 },
  { date: "2024-09", propertyA: 58000, propertyB: 45000, propertyC: 63000 },
]

const chartConfig = {
  propertyA: {
    label: "Property A",
    color: "#2f7d6d",
  },
  propertyB: {
    label: "Property B",
    color: "#1473E6",
  },
  propertyC: {
    label: "Property C",
    color: "#F59E0B",
  },
} satisfies ChartConfig

export function ChartBarInteractive() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("propertyA")
  const [sortOrder, setSortOrder] = React.useState("desc")

  const sortedData = React.useMemo(() => {
    return [...chartData].sort((a, b) => {
      const valA = a[activeChart as keyof typeof a] as number
      const valB = b[activeChart as keyof typeof b] as number
      return sortOrder === "desc" ? valB - valA : valA - valB
    })
  }, [activeChart, sortOrder])

  const total = React.useMemo(
    () => ({
      propertyA: chartData.reduce((acc, curr) => acc + curr.propertyA, 0),
      propertyB: chartData.reduce((acc, curr) => acc + curr.propertyB, 0),
      propertyC: chartData.reduce((acc, curr) => acc + curr.propertyC, 0),
    }),
    []
  )

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-0! pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Monthly Revenue by Property</CardTitle>
          <CardDescription className="text-xs font-medium text-gray-500">
            Performance breakdown
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2 w-auto">
          <ModernSelect
            instanceId="propertySelect"
            value={activeChart}
            onChange={(val) => setActiveChart(val as any)}
            size="sm"
            icon={<IconBuildingCommunity size={12} />}
            options={[
              { value: "propertyA", label: "Property A" },
              { value: "propertyB", label: "Property B" },
              { value: "propertyC", label: "Property C" },
            ]}
          />
          <ModernSelect
            instanceId="sortOrderBar"
            value={sortOrder}
            onChange={setSortOrder}
            size="sm"
            icon={<IconSortDescending size={12} />}
            options={[
              { value: "desc", label: "Highest" },
              { value: "asc", label: "Lowest" },
            ]}
          />
        </div>
      </CardHeader>
      
      <CardContent className="px-0! pt-6">
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["propertyA", "propertyB", "propertyC"].map((key) => {
             const isSelected = activeChart === key;
             const color = chartConfig[key as keyof typeof chartConfig].color;
             return (
               <button 
                 key={key} 
                 onClick={() => setActiveChart(key as any)}
                 className={`p-3 rounded-lg border transition-all duration-300 text-left relative overflow-hidden group ${
                   isSelected 
                    ? "bg-white dark:bg-gray-950 border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/5" 
                    : "bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-primary/20"
                 }`}
               >
                 <div className="relative z-10">
                   <span className={`text-[9px] font-bold uppercase tracking-wide ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                     {chartConfig[key as keyof typeof chartConfig].label}
                   </span>
                   <p className={`text-lg font-bold mt-1 tracking-tight ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                     ₱{total[key as keyof typeof total].toLocaleString()}
                   </p>
                 </div>
                 {isSelected && (
                   <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                 )}
               </button>
             )
          })}
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={sortedData}
            margin={{ top: 15, right: 5, left: 5, bottom: 15 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-gray-100 dark:stroke-gray-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit"
                })
              }}
              className="text-[9px] font-bold text-gray-400 uppercase tracking-widest"
            />
            <YAxis 
               tickLine={false}
               axisLine={false}
               tickFormatter={(value) => `₱${value >= 1000 ? value / 1000 + 'k' : value}`}
               className="text-[9px] font-bold text-gray-300"
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.04, radius: 8 }}
              content={
                <ChartTooltipContent
                  className="w-[160px] p-3 rounded-xl border-none shadow-xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md text-xs"
                  labelFormatter={(value: string) => `${value}`}
                />
              }
            />
            <Bar 
              dataKey={activeChart} 
              fill={chartConfig[activeChart as keyof typeof chartConfig].color} 
              radius={[8, 8, 3, 3]} 
              barSize={32}
            >
               {sortedData.map((entry, index) => (
                 <Cell 
                   key={`cell-${index}`} 
                   fill={chartConfig[activeChart as keyof typeof chartConfig].color}
                   fillOpacity={index === sortedData.length - 1 ? 1 : 0.85}
                 />
               ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
