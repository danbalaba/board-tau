'use client';

import React, { useState } from 'react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from '@/app/admin/components/ui/sonner';
import { 
  useFeatureFlags, 
  useCreateFeatureFlag, 
  useUpdateFeatureFlag, 
  useDeleteFeatureFlag,
  FeatureFlag
} from '@/app/admin/hooks/use-feature-flags';
import Skeleton from '@/components/common/Skeleton';
import { Settings2, Zap, LayoutTemplate, ShieldCheck, Database, Search as SearchIcon, Globe, Palette, Sparkles, Mail, BellRing } from 'lucide-react';
import { FeatureHeader } from './feature-header';
import { FlagStatsCards } from './flag-stats-cards';
import { FlagCard, FlagData } from './flag-card';
import { AddFlagModal } from './add-flag-modal';
import { DeleteFlagModal } from './delete-flag-modal';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic icon mapper based on flag name/type
function getIconForFlag(name: string) {
  const n = name.toLowerCase();
  if (n.includes('mail') || n.includes('email')) return Mail;
  if (n.includes('notify') || n.includes('push')) return BellRing;
  if (n.includes('ai') || n.includes('smart')) return Sparkles;
  if (n.includes('theme') || n.includes('color')) return Palette;
  if (n.includes('search')) return SearchIcon;
  if (n.includes('lang') || n.includes('globe')) return Globe;
  if (n.includes('layout') || n.includes('ui')) return LayoutTemplate;
  if (n.includes('secure') || n.includes('auth')) return ShieldCheck;
  if (n.includes('data') || n.includes('sync')) return Database;
  if (n.includes('beta')) return Zap;
  return Settings2;
}

export function FeatureFlags() {
  const { data: queryResponse, isLoading } = useFeatureFlags();
  const rawData = queryResponse?.data as any;
  const dbFlags = Array.isArray(rawData?.features) 
    ? rawData.features 
    : (Array.isArray(rawData) ? rawData : []);
  const history = Array.isArray(rawData?.history) ? rawData.history : [];
  
  const createMutation = useCreateFeatureFlag();
  const updateMutation = useUpdateFeatureFlag();
  const deleteMutation = useDeleteFeatureFlag();

  const [search, setSearch] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [flagToDelete, setFlagToDelete] = useState<FlagData | null>(null);

  // Map DB flags to the UI FlagData format
  const flags: FlagData[] = dbFlags.map((f: FeatureFlag) => {
    let colorClass = 'text-blue-500';
    let bgClass = 'bg-blue-500/10';
    
    if (f.risk === 'high') { colorClass = 'text-rose-500'; bgClass = 'bg-rose-500/10'; }
    else if (f.risk === 'medium') { colorClass = 'text-amber-500'; bgClass = 'bg-amber-500/10'; }
    else if (f.risk === 'low') { colorClass = 'text-emerald-500'; bgClass = 'bg-emerald-500/10'; }

    return {
      id: f.id,
      name: f.name,
      description: f.description,
      enabled: f.enabled,
      icon: getIconForFlag(f.name),
      colorClass,
      bgClass,
      lastModified: f.updatedAt,
      risk: f.risk as 'low'|'medium'|'high'
    };
  });

  const handleToggle = async (id: string, checked: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, enabled: checked });
      toast.success(`Feature ${checked ? 'activated' : 'disabled'} successfully.`);
    } catch (error: any) {
      toast.error('Failed to update flag state.');
    }
  };

  const handleAdd = async (newFlag: { name: string; description: string; risk: 'low'|'medium'|'high' }) => {
    try {
      await createMutation.mutateAsync({ ...newFlag, enabled: false });
      setIsAddOpen(false);
      toast.success('Feature flag created successfully.');
    } catch (error) {
      toast.error('Failed to create flag. Name might already exist.');
    }
  };

  const handleDelete = async () => {
    if (flagToDelete) {
      try {
        await deleteMutation.mutateAsync(flagToDelete.id);
        toast.success('Feature flag deleted permanently.');
      } catch (error) {
        toast.error('Failed to delete feature flag.');
      }
    }
    setIsDeleteOpen(false);
    setFlagToDelete(null);
  };

  const filtered = flags.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.description.toLowerCase().includes(search.toLowerCase())
  );
  const activeCount = flags.filter(f => f.enabled).length;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[180px] w-full rounded-[2.5rem]" />
          ))}
        </div>

        {/* List Items Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <FeatureHeader 
        search={search}
        setSearch={setSearch}
        onAdd={() => setIsAddOpen(true)}
      />
      
      <FlagStatsCards 
        total={flags.length}
        active={activeCount}
        inactive={flags.length - activeCount}
        history={history}
      />
      
      <div className="space-y-4 pb-10">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gray-500/10 text-gray-400">
                <Settings2 size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Flags Found</h3>
              <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                Could not find any feature flags matching "{search}".
              </p>
            </motion.div>
          ) : (
            filtered.map((flag, idx) => (
              <FlagCard
                key={flag.id}
                flag={flag}
                index={idx}
                onToggle={handleToggle}
                onDelete={(f) => {
                  setFlagToDelete(f);
                  setIsDeleteOpen(true);
                }}
                isSaving={updateMutation.isPending && updateMutation.variables?.id === flag.id}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <AddFlagModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
      />

      <DeleteFlagModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        flag={flagToDelete}
      />
    </div>
  );
}
