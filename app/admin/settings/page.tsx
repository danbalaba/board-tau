'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Switch } from '@/app/admin/components/ui/switch';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Save, Globe, Mail, Shield, Bell, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GeneralSettings() {
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    enableEmailNotifications: true,
    enablePushNotifications: false,
    enableAnalytics: true,
    enableCookies: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/general');
      const result = await response.json();
      if (result.success) {
        setFormData(result.data);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(result.message || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Retrieving platform configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">General Settings</h1>
          <p className="text-muted-foreground">Manage your platform's core identity and communication preferences</p>
        </div>
        <div className="flex items-center space-x-2">
           <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-6 h-10 font-bold uppercase tracking-widest text-[10px]">
             {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
             Save Changes
           </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Site Identity
              </CardTitle>
              <CardDescription>How your platform appears to users and search engines</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Name</Label>
                <Input
                  id="siteName"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  placeholder="e.g. BoardTAU"
                  className="bg-transparent focus-visible:ring-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-xs font-bold uppercase tracking-wider text-slate-500">Slogan / Description</Label>
                <Input
                  id="siteDescription"
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  placeholder="e.g. Your Ultimate Destination Connection"
                  className="bg-transparent focus-visible:ring-primary h-11"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Contact Details
              </CardTitle>
              <CardDescription>Public contact information for user inquiries</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-wider text-slate-500">Support Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="support@example.com"
                    className="bg-transparent focus-visible:ring-primary h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Support Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="bg-transparent focus-visible:ring-primary h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-500">Physical Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Enter business address..."
                  rows={3}
                  className="bg-transparent focus-visible:ring-primary resize-none p-3"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Communication Channels
              </CardTitle>
              <CardDescription>Toggle global notification systems</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-0">
              <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">Send transaction and account emails</p>
                </div>
                <Switch
                  checked={formData.enableEmailNotifications}
                  onCheckedChange={(checked) => handleToggle('enableEmailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Enable browser-based push notifications</p>
                </div>
                <Switch
                  checked={formData.enablePushNotifications}
                  onCheckedChange={(checked) => handleToggle('enablePushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Privacy & Data
              </CardTitle>
              <CardDescription>Manage user tracking and data collection</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-0">
              <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Usage Analytics</Label>
                  <p className="text-xs text-muted-foreground">Collect anonymous performance metrics</p>
                </div>
                <Switch
                  checked={formData.enableAnalytics}
                  onCheckedChange={(checked) => handleToggle('enableAnalytics', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Cookie Consent</Label>
                  <p className="text-xs text-muted-foreground">Show cookie banner to new visitors</p>
                </div>
                <Switch
                  checked={formData.enableCookies}
                  onCheckedChange={(checked) => handleToggle('enableCookies', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 flex items-start gap-4">
             <div className="p-2 bg-primary/10 rounded-full">
               <CheckCircle2 className="w-5 h-5 text-primary" />
             </div>
             <div>
                <p className="text-sm font-bold text-primary uppercase tracking-widest text-[10px]">Database Status: Synchronized</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                   Changes made here are updated instantly in the MongoDB settings collection and reflect across the entire platform.
                </p>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
}
