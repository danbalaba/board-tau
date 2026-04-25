'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Switch } from '@/app/admin/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/admin/components/ui/avatar';
import {
  IconUser,
  IconLock,
  IconBell,
  IconWorld,
  IconPhotoEdit,
  IconDeviceFloppy,
  IconKey,
  IconMail,
  IconCheck
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from 'sonner';

export function AccountSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleAction = (label: string) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`${label} updated successfully.`);
    }, 1000);
  };

  return (
    <PageContainer
      pageTitle="Account Preferences"
      pageDescription="Personalize your administrative profile and security protocols"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Left Column: Profile & Security */}
        <div className="space-y-8 lg:col-span-7">
          {/* Profile Identity */}
          <Card className="border-none bg-card shadow-md">
            <CardHeader className="flex flex-row items-center gap-4 border-b pb-6 space-y-0">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                 <IconUser className="h-6 w-6" />
               </div>
               <div>
                 <CardTitle>Profile Identity</CardTitle>
                 <CardDescription>Personal information and bio</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/20 border border-border/50">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="h-9 gap-2 shadow-sm font-bold uppercase text-[10px]">
                       <IconPhotoEdit className="h-4 w-4" /> Change Avatar
                    </Button>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                       Optimal: 800x800px • WebP / PNG
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Full Name</Label>
                    <Input defaultValue="Administrator User" className="h-11 bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone</Label>
                    <Input defaultValue="+65 1234 5678" className="h-11 bg-muted/30" />
                  </div>
               </div>

               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Bio / Mission Statement</Label>
                 <Textarea 
                    defaultValue="I'm an administrator for BoardTAU, managing the platform and ensuring everything runs smoothly."
                    rows={4}
                    className="bg-muted/30 resize-none italic"
                 />
               </div>

               <Button onClick={() => handleAction('Profile')} className="w-full h-12 gap-2 font-black uppercase tracking-widest shadow-lg">
                 <IconDeviceFloppy className="h-5 w-5" /> Commit Changes
               </Button>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card className="border-none bg-card shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-rose-500/5 border-b border-rose-500/10 pb-6 space-y-0 text-rose-500">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20">
                 <IconLock className="h-6 w-6" />
               </div>
               <div>
                 <CardTitle className="text-rose-500">Access Control</CardTitle>
                 <CardDescription className="text-rose-500/60">Update passwords and auth tokens</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Current Signature</Label>
                  <Input type="password" placeholder="••••••••••••" className="h-11 bg-muted/30" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">New Passphrase</Label>
                    <Input type="password" placeholder="••••••••••••" className="h-11 bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Confirm Passphrase</Label>
                    <Input type="password" placeholder="••••••••••••" className="h-11 bg-muted/30" />
                  </div>
               </div>
               <Button onClick={() => handleAction('Password')} variant="secondary" className="w-full h-12 gap-2 font-black uppercase tracking-widest border border-rose-500/20 text-rose-600 bg-rose-500/5 hover:bg-rose-500/10">
                  <IconKey className="h-5 w-5" /> Rotate Password
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preferences & Notifications */}
        <div className="space-y-8 lg:col-span-5">
           {/* Notification Routing */}
           <Card className="border-none bg-card shadow-md">
             <CardHeader className="flex flex-row items-center gap-4 border-b pb-6 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <IconBell className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Global Alerts</CardTitle>
                  <CardDescription>Event-driven notification protocols</CardDescription>
                </div>
             </CardHeader>
             <CardContent className="pt-4 divide-y">
                {[
                  { id: 'email', label: 'Email Dispatch', desc: 'Sync with primary inbox', icon: IconMail },
                  { id: 'push', label: 'Push Relays', desc: 'Active browser sockets', icon: IconCheck },
                  { id: 'sec', label: 'Security Breaches', desc: 'Priority anomaly reports', icon: IconLock }
                ].map((item) => (
                   <div key={item.id} className="flex items-center justify-between py-4">
                      <div className="flex gap-4">
                         <div className="mt-0.5 text-muted-foreground"><item.icon className="h-4 w-4" /></div>
                         <div className="space-y-0.5">
                            <p className="text-sm font-bold tracking-tight leading-none">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground italic">{item.desc}</p>
                         </div>
                      </div>
                      <Switch defaultChecked />
                   </div>
                ))}
             </CardContent>
           </Card>

           {/* Localization & Sync */}
           <Card className="border-none bg-card shadow-md">
             <CardHeader className="flex flex-row items-center gap-4 border-b pb-6 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <IconWorld className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Regional Sync</CardTitle>
                  <CardDescription>Temporal and linguistic defaults</CardDescription>
                </div>
             </CardHeader>
             <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Interface Language</Label>
                   <select className="w-full rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 focus:ring-primary/20 appearance-none outline-none">
                      <option value="en">English (US/UK) • Default</option>
                      <option value="zh">中文 (Mandarin) • Optimized</option>
                      <option value="ms">Bahasa Melayu</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">System Timezone</Label>
                   <select className="w-full rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 focus:ring-primary/20 appearance-none outline-none">
                      <option value="sg">Asia / Singapore (GMT+8)</option>
                      <option value="id">Asia / Jakarta (GMT+7)</option>
                   </select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50 transition-all hover:bg-muted/30">
                   <div className="space-y-0.5">
                      <p className="text-sm font-bold">Auto-Sync Health</p>
                      <p className="text-[10px] text-muted-foreground italic">Keep telemetry data active in background</p>
                   </div>
                   <Switch defaultChecked />
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </PageContainer>
  );
}
