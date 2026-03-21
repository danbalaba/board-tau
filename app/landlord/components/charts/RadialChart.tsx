"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

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

export const description = "Review Ratings"

const chartData = [
  { rating: "5 Stars", count: 245, fill: "var(--color-5stars)" },
  { rating: "4 Stars", count: 180, fill: "var(--color-4stars)" },
  { rating: "3 Stars", count: 95, fill: "var(--color-3stars)" },
  { rating: "2 Stars", count: 45, fill: "var(--color-2stars)" },
  { rating: "1 Star", count: 35, fill: "var(--color-1star)" },
]

const chartConfig = {
  count: {
    label: "Reviews",
  },
  "5 Stars": {
    label: "5 Stars",
    color: "var(--chart-1)",
  },
  "4 Stars": {
    label: "4 Stars",
    color: "var(--chart-2)",
  },
  "3 Stars": {
    label: "3 Stars",
    color: "var(--chart-3)",
  },
  "2 Stars": {
    label: "2 Stars",
    color: "var(--chart-4)",
  },
  "1 Star": {
    label: "1 Star",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartRadialLabel() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Review Ratings</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="rating" />}
            />
            <RadialBar dataKey="count" background>
              <LabelList
                position="insideStart"
                dataKey="rating"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing review ratings distribution
        </div>
      </CardFooter>
    </Card>
  )
}
