import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/admin/components/ui/dialog';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Flag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] shadow-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader className="p-6 pb-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Flag className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Add New Feature</DialogTitle>
                    <DialogDescription className="text-xs font-medium text-gray-500 mt-1">Create a new toggle for the platform.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Feature Name</Label>
                  <Input 
                    id="name"
                    placeholder="e.g. BETA_AI_SEARCH" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Description</Label>
                  <Textarea 
                    id="desc"
                    placeholder="What does this feature control?" 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl p-4 font-medium resize-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Impact Level</Label>
                  <div className="flex gap-4">
                    {(['low', 'medium', 'high'] as const).map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="risk" 
                          value={r} 
                          checked={formData.risk === r}
                          onChange={() => setFormData({ ...formData, risk: r })}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="p-6 pt-0 sm:justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Abort
                </Button>
                <Button type="submit" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-lg bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" /> Add Feature
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
