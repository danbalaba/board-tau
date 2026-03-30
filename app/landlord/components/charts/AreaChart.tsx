"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/admin/components/ui/chart"
import dynamic from 'next/dynamic'
const ModernSelect = dynamic(() => import('@/components/common/ModernSelect'), { ssr: false })
import { IconCalendarStats } from "@tabler/icons-react"

export const description = "Revenue and Bookings Overview"

const chartData = [
  { date: "2024-01-21", revenue: 12500, bookings: 14 },
  { date: "2024-01-22", revenue: 15800, bookings: 18 },
  { date: "2024-01-23", revenue: 14200, bookings: 16 },
  { date: "2024-01-24", revenue: 21000, bookings: 24 },
  { date: "2024-01-25", revenue: 19500, bookings: 22 },
  { date: "2024-01-26", revenue: 25000, bookings: 28 },
  { date: "2024-01-27", revenue: 32000, bookings: 35 },
  { date: "2024-01-28", revenue: 28500, bookings: 31 },
  { date: "2024-01-29", revenue: 26000, bookings: 29 },
  { date: "2024-01-30", revenue: 34000, bookings: 38 },
  { date: "2024-01-31", revenue: 29800, bookings: 33 },
  { date: "2024-02-01", revenue: 31200, bookings: 34 },
  { date: "2024-02-02", revenue: 27500, bookings: 30 },
  { date: "2024-02-03", revenue: 38900, bookings: 42 },
  { date: "2024-02-04", revenue: 42500, bookings: 46 },
  { date: "2024-02-05", revenue: 35000, bookings: 39 },
  { date: "2024-02-06", revenue: 33200, bookings: 37 },
  { date: "2024-02-07", revenue: 45600, bookings: 50 },
  { date: "2024-02-08", revenue: 38000, bookings: 41 },
  { date: "2024-02-09", revenue: 41200, bookings: 45 },
  { date: "2024-02-10", revenue: 36700, bookings: 40 },
  { date: "2024-02-11", revenue: 29400, bookings: 32 },
  { date: "2024-02-12", revenue: 32100, bookings: 35 },
  { date: "2024-02-13", revenue: 39800, bookings: 44 },
  { date: "2024-02-14", revenue: 48500, bookings: 53 },
  { date: "2024-02-15", revenue: 44200, bookings: 48 },
  { date: "2024-02-16", revenue: 41500, bookings: 46 },
  { date: "2024-02-17", revenue: 47200, bookings: 52 },
  { date: "2024-02-18", revenue: 38600, bookings: 42 },
  { date: "2024-02-19", revenue: 32400, bookings: 36 },
  { date: "2024-02-20", revenue: 35800, bookings: 39 },
  { date: "2024-02-21", revenue: 42100, bookings: 46 },
  { date: "2024-02-22", revenue: 38900, bookings: 43 },
  { date: "2024-02-23", revenue: 45200, bookings: 50 },
  { date: "2024-02-24", revenue: 52400, bookings: 58 },
  { date: "2024-02-25", revenue: 48600, bookings: 54 },
  { date: "2024-02-26", revenue: 41200, bookings: 45 },
  { date: "2024-02-27", revenue: 38500, bookings: 42 },
  { date: "2024-02-28", revenue: 43200, bookings: 48 },
  { date: "2024-02-29", revenue: 40800, bookings: 45 },
  { date: "2024-03-01", revenue: 45200, bookings: 50 },
  { date: "2024-03-02", revenue: 48900, bookings: 54 },
  { date: "2024-03-03", revenue: 42500, bookings: 47 },
  { date: "2024-03-04", revenue: 38600, bookings: 42 },
  { date: "2024-03-05", revenue: 41200, bookings: 45 },
  { date: "2024-03-06", revenue: 45800, bookings: 51 },
  { date: "2024-03-07", revenue: 52400, bookings: 58 },
  { date: "2024-03-08", revenue: 48600, bookings: 54 },
  { date: "2024-03-09", revenue: 44200, bookings: 49 },
  { date: "2024-03-10", revenue: 39800, bookings: 44 },
  { date: "2024-03-11", revenue: 42500, bookings: 47 },
  { date: "2024-03-12", revenue: 46800, bookings: 52 },
  { date: "2024-03-13", revenue: 51200, bookings: 57 },
  { date: "2024-03-14", revenue: 47500, bookings: 53 },
  { date: "2024-03-15", revenue: 43200, bookings: 48 },
  { date: "2024-03-16", revenue: 39600, bookings: 44 },
  { date: "2024-03-17", revenue: 44200, bookings: 49 },
  { date: "2024-03-18", revenue: 48900, bookings: 54 },
  { date: "2024-03-19", revenue: 52400, bookings: 58 },
  { date: "2024-03-20", revenue: 46500, bookings: 51 },
  { date: "2024-03-21", revenue: 42800, bookings: 47 },
  { date: "2024-03-22", revenue: 39200, bookings: 43 },
  { date: "2024-03-23", revenue: 45600, bookings: 50 },
  { date: "2024-03-24", revenue: 51200, bookings: 56 },
  { date: "2024-03-25", revenue: 47800, bookings: 53 },
  { date: "2024-03-26", revenue: 43500, bookings: 48 },
  { date: "2024-03-27", revenue: 41200, bookings: 45 },
  { date: "2024-03-28", revenue: 46800, bookings: 52 },
  { date: "2024-03-29", revenue: 52400, bookings: 58 },
  { date: "2024-03-30", revenue: 48600, bookings: 54 },
  { date: "2024-03-31", revenue: 44200, bookings: 49 },
  { date: "2024-04-01", revenue: 12000, bookings: 15 },
  { date: "2024-04-02", revenue: 19800, bookings: 22 },
  { date: "2024-04-03", revenue: 15000, bookings: 18 },
  { date: "2024-04-04", revenue: 25000, bookings: 28 },
  { date: "2024-04-05", revenue: 32000, bookings: 35 },
  { date: "2024-04-06", revenue: 28000, bookings: 31 },
  { date: "2024-04-07", revenue: 24500, bookings: 27 },
  { date: "2024-04-08", revenue: 40900, bookings: 45 },
  { date: "2024-04-09", revenue: 5900, bookings: 8 },
  { date: "2024-04-10", revenue: 26100, bookings: 29 },
  { date: "2024-04-11", revenue: 32700, bookings: 36 },
  { date: "2024-04-12", revenue: 29200, bookings: 32 },
  { date: "2024-04-13", revenue: 34200, bookings: 38 },
  { date: "2024-04-14", revenue: 13700, bookings: 15 },
  { date: "2024-04-15", revenue: 12000, bookings: 14 },
  { date: "2024-04-16", revenue: 13800, bookings: 15 },
  { date: "2024-04-17", revenue: 44600, bookings: 49 },
  { date: "2024-04-18", revenue: 36400, bookings: 40 },
  { date: "2024-04-19", revenue: 24300, bookings: 27 },
  { date: "2024-04-20", revenue: 8900, bookings: 10 },
]

const chartConfig = {
  revenue: {
    label: "Revenue (₱)",
    color: "#2f7d6d",
  },
  bookings: {
    label: "Bookings",
    color: "#1473E6",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const latestDate = new Date(Math.max(...chartData.map(item => new Date(item.date).getTime())))

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(latestDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate && date <= latestDate
  })

  const getDescription = () => {
    switch (timeRange) {
      case "7d":
        return "Showing revenue and bookings for the last 7 days"
      case "30d":
        return "Showing revenue and bookings for the last 30 days"
      case "90d":
        return "Showing revenue and bookings for the last 3 months"
      default:
        return "Showing revenue and bookings for the last 3 months"
    }
  }

  return (
    <Card className="pt-0 border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4 px-0!">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-base font-bold tracking-tight text-gray-900 dark:text-white">Revenue & Bookings</CardTitle>
          <CardDescription className="text-sm font-medium text-gray-500">
            {getDescription()}
          </CardDescription>
        </div>
        <div className="w-auto">
          <ModernSelect
            instanceId="timeRangeArea"
            value={timeRange}
            onChange={setTimeRange}
            size="sm"
            icon={<IconCalendarStats size={14} />}
            options={[
              { value: "90d", label: "Last 3 months" },
              { value: "30d", label: "Last 30 days" },
              { value: "7d", label: "Last 7 days" },
            ]}
          />
        </div>
      </CardHeader>
      <CardContent className="px-0! pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#2f7d6d"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#2f7d6d"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#1473E6"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#1473E6"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              className="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
            />
            <YAxis 
               tickLine={false}
               axisLine={false}
               tickFormatter={(value) => `₱${value >= 1000 ? value / 1000 + 'k' : value}`}
               className="text-[11px] font-bold text-gray-300"
            />
            <ChartTooltip
              cursor={{ stroke: '#2f7d6d', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="bookings"
              type="monotone"
              fill="url(#fillBookings)"
              stroke="#1473E6"
              strokeWidth={3}
              stackId="a"
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenue)"
              stroke="#2f7d6d"
              strokeWidth={3}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} className="mt-8" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
