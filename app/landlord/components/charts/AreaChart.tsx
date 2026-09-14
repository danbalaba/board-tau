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
import { Calendar, TrendingUp, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/admin/components/ui/tooltip'

export const description = "Revenue and Bookings Overview"

interface ChartDataItem {
  date: string;
  revenue: number;
  bookings: number;
}

interface ChartAreaInteractiveProps {
  data?: ChartDataItem[];
}

const defaultChartData: ChartDataItem[] = [
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
    label: "Income (₱)",
    color: "#2f7d6d",
  },
  bookings: {
    label: "Bookings",
    color: "#3b82f6",
  },
} satisfies ChartConfig

function InteractiveTooltip({ 
  children, 
  content 
}: { 
  children: React.ReactNode; 
  content: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
        <TooltipTrigger 
          asChild 
          onClick={(e) => {
            setOpen((prev) => !prev);
          }}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-[240px] p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl backdrop-blur-xl text-xs leading-snug z-[100]"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState("90d")
  
  const chartData = data && data.length > 0 ? data : defaultChartData

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
        return "Showing income and bookings for the last 7 days"
      case "30d":
        return "Showing income and bookings for the last 30 days"
      case "90d":
        return "Showing income and bookings for the last 3 months"
      default:
        return "Showing income and bookings for the last 3 months"
    }
  }

  return (
    <Card className="pt-0 pb-0 border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 space-y-0 pb-4 px-0! border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Income & Bookings</CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {getDescription()}
          </CardDescription>
        </div>
        <div className="w-full sm:w-auto">
          <ModernSelect
            instanceId="timeRangeArea"
            value={timeRange}
            onChange={setTimeRange}
            size="sm"
            icon={<Calendar className="w-3.5 h-3.5" />}
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
          className="aspect-auto h-[215px] sm:h-[250px] w-full"
        >
          <AreaChart data={filteredData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#2f7d6d"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#2f7d6d"
                  stopOpacity={0.0}
                />
              </linearGradient>
              <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#3b82f6"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#3b82f6"
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200/60 dark:stroke-slate-800/60" />
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
              className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
            />
            <YAxis 
               tickLine={false}
               axisLine={false}
               tickFormatter={(value) => `₱${value >= 1000 ? value / 1000 + 'k' : value}`}
               className="text-[11px] font-bold text-slate-400 dark:text-slate-500"
            />
            <ChartTooltip
              cursor={{ stroke: '#2f7d6d', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              content={
                <ChartTooltipContent
                  className="w-[170px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
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
              stroke="#3b82f6"
              strokeWidth={2.5}
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenue)"
              stroke="#2f7d6d"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>

        {/* Interactive Hover & Tap Legend with Metric Explanations */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {[
            { key: 'bookings', label: 'Bookings', color: 'bg-[#3b82f6]', headerColor: 'text-[#3b82f6] dark:text-blue-400', desc: 'Number of confirmed room reservations made by student boarders' },
            { key: 'revenue', label: 'Income (₱)', color: 'bg-[#2f7d6d]', headerColor: 'text-[#2f7d6d] dark:text-emerald-400', desc: 'Total rental payments collected from tenants for your properties' }
          ].map((item) => (
            <InteractiveTooltip
              key={item.key}
              content={
                <>
                  <div className={`font-bold mb-1 flex items-center gap-1.5 ${item.headerColor}`}>
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.label}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-normal">{item.desc}</p>
                </>
              }
            >
              <div className="flex items-center gap-2 cursor-pointer group py-1 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
                <span className={`w-3 h-3 rounded-full ${item.color} shadow-2xs transition-transform group-hover:scale-125`} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.label}
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors ml-0.5" />
              </div>
            </InteractiveTooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
