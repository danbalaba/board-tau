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
  low: { label: 'Low Risk', color: 'bg-emerald-500/10 text-emerald-500' },
  medium: { label: 'Med Risk', color: 'bg-amber-500/10 text-amber-500' },
  high: { label: 'High Risk', color: 'bg-rose-500/10 text-rose-500' }
};

export function FlagCard({ flag, index, onToggle, onDelete, isSaving }: FlagCardProps) {
  const Icon = flag.icon;
  const risk = riskConfig[flag.risk];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      layout
    >
      <Card className={cn(
        'group relative overflow-hidden border backdrop-blur-2xl transition-all duration-500 rounded-[2rem]',
        flag.enabled 
          ? 'bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/90 dark:to-gray-900/50 border-white/50 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgb(0,0,0,0.4)] hover:-translate-y-1' 
          : 'bg-white/30 dark:bg-gray-900/30 opacity-70 border-white/20 dark:border-gray-800 hover:opacity-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
      )}>
        <div className={cn(
          'absolute top-0 left-0 h-full w-2 transition-all duration-500 group-hover:scale-y-105', 
          flag.enabled ? flag.bgClass.replace('/10', '') : 'bg-gray-200 dark:bg-gray-800'
        )} />
        <CardContent className="py-6 pl-8 pr-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5 min-w-0">
              <div className={cn(
                'rounded-[1.25rem] p-3 shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm', 
                flag.enabled ? flag.bgClass : 'bg-gray-100 dark:bg-gray-800'
              )}>
                <Icon className={cn('h-6 w-6', flag.enabled ? flag.colorClass : 'text-gray-400')} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white truncate drop-shadow-sm">
                    {formatDisplayName(flag.name)}
                  </h3>
                  <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg', risk.color)}>
                    {risk.label}
                  </span>
                  {flag.enabled && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                      On
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500 mt-1 truncate">
                  {flag.description}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                  Modified {new Date(flag.lastModified).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-6 shrink-0">
              <div className="flex items-center gap-3">
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-widest transition-colors', 
                  flag.enabled ? 'text-emerald-500' : 'text-gray-400'
                )}>
                  {flag.enabled ? 'On' : 'Off'}
                </span>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={(checked) => onToggle(flag.id, checked)}
                  disabled={isSaving}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              {flag.name !== 'GLOBAL_EMAIL_NOTIFICATIONS' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(flag)}
                  className="h-10 w-10 rounded-xl text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
