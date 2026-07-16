import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Switch } from '@/app/admin/components/ui/switch';
import { Clock, CheckCircle2, History, Save, Loader2, DownloadCloud, ChevronLeft, ChevronRight, FileJson } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/app/admin/components/ui/sonner';

export function AutomatedBackupCard() {
  const [enabled, setEnabled] = useState(false);
  const [schedule, setSchedule] = useState('daily');
  const [time, setTime] = useState('02:00');
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Track the last-saved state so we know when something has actually changed
  const [savedState, setSavedState] = useState({ enabled: false, schedule: 'daily', time: '02:00' });
  const isDirty = enabled !== savedState.enabled || schedule !== savedState.schedule || time !== savedState.time;

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings/backup');
        if (res.ok) {
          const data = await res.json();
          const isEnabled = data.autoBackupSchedule !== 'none';
          const fetchedSchedule = isEnabled ? data.autoBackupSchedule : 'daily';
          const fetchedTime = data.autoBackupTime || '02:00';
          setEnabled(isEnabled);
          setSchedule(fetchedSchedule);
          setTime(fetchedTime);
          // Sync saved state so button starts as disabled
          setSavedState({ enabled: isEnabled, schedule: fetchedSchedule, time: fetchedTime });
        }
      } catch (e) {
        console.error('Failed to fetch backup settings', e);
      }
    };
    
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/backup/logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchSettings();
    fetchLogs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoBackupSchedule: enabled ? schedule : 'none',
          autoBackupTime: time
        })
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      // Sync saved state so button becomes disabled again after saving
      setSavedState({ enabled, schedule, time });
      toast.success('Automated backup schedule saved securely.');
    } catch (error) {
      toast.error('Could not save automated backup settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="h-full">
      <Card className="group h-full border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] border border-indigo-500/10 dark:border-indigo-500/20 overflow-hidden transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 pt-8 pb-6 border-b border-indigo-50 dark:border-indigo-900/20 bg-indigo-50/30 dark:bg-indigo-900/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shrink-0 transition-transform duration-500 group-hover:scale-110">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-indigo-900 dark:text-indigo-400 flex items-center gap-3">
                Automated Backups
                {enabled && (
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-indigo-600/70 dark:text-indigo-400/70">
                Configure background workers to periodically snapshot your data.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-300">
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
            <Switch checked={enabled} onCheckedChange={setEnabled} className="data-[state=checked]:bg-indigo-500" />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6 opacity-100 transition-opacity duration-300" style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">Frequency</label>
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-800/50 border border-indigo-100 dark:border-indigo-800/30 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl focus:ring-2 focus:ring-indigo-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-indigo-100 dark:border-indigo-800 rounded-xl">
                      <SelectItem value="daily" className="text-xs font-bold uppercase tracking-wider">Daily</SelectItem>
                      <SelectItem value="weekly" className="text-xs font-bold uppercase tracking-wider">Weekly</SelectItem>
                      <SelectItem value="monthly" className="text-xs font-bold uppercase tracking-wider">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">Time of Day</label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-800/50 border border-indigo-100 dark:border-indigo-800/30 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl focus:ring-2 focus:ring-indigo-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-indigo-100 dark:border-indigo-800 rounded-xl max-h-[200px]">
                      <SelectItem value="00:00" className="text-xs font-bold uppercase tracking-wider">Midnight (00:00)</SelectItem>
                      <SelectItem value="02:00" className="text-xs font-bold uppercase tracking-wider">2:00 AM</SelectItem>
                      <SelectItem value="04:00" className="text-xs font-bold uppercase tracking-wider">4:00 AM</SelectItem>
                      <SelectItem value="12:00" className="text-xs font-bold uppercase tracking-wider">Noon (12:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleSave} 
                disabled={saving || !isDirty}
                className="w-full sm:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl gap-2 transition-all shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Schedule'}
              </Button>
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
