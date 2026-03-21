"use client"

import { Bar, BarChart, XAxis } from "recharts"

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

export const description = "Inquiry Sources"
export const iframeHeight = "600px"
export const containerClassName =
  "[&>div]:w-full [&>div]:max-w-md flex items-center justify-center min-h-svh"

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
    label: "Direct",
    color: "var(--chart-1)",
  },
  email: {
    label: "Email",
    color: "var(--chart-2)",
  },
  social: {
    label: "Social",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartTooltipDefault() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inquiry Sources</CardTitle>
        <CardDescription>
          Showing inquiry sources for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                return value
              }}
            />
            <Bar
              dataKey="direct"
              stackId="a"
              fill="var(--color-direct)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="email"
              stackId="a"
              fill="var(--color-email)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="social"
              stackId="a"
              fill="var(--color-social)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
