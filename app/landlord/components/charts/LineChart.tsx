"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/admin/components/ui/tooltip'
import { MessageSquare, CalendarCheck, CheckCircle2, Filter, Info } from "lucide-react"
import dynamic from 'next/dynamic'
const ModernSelect = dynamic(() => import('@/components/common/ModernSelect'), { ssr: false })

export const description = "Student Inquiries vs. Bookings"

interface ChartDataItem {
  date: string;
  inquiries: number;
  bookings: number;
  conversionRate?: number;
}

interface ChartLineInteractiveProps {
  data?: ChartDataItem[];
}

const defaultChartData: ChartDataItem[] = [
  { date: "2024-04", inquiries: 25, bookings: 12 },
  { date: "2024-05", inquiries: 32, bookings: 18 },
  { date: "2024-06", inquiries: 40, bookings: 22 },
  { date: "2024-07", inquiries: 48, bookings: 28 },
  { date: "2024-08", inquiries: 55, bookings: 35 },
  { date: "2024-09", inquiries: 60, bookings: 42 },
]

const chartConfig = {
  inquiries: {
    label: "Tenant Inquiries",
    color: "#3b82f6",
  },
  bookings: {
    label: "Confirmed Bookings",
    color: "#2f7d6d",
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
          onClick={() => {
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

export function ChartLineInteractive({ data }: ChartLineInteractiveProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("inquiries")
  
  const chartData = data && data.length > 0 ? data : defaultChartData

  const totals = React.useMemo(() => {
    const inquiries = chartData.reduce((acc, curr) => acc + (curr.inquiries || 0), 0);
    const bookings = chartData.reduce((acc, curr) => acc + (curr.bookings || 0), 0);
    const rate = inquiries > 0 ? Math.round((bookings / inquiries) * 100) : 0;
    return { inquiries, bookings, rate };
  }, [chartData]);

  return (
    <Card className="pt-0 pb-0 border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 space-y-0 px-0! pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Inquiries vs. Bookings</CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tenant room applications received compared to confirmed bookings
          </CardDescription>
        </div>
        
        <div className="w-full sm:w-auto">
          <ModernSelect
            instanceId="inquiryMetricSelect"
            value={activeChart}
            onChange={(val) => setActiveChart(val as any)}
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
            options={[
              { value: "inquiries", label: "Tenant Inquiries" },
              { value: "bookings", label: "Confirmed Bookings" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[215px] sm:h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200/60 dark:stroke-slate-800/60" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { month: "short" })
              }}
              className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
            />
            <YAxis 
               tickLine={false}
               axisLine={false}
               className="text-[11px] font-bold text-slate-400 dark:text-slate-500"
            />
            <ChartTooltip
              cursor={{ stroke: '#2f7d6d', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              content={
                <ChartTooltipContent
                  className="w-[170px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                  indicator="line"
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={chartConfig[activeChart as keyof typeof chartConfig].color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'white', stroke: chartConfig[activeChart as keyof typeof chartConfig].color, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartConfig[activeChart as keyof typeof chartConfig].color, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>

        {/* Interactive Bottom Legend Bar matching AreaChart */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <InteractiveTooltip
            content={
              <>
                <div className="font-bold text-[#3b82f6] dark:text-blue-400 mb-1">Tenant Inquiries</div>
                <p className="text-slate-600 dark:text-slate-300 font-normal">Total room applications submitted by student boarders</p>
              </>
            }
          >
            <div 
              onClick={() => setActiveChart("inquiries")}
              className={`flex items-center gap-2 cursor-pointer group py-1 px-2.5 rounded-xl transition-all ${
                activeChart === "inquiries" 
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#3b82f6] shrink-0" />
              <span className="text-xs font-bold">
                Inquiries ({totals.inquiries})
              </span>
              <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-0.5" />
            </div>
          </InteractiveTooltip>

          <InteractiveTooltip
            content={
              <>
                <div className="font-bold text-[#2f7d6d] dark:text-emerald-400 mb-1">Confirmed Bookings</div>
                <p className="text-slate-600 dark:text-slate-300 font-normal">Total room applications approved and reserved</p>
              </>
            }
          >
            <div 
              onClick={() => setActiveChart("bookings")}
              className={`flex items-center gap-2 cursor-pointer group py-1 px-2.5 rounded-xl transition-all ${
                activeChart === "bookings" 
                  ? "bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 font-bold" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#2f7d6d] shrink-0" />
              <span className="text-xs font-bold">
                Bookings ({totals.bookings})
              </span>
              <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-0.5" />
            </div>
          </InteractiveTooltip>

          <InteractiveTooltip
            content={
              <>
                <div className="font-bold text-[#2f7d6d] dark:text-emerald-400 mb-1">Inquiry Approval Rate</div>
                <p className="text-slate-600 dark:text-slate-300 font-normal">Percentage of student room applications that result in confirmed bookings</p>
              </>
            }
          >
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 cursor-pointer">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-extrabold">
                Success: {totals.rate}%
              </span>
              <Info className="w-3.5 h-3.5 text-emerald-600/70 dark:text-emerald-400/70 ml-0.5" />
            </div>
          </InteractiveTooltip>
        </div>
      </CardContent>
    </Card>
  )
}

