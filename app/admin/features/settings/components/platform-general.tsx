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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/app/admin/components/ui/select';
import {
  IconSettings,
  IconCircleCheck,
  IconDeviceLaptop,
  IconShieldLock,
  IconLifebuoy,
  IconDeviceFloppy,
  IconCircleX,
  IconCloudUpload
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from 'sonner';

export function GeneralSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configuration update deployed successfully.');
    }, 1200);
  };

  return (
    <PageContainer
      pageTitle="Platform Configuration"
      pageDescription="Global environment variables, deployment settings and infrastructure defaults"
    >
      <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Platform Identity */}
          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconDeviceLaptop className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">System Identity</CardTitle>
                <CardDescription>Branding and public-facing platform metadata</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="platformName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">App Handle</Label>
              <Input id="platformName" placeholder="BoardTAU" defaultValue="BoardTAU" className="h-11 bg-white/5 border-white/10" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="platformDescription" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Description</Label>
                <Textarea
                  id="platformDescription"
                  placeholder="Platform elevator pitch"
                  defaultValue="Find your perfect boarding house experience"
                  rows={3}
                  className="bg-white/5 border-white/10 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ops Email</Label>
                  <Input id="contactEmail" type="email" defaultValue="support@boardtau.com" className="h-11 bg-white/5 border-white/10" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="contactPhone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Support Line</Label>
                  <Input id="contactPhone" type="tel" defaultValue="+1 (555) 123-4567" className="h-11 bg-white/5 border-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <IconSettings className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Module Governance</CardTitle>
                <CardDescription>Runtime feature flags and global accessibility</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 mt-4">
              {[
                { id: 'allowNewSignups', label: 'User Registration', desc: 'Enable public account creation' },
                { id: 'allowHostApplications', label: 'Host Onboarding', desc: 'Accept new partner applications' },
                { id: 'enableReviews', label: 'Reputation System', desc: 'Allow peer-to- peer reviews' },
                { id: 'enablePayments', label: 'Commerce Engine', desc: 'Authorize transaction processing' }
              ].map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-muted/30">
                  <div className="space-y-0.5">
                    <Label htmlFor={flag.id} className="text-sm font-bold tracking-tight cursor-pointer">{flag.label}</Label>
                    <p className="text-xs text-muted-foreground italic">{flag.desc}</p>
                  </div>
                  <Switch id={flag.id} defaultChecked className="data-[state=checked]:bg-emerald-500" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Moderation Controls */}
          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <IconShieldLock className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Security & Moderation</CardTitle>
                <CardDescription>Threat detection and content gatekeeping</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="autoApproveListings" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Approval Protocol</Label>
                <Select defaultValue="manual">
                  <SelectTrigger id="autoApproveListings" className="h-11 bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Verification Required</SelectItem>
                    <SelectItem value="auto">Total Autonomous Approval</SelectItem>
                    <SelectItem value="verified">Verified Hosts Exclusion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="reviewThreshold" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Triage Threshold</Label>
                  <Input id="reviewThreshold" type="number" defaultValue={3} className="h-11 bg-white/5 border-white/10" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="moderationEmail" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alert Destination</Label>
                  <Input id="moderationEmail" type="email" defaultValue="moderation@boardtau.com" className="h-11 bg-white/5 border-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Architecture */}
          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                <IconLifebuoy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Assistance & Support</CardTitle>
                <CardDescription>End-user success and documentation links</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="supportEmail" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Support Nexus</Label>
                  <Input id="supportEmail" type="email" defaultValue="support@boardtau.com" className="h-11 bg-white/5 border-white/10" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="faqUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Knowledge Base</Label>
                  <Input id="faqUrl" type="url" defaultValue="https://boardtau.com/faq" className="h-11 bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="supportHours" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Service Windows</Label>
                <Textarea
                  id="supportHours"
                  defaultValue="Monday-Friday, 9am-5pm EST"
                  rows={2}
                  className="bg-muted/30 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Save Action */}
        <div className="sticky bottom-0 z-50 flex items-center justify-between rounded-2xl border border-primary/20 bg-background/80 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
               <IconCloudUpload className="h-6 w-6" />
             </div>
             <div>
                <p className="text-sm font-black uppercase tracking-tight">Configuration Staging</p>
                <p className="text-xs text-muted-foreground">Deploying these changes will overwrite active environment variables.</p>
             </div>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" type="button" className="font-bold uppercase tracking-widest text-muted-foreground">Cancel</Button>
            <Button type="submit" disabled={isSaving} className="h-12 px-10 gap-2 font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              {isSaving ? <IconCircleCheck className="h-5 w-5 animate-bounce" /> : <IconDeviceFloppy className="h-5 w-5" />}
              {isSaving ? 'Deploying...' : 'Publish Changes'}
            </Button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
