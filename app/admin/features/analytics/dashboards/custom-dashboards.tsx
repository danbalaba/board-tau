'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { 
  IconDeviceFloppy as Save, 
  IconLayoutGrid as Grid, 
  IconPlus as Plus, 
  IconEdit as Edit, 
  IconTrash as Trash,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconActivity,
  IconLayoutDashboard
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';

// Mock dashboards data
const initialDashboards = [
  {
    id: '1',
    name: 'Executive Overview',
    description: 'High-level overview of platform performance',
    widgets: [
      { type: 'kpi', title: 'Total Users', value: '1,450' },
      { type: 'kpi', title: 'New Users', value: '600' },
      { type: 'chart', title: 'User Growth', chartType: 'bar' },
      { type: 'chart', title: 'Revenue', chartType: 'line' }
    ],
    createdAt: '2023-01-15',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'User Analytics',
    description: 'Detailed user behavior and engagement metrics',
    widgets: [
      { type: 'kpi', title: 'Active Users', value: '950' },
      { type: 'kpi', title: 'User Retention', value: '78%' },
      { type: 'chart', title: 'User Location', chartType: 'bar' },
      { type: 'chart', title: 'User Types', chartType: 'pie' }
    ],
    createdAt: '2023-03-20',
    updatedAt: '2024-01-09'
  },
  {
    id: '3',
    name: 'Financial Dashboard',
    description: 'Revenue, transactions, and financial metrics',
    widgets: [
      { type: 'kpi', title: 'Total Revenue', value: '$125,000' },
      { type: 'kpi', title: 'Monthly Revenue', value: '$25,000' },
      { type: 'chart', title: 'Revenue Trend', chartType: 'line' },
      { type: 'chart', title: 'Revenue by Source', chartType: 'pie' }
    ],
    createdAt: '2023-05-10',
    updatedAt: '2024-01-08'
  }
];

export default function CustomDashboards() {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    widgets: []
  });

  const handleNewDashboardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDashboard(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    const dashboard = {
      id: Date.now().toString(),
      ...newDashboard,
      widgets: [
        { type: 'kpi', title: 'Total Users', value: '1,450' },
        { type: 'chart', title: 'User Growth', chartType: 'bar' }
      ],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setDashboards(prev => [...prev, dashboard]);
    setNewDashboard({
      name: '',
      description: '',
      widgets: []
    });
    setShowAddForm(false);
  };

  const handleDeleteDashboard = (id: string) => {
    setDashboards(prev => prev.filter(dashboard => dashboard.id !== id));
  };

  return (
    <PageContainer
      pageTitle="Insight Architect"
      pageDescription="Design and deploy specialized business intelligence dashboards"
      pageHeaderAction={
        <Button onClick={() => setShowAddForm(true)} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Create Intelligence Node
        </Button>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboards.map((dashboard, i) => (
            <motion.div 
              key={dashboard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative flex flex-col overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <IconLayoutDashboard className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base font-black tracking-tight">{dashboard.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/5">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => handleDeleteDashboard(dashboard.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">{dashboard.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {dashboard.widgets.map((widget, index) => (
                      <div key={index} className="relative overflow-hidden bg-white/5 rounded-2xl p-4 border border-white/5 transition-all hover:scale-[1.02]">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">{widget.title}</div>
                        {widget.type === 'kpi' ? (
                          <div className="text-2xl font-black tabular-nums">{widget.value}</div>
                        ) : (
                          <div className="flex items-center justify-center h-12 bg-black/20 rounded-xl border border-white/5">
                            {widget.chartType === 'line' ? <IconChartLine className="w-6 h-6 text-blue-500" /> : <IconChartBar className="w-6 h-6 text-emerald-500" />}
                          </div>
                        )}
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                          <IconActivity className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Synchronized: {dashboard.updatedAt}
                    </div>
                    <Button variant="link" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-primary">
                      Deploy View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-none bg-card/30 shadow-2xl backdrop-blur-md ring-1 ring-white/10">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tighter">
                  <Grid className="w-6 h-6 text-primary" />
                  Blueprint New Intelligence Node
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDashboard} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Node Designation</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newDashboard.name}
                        onChange={handleNewDashboardChange}
                        placeholder="e.g. CORE-TELEMETRY-OMEGA"
                        className="bg-white/5 border-white/10 h-11 font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Functional Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={newDashboard.description}
                        onChange={handleNewDashboardChange}
                        placeholder="Define the primary mission parameters"
                        className="bg-white/5 border-white/10 h-11 font-bold"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} className="h-11 px-6 font-black uppercase text-[10px] tracking-widest">
                      Abort
                    </Button>
                    <Button type="submit" className="h-11 px-8 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
                      <Save className="w-4 h-4" />
                      Initialize Protocol
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
