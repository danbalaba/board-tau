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
  const [formData, setFormData] = useState({
    siteName: 'BoardTAU',
    siteDescription: 'Find your perfect boarding house experience',
    contactEmail: 'support@boardtau.com',
    contactPhone: '+1 (555) 123-4567',
    address: '',
    enableEmailNotifications: true,
    enablePushNotifications: false,
    enableAnalytics: true,
    enableCookies: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings/general');
        const result = await response.json();
        if (result.success) {
          setFormData(result.data);
        }
      } catch (error) {
        toast.error('Failed to load settings from database');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleToggle = (id: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Configuration update deployed successfully.');
      } else {
        toast.error(result.message || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('An error occurred during deployment');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Synchronizing platform configuration...</p>
      </div>
    );
  }

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
                <Label htmlFor="siteName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">App Handle</Label>
                <Input id="siteName" value={formData.siteName} onChange={handleChange} placeholder="BoardTAU" className="h-11 bg-white/5 border-white/10" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="siteDescription" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Description</Label>
                <Textarea
                  id="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  placeholder="Platform elevator pitch"
                  rows={3}
                  className="bg-white/5 border-white/10 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ops Email</Label>
                  <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} className="h-11 bg-white/5 border-white/10" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="contactPhone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Support Line</Label>
                  <Input id="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} className="h-11 bg-white/5 border-white/10" />
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
                <CardTitle className="text-lg">Communication & Privacy</CardTitle>
                <CardDescription>Global notification systems and data policies</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 mt-4">
              {[
                { id: 'enableEmailNotifications', label: 'Email Alerts', desc: 'Send transaction and account emails' },
                { id: 'enablePushNotifications', label: 'Push Notifications', desc: 'Enable browser-based push notifications' },
                { id: 'enableAnalytics', label: 'Usage Analytics', desc: 'Collect anonymous performance metrics' },
                { id: 'enableCookies', label: 'Cookie Consent', desc: 'Show cookie banner to new visitors' }
              ].map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-muted/30">
                  <div className="space-y-0.5">
                    <Label htmlFor={flag.id} className="text-sm font-bold tracking-tight cursor-pointer">{flag.label}</Label>
                    <p className="text-xs text-muted-foreground italic">{flag.desc}</p>
                  </div>
                  <Switch 
                    id={flag.id} 
                    checked={formData[flag.id as keyof typeof formData] as boolean} 
                    onCheckedChange={(checked) => handleToggle(flag.id, checked)}
                    className="data-[state=checked]:bg-emerald-500" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Business Context */}
          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <IconShieldLock className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Business & Compliance</CardTitle>
                <CardDescription>Legal and operational address information</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Physical Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter business address..."
                  rows={2}
                  className="bg-white/5 border-white/10 resize-none"
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
            <Button variant="ghost" type="button" onClick={() => window.location.reload()} className="font-bold uppercase tracking-widest text-muted-foreground">Reset</Button>
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
