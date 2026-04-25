'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { 
  IconDeviceFloppy as Save, 
  IconLayoutGrid as Grid, 
  IconPlus as Plus, 
  IconEdit as Edit, 
  IconTrash as Trash,
  IconChartBar,
  IconChartLine,
  IconActivity,
  IconLayoutDashboard,
  IconLoader2
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Widget {
  type: 'kpi' | 'chart';
  title: string;
  value?: string;
  chartType?: 'bar' | 'line' | 'pie';
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}

export default function CustomDashboards() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    widgets: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics/dashboards');
      const result = await response.json();
      if (result.success) {
        setDashboards(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewDashboardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDashboard(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Default widgets for a new dashboard
    const defaultWidgets: Widget[] = [
      { type: 'kpi', title: 'Active Sessions', value: '124' },
      { type: 'chart', title: 'Traffic Overview', chartType: 'line' }
    ];

    try {
      const response = await fetch('/api/admin/analytics/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDashboard,
          widgets: defaultWidgets
        })
      });
      const result = await response.json();
      if (result.success) {
        setDashboards(prev => [result.data, ...prev]);
        setNewDashboard({ name: '', description: '', widgets: [] });
        setShowAddForm(false);
        toast.success('Intelligence node initialized');
      }
    } catch (error) {
      toast.error('Failed to create dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/analytics/dashboards?id=${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setDashboards(prev => prev.filter(d => d.id !== id));
        toast.success('Node decommissioned');
      }
    } catch (error) {
      toast.error('Failed to delete dashboard');
    }
  };

  return (
    <PageContainer
      pageTitle="Insight Architect"
      pageDescription="Design and deploy specialized business intelligence dashboards"
      pageHeaderAction={
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
          {showAddForm ? 'Abort Protocol' : (
            <>
              <Plus className="w-4 h-4" />
              Create Intelligence Node
            </>
          )}
        </Button>
      }
    >
      <div className="space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-[300px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
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
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 line-clamp-2">{dashboard.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {dashboard.widgets.map((widget, index) => (
                        <div key={index} className="relative overflow-hidden bg-white/5 rounded-2xl p-4 border border-white/5 transition-all hover:scale-[1.02]">
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">{widget.title}</div>
                          {widget.type === 'kpi' ? (
                            <div className="text-2xl font-black tabular-nums tracking-tight">{widget.value}</div>
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
                        Synchronized: {new Date(dashboard.updatedAt).toLocaleDateString()}
                      </div>
                      <Button variant="link" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:no-underline">
                        Deploy View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {dashboards.length === 0 && !loading && (
              <div className="lg:col-span-2 py-20 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-4 text-center bg-white/5">
                 <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Grid className="h-8 w-8 text-muted-foreground/50" />
                 </div>
                 <div>
                    <h3 className="text-lg font-black tracking-tight uppercase">No Custom Nodes</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto font-medium">Build your own analytical workspaces to monitor specific segments of your business.</p>
                 </div>
                 <Button onClick={() => setShowAddForm(true)} variant="outline" size="sm" className="font-black uppercase text-[10px] tracking-widest border-white/10 hover:bg-white/10">
                   Start Blueprinting
                 </Button>
              </div>
            )}
          </div>
        )}

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
                    <Button type="submit" disabled={isSubmitting} className="h-11 px-8 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest min-w-[180px]">
                      {isSubmitting ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
