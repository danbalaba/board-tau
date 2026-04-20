'use client';

import React, { useState } from 'react';
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
  IconToggleLeft,
  IconToggleRight,
  IconBolt,
  IconCircleCheck,
  IconSearch,
  IconLanguage,
  IconMoonStars,
  IconZoom,
  IconMessageCircle,
  IconShieldHalfFilled,
  IconCloudUpload,
  IconDeviceFloppy
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  lastModified: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  risk: 'low' | 'medium' | 'high';
}

const initialFeatures: FeatureFlag[] = [
  {
    id: '1',
    name: 'Multi-language Support',
    description: 'Allow users to switch between multiple languages across all platform surfaces',
    enabled: true,
    createdAt: '2024-01-01T10:00:00Z',
    lastModified: '2024-01-10T09:30:00Z',
    icon: IconLanguage,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    risk: 'low'
  },
  {
    id: '2',
    name: 'Dark Mode',
    description: 'Enable high-contrast dark mode for the entire platform UI',
    enabled: true,
    createdAt: '2024-01-05T14:20:00Z',
    lastModified: '2024-01-08T11:45:00Z',
    icon: IconMoonStars,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    risk: 'low'
  },
  {
    id: '3',
    name: 'Advanced Search',
    description: 'Allow users to search listings with advanced multi-dimensional filters',
    enabled: true,
    createdAt: '2024-01-03T09:15:00Z',
    lastModified: '2024-01-07T16:20:00Z',
    icon: IconZoom,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    risk: 'low'
  },
  {
    id: '4',
    name: 'Chat Support',
    description: 'Enable real-time in-app chat between guests and support agents',
    enabled: false,
    createdAt: '2024-01-06T11:30:00Z',
    lastModified: '2024-01-06T11:30:00Z',
    icon: IconMessageCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    risk: 'medium'
  },
  {
    id: '5',
    name: 'Booking Insurance',
    description: 'Offer optional insurance add-on for all bookings, powered by external underwriters',
    enabled: false,
    createdAt: '2024-01-08T13:45:00Z',
    lastModified: '2024-01-08T13:45:00Z',
    icon: IconShieldHalfFilled,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    risk: 'high'
  }
];

const riskConfig = {
  low: { label: 'Low Risk', color: 'bg-emerald-500/10 text-emerald-500' },
  medium: { label: 'Med Risk', color: 'bg-amber-500/10 text-amber-500' },
  high: { label: 'High Risk', color: 'bg-red-500/10 text-red-500' }
};

export function FeatureFlags() {
  const [features, setFeatures] = useState<FeatureFlag[]>(initialFeatures);
  const [newFeature, setNewFeature] = useState({ name: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');

  const handleToggle = (id: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    const flag = features.find(f => f.id === id);
    toast.success(`${flag?.name} ${flag?.enabled ? 'disabled' : 'enabled'}.`);
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: FeatureFlag = {
      id: Date.now().toString(),
      name: newFeature.name,
      description: newFeature.description,
      enabled: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      icon: IconBolt,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      risk: 'low'
    };
    setFeatures([...features, newItem]);
    setNewFeature({ name: '', description: '' });
    setShowAddForm(false);
    toast.success('Feature flag registered.');
  };

  const handleDelete = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
    toast.success('Feature flag decommissioned.');
  };

  const filtered = features.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  const enabledCount = features.filter(f => f.enabled).length;

  return (
    <PageContainer
      pageTitle="Feature Control Matrix"
      pageDescription="Runtime feature flag governance and experimental module activation"
      pageHeaderAction={
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
        >
          <IconPlus className="w-4 h-4" />
          Register Flag
        </Button>
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
                        <Label htmlFor="featureDescription" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mission Statement</Label>
                        <Input
                          id="featureDescription"
                          placeholder="What does this flag control?"
                          value={newFeature.description}
                          onChange={e => setNewFeature({ ...newFeature, description: e.target.value })}
                          className="bg-white/5 border-white/10 h-11 font-bold"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} className="font-black uppercase text-[10px] tracking-widest">
                        Abort
                      </Button>
                      <Button type="submit" className="gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
                        <IconCircleCheck className="w-4 h-4" /> Activate Flag
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
          {filtered.map((feature, i) => {
            const Icon = feature.icon;
            const risk = riskConfig[feature.risk];
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
                  <div className={cn('absolute top-0 left-0 h-full w-0.5 transition-all', feature.enabled ? feature.bg.replace('/10', '') : 'bg-white/5')} />
                  <CardContent className="py-5 pl-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={cn('rounded-xl p-2.5 shrink-0 transition-transform group-hover:scale-110', feature.enabled ? feature.bg : 'bg-white/5')}>
                          <Icon className={cn('h-5 w-5', feature.enabled ? feature.color : 'text-muted-foreground/40')} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-black tracking-tight truncate">{feature.name}</p>
                            <Badge variant="outline" className={cn('text-[9px] font-black uppercase border-none h-4 px-1.5 shrink-0', risk.color)}>
                              {risk.label}
                            </Badge>
                            {feature.enabled && (
                              <Badge variant="outline" className="text-[9px] font-black uppercase border-none h-4 px-1.5 bg-emerald-500/10 text-emerald-500 shrink-0">
                                Live
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{feature.description}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">
                            Modified {new Date(feature.lastModified).toLocaleDateString()}
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
                            onCheckedChange={() => handleToggle(feature.id)}
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
          })}
        </div>
      </div>
    </PageContainer>
  );
}
