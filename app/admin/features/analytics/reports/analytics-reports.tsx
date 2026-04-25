'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Badge } from '@/app/admin/components/ui/badge';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/app/admin/components/ui/select';
import {
  IconFileText,
  IconDownload,
  IconSearch,
  IconFilter,
  IconCalendarStats,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconUsers,
  IconCreditCard,
  IconBuilding,
  IconShieldCheck,
  IconActivity,
  IconClock,
  IconRefresh,
  IconPlus,
  IconEye,
  IconShare,
  IconStar,
  IconTrendingUp,
  IconDatabase,
  IconMail,
  IconCheck,
  IconCircleCheck
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';

// ─── Report Library Data ────────────────────────────────────────────────
const reportLibrary = [
  {
    id: '1',
    name: 'Platform Revenue Matrix',
    category: 'Financial',
    description: 'Comprehensive breakdown of gross platform volume, net revenue, commission flows, and tax liabilities across all active markets.',
    lastGenerated: '2026-04-20',
    frequency: 'Weekly',
    format: 'PDF',
    status: 'ready',
    icon: IconCreditCard,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    trend: '+12.4%',
    pages: 24,
    starred: true
  },
  {
    id: '2',
    name: 'User Acquisition Ledger',
    category: 'Users',
    description: 'Full analysis of new registrations, activation funnels, churn vectors, and retention cohorts segmented by acquisition channel.',
    lastGenerated: '2026-04-19',
    frequency: 'Daily',
    format: 'CSV',
    status: 'ready',
    icon: IconUsers,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    trend: '+8.1%',
    pages: 16,
    starred: false
  },
  {
    id: '3',
    name: 'Property Occupancy Index',
    category: 'Properties',
    description: 'Real-time and historical occupancy rates by property type, location cluster, and pricing tier with predictive availability forecasting.',
    lastGenerated: '2026-04-18',
    frequency: 'Monthly',
    format: 'XLSX',
    status: 'ready',
    icon: IconBuilding,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    trend: '+3.7%',
    pages: 32,
    starred: true
  },
  {
    id: '4',
    name: 'Booking Velocity Report',
    category: 'Operations',
    description: 'Advanced booking pace analysis, cancellation pattern recognition, and lead-time distribution maps for operational capacity planning.',
    lastGenerated: '2026-04-17',
    frequency: 'Weekly',
    format: 'PDF',
    status: 'processing',
    icon: IconChartLine,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    trend: '-2.3%',
    pages: 18,
    starred: false
  },
  {
    id: '5',
    name: 'Security Audit Trail',
    category: 'Security',
    description: 'Immutable audit log synthesis covering authentication anomalies, permission escalations, API abuse patterns, and threat vector analysis.',
    lastGenerated: '2026-04-15',
    frequency: 'Daily',
    format: 'PDF',
    status: 'ready',
    icon: IconShieldCheck,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    trend: '0.0%',
    pages: 12,
    starred: false
  },
  {
    id: '6',
    name: 'Platform Health Digest',
    category: 'Monitoring',
    description: 'Executive-level system telemetry digest including API response percentiles, infrastructure uptime SLAs, and error rate correlations.',
    lastGenerated: '2026-04-20',
    frequency: 'Daily',
    format: 'PDF',
    status: 'ready',
    icon: IconActivity,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    trend: '+0.8%',
    pages: 8,
    starred: false
  }
];

const categories = ['All', 'Financial', 'Users', 'Properties', 'Operations', 'Security', 'Monitoring'];

const statusConfig: Record<string, { label: string; color: string }> = {
  ready: { label: 'Ready', color: 'bg-emerald-500/10 text-emerald-500' },
  processing: { label: 'Processing', color: 'bg-amber-500/10 text-amber-500' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-500' }
};

// ─── Scheduled Reports ────────────────────────────────────────────────
const scheduledReports = [
  { name: 'Platform Revenue Matrix', nextRun: 'Tomorrow, 08:00', channel: 'Email · Slack', frequency: 'Weekly' },
  { name: 'User Acquisition Ledger', nextRun: 'Today, 23:59', channel: 'Email', frequency: 'Daily' },
  { name: 'Security Audit Trail', nextRun: 'Today, 00:01', channel: 'Email', frequency: 'Daily' }
];

export default function AnalyticsReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [starredOnly, setStarredOnly] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const filteredReports = reportLibrary.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || report.category === activeCategory;
    const matchesStarred = !starredOnly || report.starred;
    return matchesSearch && matchesCategory && matchesStarred;
  });

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2500);
  };

  return (
    <PageContainer
      pageTitle="Intelligence Reports"
      pageDescription="Generate, schedule, and distribute high-fidelity analytical intelligence packages"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 hover:bg-white/5 border-border/40 font-black uppercase text-[10px] tracking-widest">
            <IconCalendarStats className="w-4 h-4" />
            Schedule Queue
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
            <IconPlus className="w-4 h-4" />
            Custom Report
          </Button>
        </div>
      }
    >
      <div className="space-y-8">

        {/* ── Stats Summary ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Reports', value: '6', icon: IconFileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Scheduled Active', value: '3', icon: IconClock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Generated Today', value: '2', icon: IconCircleCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Avg. Pages', value: '18', icon: IconDatabase, color: 'text-amber-500', bg: 'bg-amber-500/10' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardContent className="pt-5 pb-4 flex items-center gap-4">
                  <div className={cn('rounded-xl p-2.5 transition-transform group-hover:scale-110', stat.bg)}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-black tabular-nums">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Filters ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input
                    placeholder="Search reports by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 h-10 font-medium text-sm"
                  />
                </div>
                {/* Category pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                        activeCategory === cat
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-10 bg-white/5 border-white/10 font-bold text-xs uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                    <SelectItem value="recent" className="text-xs font-bold uppercase">Sort: Recent</SelectItem>
                    <SelectItem value="name" className="text-xs font-bold uppercase">Sort: Name</SelectItem>
                    <SelectItem value="pages" className="text-xs font-bold uppercase">Sort: Pages</SelectItem>
                  </SelectContent>
                </Select>
                {/* Starred toggle */}
                <button
                  onClick={() => setStarredOnly(!starredOnly)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                    starredOnly ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                  )}
                >
                  <IconStar className={cn('w-3.5 h-3.5', starredOnly && 'fill-amber-500')} />
                  Starred
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Report Library Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredReports.map((report, i) => {
            const isGenerating = generating === report.id;
            const status = statusConfig[report.status];
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                layout
              >
                <Card className="group relative flex flex-col overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40 hover:shadow-2xl h-full">
                  {/* Accent bar */}
                  <div className={cn('absolute top-0 left-0 h-0.5 w-full opacity-60', report.bg.replace('/10', ''))} />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('rounded-xl p-2.5 shrink-0 transition-transform group-hover:scale-110', report.bg)}>
                          <report.icon className={cn('h-5 w-5', report.color)} />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-black tracking-tight leading-tight">{report.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn('text-[9px] font-black uppercase border-none h-4 px-1.5', status.color)}>
                              {status.label}
                            </Badge>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{report.category}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {}}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <IconStar className={cn('w-4 h-4 transition-colors', report.starred ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/40 hover:text-amber-500')} />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-4">
                    <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">{report.description}</p>

                    {/* Metadata row */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Frequency', val: report.frequency },
                        { label: 'Format', val: report.format },
                        { label: 'Pages', val: `${report.pages}p` }
                      ].map((meta, mi) => (
                        <div key={mi} className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{meta.label}</p>
                          <p className="text-xs font-black mt-0.5">{meta.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Trend + Last Generated */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <IconTrendingUp className={cn('w-3 h-3', report.trend.startsWith('+') ? 'text-emerald-500' : report.trend.startsWith('-') ? 'text-red-500' : 'text-muted-foreground/40')} />
                        <span className={cn('text-[10px] font-black uppercase tracking-wider', report.trend.startsWith('+') ? 'text-emerald-500' : report.trend.startsWith('-') ? 'text-red-500' : 'text-muted-foreground/40')}>
                          {report.trend}
                        </span>
                        <span className="text-[9px] text-muted-foreground/30 font-bold uppercase">vs last run</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                        <IconClock className="w-3 h-3" />
                        {report.lastGenerated}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-auto">
                      <Button
                        size="sm"
                        className="flex-1 h-8 gap-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        onClick={() => handleGenerate(report.id)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <IconRefresh className="w-3.5 h-3.5" />
                            Re-Generate
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-white/5 border-border/40">
                        <IconDownload className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-white/5 border-border/40">
                        <IconShare className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* ── Schedule Queue ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Transmission Queue</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                  Automated report generation and multi-channel delivery schedule
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Queue Active</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledReports.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.08 }}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <IconMail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight uppercase">{item.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{item.frequency}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/20">·</span>
                          <span className="text-[9px] font-bold text-muted-foreground/50">{item.channel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Next Run</p>
                        <p className="text-xs font-black text-primary/80">{item.nextRun}</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[9px] h-5">
                        <IconCheck className="w-2.5 h-2.5 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* New Schedule CTA */}
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Add Transmission Protocol</p>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">Configure automated delivery for any report in the library</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 h-9 hover:bg-white/5 border-border/40 font-black uppercase text-[10px] tracking-widest">
                  <IconPlus className="w-4 h-4" />
                  New Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </PageContainer>
  );
}
