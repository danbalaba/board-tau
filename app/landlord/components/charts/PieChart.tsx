"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/admin/components/ui/chart"

export const description = "Property Type Distribution"

const chartData = [
  { type: "Apartments", count: 45, fill: "var(--color-apartments)" },
  { type: "Condos", count: 30, fill: "var(--color-condos)" },
  { type: "Houses", count: 25, fill: "var(--color-houses)" },
  { type: "Studios", count: 15, fill: "var(--color-studios)" },
  { type: "Other", count: 5, fill: "var(--color-other)" },
]

const chartConfig = {
  count: {
    label: "Properties",
  },
  apartments: {
    label: "Apartments",
    color: "var(--chart-1)",
  },
  condos: {
    label: "Condos",
    color: "var(--chart-2)",
  },
  houses: {
    label: "Houses",
    color: "var(--chart-3)",
  },
  studios: {
    label: "Studios",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartPieLabel() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Property Type Distribution</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" label nameKey="type" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total properties by type
        </div>
      </CardFooter>
    </Card>
  )
}
