"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/ui/select"

export const description = "Revenue and Bookings Overview"

const chartData = [
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
    color: "var(--chart-1)",
  },
  bookings: {
    label: "Bookings",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  // Find the latest date in the chart data to use as reference point
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

  // Get description based on selected time range
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
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Revenue & Bookings Overview</CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-bookings)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-bookings)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="bookings"
              type="natural"
              fill="url(#fillBookings)"
              stroke="var(--color-bookings)"
              stackId="a"
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
