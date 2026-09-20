import React from 'react';
import { Card, CardContent } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Switch } from '@/app/admin/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const formatDisplayName = (name: string) => {
  return name
    .replace(/^GLOBAL_/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export interface FlagData {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  lastModified: string;
  risk: 'low' | 'medium' | 'high';
}

interface FlagCardProps {
  flag: FlagData;
  index: number;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (flag: FlagData) => void;
  isSaving: boolean;
}

const riskConfig = {
  low: { label: 'Low Risk', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' },
  medium: { label: 'Med Risk', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30' },
  high: { label: 'High Risk', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30' }
};

export function FlagCard({ flag, index, onToggle, onDelete, isSaving }: FlagCardProps) {
  const Icon = flag.icon;
  const risk = riskConfig[flag.risk];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
      className="h-full"
    >
      <Card className={cn(
        'group relative overflow-hidden border backdrop-blur-2xl transition-all duration-300 rounded-[2.5rem] shadow-xl hover:shadow-2xl flex flex-col justify-between h-full p-7',
        flag.enabled 
          ? 'bg-white/90 dark:bg-gray-900/90 border-gray-200/90 dark:border-gray-800 shadow-primary/5 hover:border-primary/40 hover:-translate-y-1' 
          : 'bg-white/40 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-800/60 opacity-85 hover:opacity-100 hover:-translate-y-1'
      )}>
        {/* Top glowing accent line */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-1.5 transition-all duration-300', 
          flag.enabled 
            ? (flag.risk === 'high' ? 'bg-gradient-to-r from-rose-500 to-pink-500' : flag.risk === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary via-teal-400 to-emerald-400') 
            : 'bg-gray-200 dark:bg-gray-800'
        )} />

        <CardContent className="p-0 flex flex-col justify-between h-full space-y-6">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-md border', 
                flag.enabled 
                  ? 'bg-primary/10 border-primary/30 text-primary dark:text-emerald-400 shadow-primary/20' 
                  : 'bg-gray-100 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 text-gray-400'
              )}>
                <Icon size={26} strokeWidth={2.2} />
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <span className={cn('text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl', risk.color)}>
                  {risk.label}
                </span>
                {flag.enabled ? (
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-primary/15 text-primary dark:text-emerald-300 border border-primary/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-emerald-400 animate-pulse" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    DISABLED
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                {formatDisplayName(flag.name)}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
                {flag.description}
              </p>
            </div>
          </div>
          
          {/* Footer Controls */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Updated {new Date(flag.lastModified).toLocaleDateString()}
            </span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-gray-100/90 dark:bg-gray-800/90 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <span className={cn(
                  'text-xs font-black uppercase tracking-widest transition-colors', 
                  flag.enabled ? 'text-primary dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                )}>
                  {flag.enabled ? 'ON' : 'OFF'}
                </span>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={(checked) => onToggle(flag.id, checked)}
                  disabled={isSaving}
                  className="data-[state=checked]:bg-primary cursor-pointer"
                />
              </div>

              {flag.name !== 'GLOBAL_EMAIL_NOTIFICATIONS' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(flag)}
                  className="h-10 w-10 rounded-2xl text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
