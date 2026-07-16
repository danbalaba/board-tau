import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { ShieldAlert, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';

export function ReadOnlyCards() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="group h-full border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] border border-white/20 dark:border-gray-800 opacity-80 overflow-hidden transition-all duration-500 hover:shadow-amber-500/10 hover:border-amber-500/30 hover:opacity-100">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 transition-transform duration-500 group-hover:scale-110">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Security Settings</CardTitle>
              <CardDescription className="text-xs font-medium text-gray-500">How we handle reports and threats</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-8 pb-8 px-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Review Process</Label>
              <Input value="Manual Verification Required" disabled className="h-12 bg-white/30 dark:bg-gray-800/30 border-transparent rounded-xl px-4 opacity-70" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Auto-Hide After</Label>
                <Input value="3 Reports" disabled className="h-12 bg-white/30 dark:bg-gray-800/30 border-transparent rounded-xl px-4 opacity-70" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Send Alerts To</Label>
                <Input value="moderation@boardtau.com" disabled className="h-12 bg-white/30 dark:bg-gray-800/30 border-transparent rounded-xl px-4 opacity-70" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="group h-full border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] border border-white/20 dark:border-gray-800 opacity-80 overflow-hidden transition-all duration-500 hover:shadow-sky-500/10 hover:border-sky-500/30 hover:opacity-100">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 shrink-0 transition-transform duration-500 group-hover:scale-110">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Help & Resources</CardTitle>
              <CardDescription className="text-xs font-medium text-gray-500">End-user success and documentation links</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-8 pb-8 px-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Support Nexus</Label>
                <Input value="support@boardtau.com" disabled className="h-12 bg-white/30 dark:bg-gray-800/30 border-transparent rounded-xl px-4 opacity-70" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Knowledge Base</Label>
                <Input value="https://boardtau.com/faq" disabled className="h-12 bg-white/30 dark:bg-gray-800/30 border-transparent rounded-xl px-4 opacity-70" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service Windows</Label>
              <Textarea
                value="Monday-Friday, 9am-5pm EST"
                disabled
                rows={2}
                className="bg-white/30 dark:bg-gray-800/30 border-transparent rounded-xl p-4 resize-none opacity-70"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
