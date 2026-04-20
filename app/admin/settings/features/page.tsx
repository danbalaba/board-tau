'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Switch } from '@/app/admin/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Save, Flag, Trash, Loader2, Plus, AlertCircle, Globe, Laptop, Server, Edit3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/app/admin/components/ui/badge';
import { format } from 'date-fns';

export default function FeatureFlags() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    enabled: false,
    environment: 'production'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await fetch('/api/admin/settings/features');
      const result = await response.json();
      if (result.success) {
        setFeatures(result.data);
      }
    } catch (error) {
      toast.error('Failed to load feature flags');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/settings/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !currentStatus })
      });
      const result = await response.json();
      if (result.success) {
        setFeatures(prev => prev.map(f => f.id === id ? result.data : f));
        toast.success(`Feature ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      toast.error('Connection error while toggling feature');
    }
  };

  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/settings/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeature)
      });
      const result = await response.json();
      if (result.success) {
        setFeatures(prev => [result.data, ...prev]);
        setNewFeature({ name: '', description: '', enabled: false, environment: 'production' });
        setShowAddForm(false);
        toast.success('Feature flag deployed to ' + newFeature.environment);
      } else {
        toast.error(result.message || 'Failed to create feature');
      }
    } catch (error) {
      toast.error('An error occurred during deployment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { createdAt, updatedAt, ...updateData } = editingFeature;
      const response = await fetch('/api/admin/settings/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const result = await response.json();
      if (result.success) {
        setFeatures(prev => prev.map(f => f.id === editingFeature.id ? result.data : f));
        setEditingFeature(null);
        toast.success('Feature flag updated');
      }
    } catch (error) {
      toast.error('Failed to update feature');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this feature flag?')) return;
    try {
      const response = await fetch(`/api/admin/settings/features?id=${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setFeatures(prev => prev.filter(f => f.id !== id));
        toast.success('Feature flag purged from database');
      }
    } catch (error) {
      toast.error('Failed to delete feature');
    }
  };

  const getEnvIcon = (env: string) => {
    switch (env) {
      case 'production': return <Globe className="w-3 h-3 mr-1" />;
      case 'staging': return <Server className="w-3 h-3 mr-1" />;
      default: return <Laptop className="w-3 h-3 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Synchronizing feature repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Management</h1>
          <p className="text-muted-foreground">Remotely toggle platform capabilities and controlled rollouts</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={() => fetchFeatures(true)} disabled={refreshing} className="h-10 w-10">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
           </Button>
           <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 font-bold uppercase tracking-widest text-[10px] shadow-sm">
             <Plus className="w-4 h-4 mr-2" />
             Create New Flag
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => (
          <Card key={feature.id} className={`border-none shadow-sm ring-1 transition-all duration-300 ${
            feature.enabled ? 'ring-primary/20 bg-primary/[0.02]' : 'ring-border'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                   <CardTitle className="text-base font-bold flex items-center gap-2">
                     <Flag className={`w-4 h-4 ${feature.enabled ? 'text-primary' : 'text-slate-400'}`} />
                     {feature.name}
                   </CardTitle>
                   <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest h-5 ${
                     feature.environment === 'production' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                     feature.environment === 'staging' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                     'bg-blue-50 text-blue-700 border-blue-200'
                   }`}>
                     {getEnvIcon(feature.environment)}
                     {feature.environment}
                   </Badge>
                </div>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => setEditingFeature(feature)}>
                      <Edit3 className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDeleteFeature(feature.id)}>
                      <Trash className="w-4 h-4" />
                   </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed min-h-[32px]">
                {feature.description}
              </p>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${feature.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {feature.enabled ? 'Active' : 'Disabled'}
                   </span>
                </div>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => handleToggleFeature(feature.id, feature.enabled)}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4">
               <p className="text-[9px] text-muted-foreground font-medium italic">
                 Updated: {format(new Date(feature.updatedAt), 'MMM dd, HH:mm')}
               </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {(showAddForm || editingFeature) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg font-bold flex items-center">
                {editingFeature ? <Edit3 className="w-5 h-5 mr-2 text-primary" /> : <Plus className="w-5 h-5 mr-2 text-primary" />}
                {editingFeature ? 'Edit Feature Flag' : 'Initialize Feature Flag'}
              </CardTitle>
              <CardDescription>
                {editingFeature ? 'Update feature parameters and targeting' : 'Define a new toggle for controlled feature distribution'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={editingFeature ? handleUpdateFeature : handleAddFeature} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Feature Name</Label>
                    <Input
                      value={editingFeature ? editingFeature.name : newFeature.name}
                      onChange={(e) => editingFeature ? setEditingFeature({...editingFeature, name: e.target.value}) : setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Real-time Chat"
                      className="h-11 bg-transparent focus-visible:ring-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Environment Target</Label>
                    <Select
                      value={editingFeature ? editingFeature.environment : newFeature.environment}
                      onValueChange={(v) => editingFeature ? setEditingFeature({...editingFeature, environment: v}) : setNewFeature(prev => ({ ...prev, environment: v }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Business Context</Label>
                  <Textarea
                    value={editingFeature ? editingFeature.description : newFeature.description}
                    onChange={(e) => editingFeature ? setEditingFeature({...editingFeature, description: e.target.value}) : setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this flag controls..."
                    rows={3}
                    required
                    className="resize-none bg-transparent focus-visible:ring-primary p-3"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => { setShowAddForm(false); setEditingFeature(null); }} className="text-xs font-bold uppercase tracking-widest">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-8 h-11">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingFeature ? 'Update Flag' : 'Deploy Flag')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {features.length === 0 && !loading && (
        <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
           <div className="p-4 bg-white dark:bg-slate-800 rounded-full w-fit mx-auto shadow-sm mb-6">
              <AlertCircle className="w-10 h-10 text-slate-300" />
           </div>
           <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Feature Flags Detected</h3>
           <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 leading-relaxed">
             Start by creating your first toggle to control platform behavior dynamically without code changes.
           </p>
           <Button onClick={() => setShowAddForm(true)} variant="outline" className="mt-8 px-8 font-bold uppercase tracking-widest text-[10px] h-10 border-slate-300">
              Create Initial Flag
           </Button>
        </div>
      )}
    </div>
  );
}
