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
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-0! py-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-1.5 flex-1">
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Monthly Revenue by Property</CardTitle>
          <CardDescription className="text-sm font-medium text-gray-500">
            Performance breakdown for your listed property types
          </CardDescription>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <ModernSelect
            instanceId="propertySelect"
            value={activeChart}
            onChange={(val) => setActiveChart(val as any)}
            size="sm"
            icon={<IconBuildingCommunity size={14} />}
            options={[
              { value: "propertyA", label: "Property A (Deluxe)" },
              { value: "propertyB", label: "Property B (Standard)" },
              { value: "propertyC", label: "Property C (Suites)" },
            ]}
          />
          <ModernSelect
            instanceId="sortOrderBar"
            value={sortOrder}
            onChange={setSortOrder}
            size="sm"
            icon={<IconSortDescending size={14} />}
            options={[
              { value: "desc", label: "Highest Revenue First" },
              { value: "asc", label: "Lowest Revenue First" },
            ]}
          />
        </div>
      </CardHeader>
      
      <CardContent className="px-0! pt-8 sm:pt-10">
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {["propertyA", "propertyB", "propertyC"].map((key) => {
             const isSelected = activeChart === key;
             const color = chartConfig[key as keyof typeof chartConfig].color;
             return (
               <button 
                 key={key} 
                 onClick={() => setActiveChart(key as any)}
                 className={`p-6 rounded-[24px] border transition-all duration-300 text-left relative overflow-hidden group ${
                   isSelected 
                    ? "bg-white dark:bg-gray-950 border-primary/30 shadow-2xl shadow-primary/5 ring-1 ring-primary/5" 
                    : "bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-primary/20"
                 }`}
               >
                 <div className="relative z-10">
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                     {chartConfig[key as keyof typeof chartConfig].label}
                   </span>
                   <p className={`text-2xl font-black mt-2 tracking-tight ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                     ₱{total[key as keyof typeof total].toLocaleString()}
                   </p>
                 </div>
                 {isSelected && (
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                 )}
               </button>
             )
          })}
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={sortedData}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-gray-100 dark:stroke-gray-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit"
                })
              }}
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            />
            <YAxis 
               tickLine={false}
               axisLine={false}
               tickFormatter={(value) => `₱${value >= 1000 ? value / 1000 + 'k' : value}`}
               className="text-[10px] font-black text-gray-300"
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.04, radius: 12 }}
              content={
                <ChartTooltipContent
                  className="w-[200px] p-5 rounded-[20px] border-none shadow-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
                  labelFormatter={(value: string) => `Analysis: ${value}`}
                />
              }
            />
            <Bar 
              dataKey={activeChart} 
              fill={chartConfig[activeChart as keyof typeof chartConfig].color} 
              radius={[12, 12, 4, 4]} 
              barSize={45}
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
