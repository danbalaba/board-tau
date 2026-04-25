'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Switch } from '@/app/admin/components/ui/switch';
import { Label } from '@/app/admin/components/ui/label';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Badge } from '@/app/admin/components/ui/badge';
import {
  IconFlag,
  IconPlus,
  IconTrash,
  IconBolt,
  IconCircleCheck,
  IconSearch,
  IconLanguage,
  IconMoonStars,
  IconZoom,
  IconMessageCircle,
  IconShieldHalfFilled,
  IconCloudUpload,
  IconDeviceFloppy,
  IconRefresh,
  IconGlobe,
  IconServer,
  IconDeviceLaptop,
  IconEdit
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: string;
  createdAt: string;
  updatedAt: string;
}

const riskConfig = {
  low: { label: 'Low Risk', color: 'bg-emerald-500/10 text-emerald-500' },
  medium: { label: 'Med Risk', color: 'bg-amber-500/10 text-amber-500' },
  high: { label: 'High Risk', color: 'bg-red-500/10 text-red-500' }
};

const getFeatureIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('language') || lower.includes('i18n')) return IconLanguage;
  if (lower.includes('dark') || lower.includes('theme')) return IconMoonStars;
  if (lower.includes('search') || lower.includes('filter')) return IconZoom;
  if (lower.includes('chat') || lower.includes('message')) return IconMessageCircle;
  if (lower.includes('shield') || lower.includes('security') || lower.includes('insurance')) return IconShieldHalfFilled;
  return IconBolt;
};

const getFeatureColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('language')) return { color: 'text-blue-500', bg: 'bg-blue-500/10' };
  if (lower.includes('dark')) return { color: 'text-purple-500', bg: 'bg-purple-500/10' };
  if (lower.includes('search')) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  if (lower.includes('chat')) return { color: 'text-amber-500', bg: 'bg-amber-500/10' };
  if (lower.includes('security')) return { color: 'text-red-500', bg: 'bg-red-500/10' };
  return { color: 'text-cyan-500', bg: 'bg-cyan-500/10' };
};

const getEnvIcon = (env: string) => {
  switch (env.toLowerCase()) {
    case 'production': return IconGlobe;
    case 'staging': return IconServer;
    default: return IconDeviceLaptop;
  }
};

export function FeatureFlags() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureFlag | null>(null);
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
      toast.error('Failed to load feature flags from repository');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/settings/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !currentStatus })
      });
      const result = await response.json();
      if (result.success) {
        setFeatures(prev => prev.map(f => f.id === id ? result.data : f));
        toast.success(`Module ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
      }
    } catch (error) {
      toast.error('Control link failure. Check infrastructure status.');
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
        toast.success(`Feature flag registered in ${newFeature.environment}.`);
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during flag deployment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently decommission this feature flag?')) return;
    try {
      const response = await fetch(`/api/admin/settings/features?id=${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setFeatures(prev => prev.filter(f => f.id !== id));
        toast.success('Feature flag successfully purged from database.');
      }
    } catch (error) {
      toast.error('Failed to decommission flag.');
    }
  };

  const filtered = features.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  const enabledCount = features.filter(f => f.enabled).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium text-[10px] uppercase tracking-widest font-black">Synchronizing Feature Repository...</p>
      </div>
    );
  }

  return (
    <PageContainer
      pageTitle="Feature Control Matrix"
      pageDescription="Runtime feature flag governance and experimental module activation"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => fetchFeatures(true)}
            disabled={refreshing}
          >
            <IconRefresh className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
          >
            <IconPlus className="w-4 h-4" />
            Register Flag
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Flags', value: features.length, color: 'text-primary' },
            { label: 'Active', value: enabledCount, color: 'text-emerald-500' },
            { label: 'Inactive', value: features.length - enabledCount, color: 'text-muted-foreground' }
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl text-center py-4">
                <p className={cn('text-3xl font-black tabular-nums', s.color)}>{s.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Search feature flags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 h-10 font-medium"
          />
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-none bg-card/30 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
                <CardHeader className="pb-6">
                  <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                    <IconFlag className="w-5 h-5 text-primary" />
                    Register New Feature Flag
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddFeature} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="featureName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Flag Identifier</Label>
                        <Input
                          id="featureName"
                          placeholder="e.g. BETA_AI_SEARCH"
                          value={newFeature.name}
                          onChange={e => setNewFeature({ ...newFeature, name: e.target.value })}
                          className="bg-white/5 border-white/10 h-11 font-bold"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="featureEnvironment" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Environment Target</Label>
                        <div className="flex gap-2">
                          {['development', 'staging', 'production'].map(env => (
                            <Button 
                              key={env}
                              type="button"
                              variant={newFeature.environment === env ? 'default' : 'outline'}
                              size="sm"
                              className="text-[9px] font-black uppercase tracking-widest h-11 flex-1"
                              onClick={() => setNewFeature({ ...newFeature, environment: env })}
                            >
                              {env}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="featureDescription" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mission Statement</Label>
                      <Textarea
                        id="featureDescription"
                        placeholder="What does this flag control?"
                        value={newFeature.description}
                        onChange={e => setNewFeature({ ...newFeature, description: e.target.value })}
                        className="bg-white/5 border-white/10 h-24 font-bold resize-none"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} className="font-black uppercase text-[10px] tracking-widest">
                        Abort
                      </Button>
                      <Button type="submit" disabled={submitting} className="gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
                        {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <IconCircleCheck className="w-4 h-4" />}
                        Activate Flag
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Grid */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((feature, i) => {
              const Icon = getFeatureIcon(feature.name);
              const colors = getFeatureColor(feature.name);
              const EnvIcon = getEnvIcon(feature.environment);
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  layout
                >
                  <Card className={cn(
                    'group relative overflow-hidden border-none backdrop-blur-md shadow-xl transition-all hover:shadow-2xl',
                    feature.enabled ? 'bg-card/40 ring-1 ring-white/5' : 'bg-card/20'
                  )}>
                    <div className={cn('absolute top-0 left-0 h-full w-0.5 transition-all', feature.enabled ? colors.bg.replace('/10', '') : 'bg-white/5')} />
                    <CardContent className="py-5 pl-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={cn('rounded-xl p-2.5 shrink-0 transition-transform group-hover:scale-110', feature.enabled ? colors.bg : 'bg-white/5')}>
                            <Icon className={cn('h-5 w-5', feature.enabled ? colors.color : 'text-muted-foreground/40')} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-black tracking-tight truncate">{feature.name}</p>
                              <Badge variant="outline" className={cn('text-[9px] font-black uppercase border-none h-4 px-1.5 shrink-0 flex items-center gap-1 bg-white/5 text-muted-foreground')}>
                                <EnvIcon className="w-3 h-3" />
                                {feature.environment}
                              </Badge>
                              {feature.enabled && (
                                <Badge variant="outline" className="text-[9px] font-black uppercase border-none h-4 px-1.5 bg-emerald-500/10 text-emerald-500 shrink-0">
                                  Live
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{feature.description}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">
                              Last Modified {new Date(feature.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-[10px] font-black uppercase tracking-widest', feature.enabled ? 'text-emerald-500' : 'text-muted-foreground/40')}>
                              {feature.enabled ? 'Active' : 'Staged'}
                            </span>
                            <Switch
                              id={`feature-${feature.id}`}
                              checked={feature.enabled}
                              onCheckedChange={() => handleToggle(feature.id, feature.enabled)}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                            onClick={() => handleDelete(feature.id)}
                          >
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
               <IconBolt className="w-10 h-10 text-white/10 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No matching flags found in matrix</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
