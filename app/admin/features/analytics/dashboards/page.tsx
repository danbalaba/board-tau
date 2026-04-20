'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Save, Grid, Plus, Edit, Trash, Layout, BarChart2, PieChart, Activity, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/app/admin/components/ui/badge';
import { Skeleton } from '@/app/admin/components/ui/skeleton';

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
        toast.success('Dashboard created successfully');
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
        toast.success('Dashboard removed');
      }
    } catch (error) {
      toast.error('Failed to delete dashboard');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
             <Skeleton className="h-10 w-64 mb-2" />
             <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Dashboards</h1>
          <p className="text-muted-foreground">Tailor your administrative experience with personalized data views</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="shadow-lg shadow-primary/20">
          {showAddForm ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Build Dashboard
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-none shadow-sm ring-1 ring-border animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-muted/10 border-b">
            <CardTitle className="flex items-center text-base">
              <Layout className="w-5 h-5 mr-2 text-primary" />
              Configure New Workspace
            </CardTitle>
            <CardDescription>Define the scope and visibility of your new dashboard</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAddDashboard} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dashboard Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newDashboard.name}
                    onChange={(e) => setNewDashboard(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Marketing Analytics"
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newDashboard.description}
                    onChange={(e) => setNewDashboard(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief overview of this dashboard's purpose"
                    required
                    className="h-10"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="text-xs font-bold uppercase tracking-widest">
                  Discard
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs font-bold uppercase tracking-widest px-6 shadow-md shadow-primary/20">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Initialize Dashboard'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboards.map(dashboard => (
          <Card key={dashboard.id} className="group border-none shadow-sm ring-1 ring-border flex flex-col hover:ring-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-base font-bold">
                    {dashboard.name}
                  </CardTitle>
                  <Badge variant="secondary" className="h-4 text-[8px] font-bold uppercase px-1">Active</Badge>
                </div>
                <CardDescription className="text-xs line-clamp-1">{dashboard.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={() => handleDeleteDashboard(dashboard.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="grid grid-cols-2 gap-4">
                {dashboard.widgets.map((widget, index) => (
                  <div key={index} className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col justify-between group/widget hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{widget.title}</span>
                      {widget.type === 'kpi' ? <Activity className="h-3 w-3 text-emerald-500" /> : <BarChart2 className="h-3 w-3 text-primary" />}
                    </div>
                    {widget.type === 'kpi' ? (
                      <div className="text-2xl font-bold tracking-tight">{widget.value}</div>
                    ) : (
                      <div className="h-10 w-full flex items-end space-x-1 pb-1">
                        <div className="h-2/3 w-full bg-primary/20 rounded-sm group-hover/widget:bg-primary/40 transition-colors" />
                        <div className="h-full w-full bg-primary/40 rounded-sm group-hover/widget:bg-primary/60 transition-colors" />
                        <div className="h-1/2 w-full bg-primary/30 rounded-sm group-hover/widget:bg-primary/50 transition-colors" />
                        <div className="h-3/4 w-full bg-primary/50 rounded-sm group-hover/widget:bg-primary/70 transition-colors" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/5 flex items-center justify-between">
              <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                <Calendar className="h-3 w-3 mr-1.5" />
                Updated {new Date(dashboard.updatedAt).toLocaleDateString()}
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest group/btn">
                Launch Workspace
                <ExternalLink className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {dashboards.length === 0 && (
          <div className="lg:col-span-2 py-20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
             <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Grid className="h-8 w-8 text-muted-foreground/50" />
             </div>
             <div>
                <h3 className="text-lg font-bold">No Custom Dashboards</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Build your own analytical workspaces to monitor specific segments of your business.</p>
             </div>
             <Button onClick={() => setShowAddForm(true)} variant="outline" size="sm" className="text-xs font-bold uppercase tracking-widest">
               Start Building
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
