import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/admin/components/ui/dialog';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Flag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AddFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (flag: { name: string; description: string; risk: 'low'|'medium'|'high' }) => void;
}

export function AddFlagModal({ isOpen, onClose, onAdd }: AddFlagModalProps) {
  const [formData, setFormData] = useState<{ name: string; description: string; risk: 'low' | 'medium' | 'high' }>({ name: '', description: '', risk: 'low' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', description: '', risk: 'low' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader className="p-7 pb-0">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-emerald-400 border border-primary/20 shrink-0">
                    <Flag className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">Add New Feature Flag</DialogTitle>
                    <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Create a new dynamic toggle for the platform.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="p-7 space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Feature Identifier Name</Label>
                  <Input 
                    id="name"
                    placeholder="e.g. GLOBAL_AI_SEARCH" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Feature Description</Label>
                  <Textarea 
                    id="desc"
                    placeholder="What does this feature control on the platform?" 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-xs font-medium resize-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Impact Risk Level</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { risk: 'low', label: 'Low Risk', desc: 'Standard UI change' },
                      { risk: 'medium', label: 'Med Risk', desc: 'Flow modification' },
                      { risk: 'high', label: 'High Risk', desc: 'Core platform feature' },
                    ].map((item) => {
                      const isSelected = formData.risk === item.risk;
                      return (
                        <button
                          key={item.risk}
                          type="button"
                          onClick={() => setFormData({ ...formData, risk: item.risk as any })}
                          className={cn(
                            'p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between',
                            isSelected
                              ? (item.risk === 'high' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm'
                                : item.risk === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm'
                                : 'bg-primary/10 border-primary/30 text-primary dark:text-emerald-400 shadow-sm')
                              : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                          )}
                        >
                          <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 leading-tight">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="p-7 pt-0 sm:justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest shadow-lg bg-primary hover:bg-primary/90 text-white shadow-primary/20 gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" /> Save Feature
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
