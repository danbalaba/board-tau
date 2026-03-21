"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
  revenue: {
    label: "Revenue (₱)",
  },
  propertyA: {
    label: "Property A",
    color: "var(--chart-1)",
  },
  propertyB: {
    label: "Property B",
    color: "var(--chart-2)",
  },
  propertyC: {
    label: "Property C",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartBarInteractive() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("propertyA")

  const total = React.useMemo(
    () => ({
      propertyA: chartData.reduce((acc, curr) => acc + curr.propertyA, 0),
      propertyB: chartData.reduce((acc, curr) => acc + curr.propertyB, 0),
      propertyC: chartData.reduce((acc, curr) => acc + curr.propertyC, 0),
    }),
    []
  )

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>Monthly Revenue by Property</CardTitle>
          <CardDescription>
            Showing monthly revenue for each property type
          </CardDescription>
        </div>
        <div className="flex">
          {["propertyA", "propertyB", "propertyC"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
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
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value: string) => {
                    return value
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
