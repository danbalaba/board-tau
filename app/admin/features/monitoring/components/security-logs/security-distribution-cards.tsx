import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { IconWorld, IconFingerprint, IconUserSearch } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

export function GeographicOriginCard() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
         <div>
            <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Geographics</CardTitle>
            <CardDescription className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Regional Origin Distribution</CardDescription>
         </div>
         <div className="p-3 bg-blue-500/10 rounded-2xl">
           <IconWorld className="h-6 w-6 text-blue-500" />
         </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {[
          { label: 'United States', value: 85, color: 'bg-emerald-500' },
          { label: 'United Kingdom', value: 24, color: 'bg-blue-500' },
          { label: 'Russia', value: 18, color: 'bg-rose-500' },
          { label: 'Canada', value: 12, color: 'bg-gray-400' },
          { label: 'Germany', value: 7, color: 'bg-violet-500' }
        ].map((origin) => (
          <div key={origin.label} className="group space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
              <span>{origin.label}</span>
              <span className="font-mono text-gray-900 dark:text-white">{origin.value} hits</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 shadow-inner">
              <motion.div 
                className={cn("h-full", origin.color)}
                initial={{ width: 0 }}
                whileInView={{ width: `${(origin.value / 85) * 100}%` }}
                transition={{ duration: 1, ease: "circOut" }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EventTaxonomyCard() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
         <div>
            <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Taxonomy</CardTitle>
            <CardDescription className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Event Distribution Spectrum</CardDescription>
         </div>
         <div className="p-3 bg-violet-500/10 rounded-2xl">
           <IconFingerprint className="h-6 w-6 text-violet-500" />
         </div>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">
        {[
          { label: 'Auth Success', value: 45, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Failed Access', value: 8, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Data I/O', value: 32, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Config Shift', value: 18, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Health Scans', value: 4, color: 'text-gray-400', bg: 'bg-gray-400/10' }
        ].map((type) => (
          <div key={type.label} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">{type.label}</span>
            <Badge className={cn("text-[10px] font-black border-none px-3 py-0.5 rounded-lg shadow-sm", type.bg, type.color)}>
              {type.value}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function VulnerabilityVectorCard() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
         <div>
            <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Vectors</CardTitle>
            <CardDescription className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Priority Target Identities</CardDescription>
         </div>
         <div className="p-3 bg-amber-500/10 rounded-2xl">
           <IconUserSearch className="h-6 w-6 text-amber-500" />
         </div>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">
        {[
          { label: 'admin@boardtau.com', value: 28, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'johndoe@example.com', value: 15, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'sarah@example.com', value: 12, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'mike@example.com', value: 9, color: 'text-gray-400', bg: 'bg-gray-400/10' },
          { label: 'system_root', value: 4, color: 'text-violet-500', bg: 'bg-violet-500/10' }
        ].map((user) => (
          <div key={user.label} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md">
            <span className="text-[9px] font-black tracking-widest text-gray-500 truncate max-w-[120px] uppercase">{user.label.split('@')[0]}</span>
            <Badge className={cn("text-[10px] font-black border-none px-3 py-0.5 rounded-lg shadow-sm", user.bg, user.color)}>
              {user.value} ops
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
