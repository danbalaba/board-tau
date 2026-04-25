'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Switch } from '@/app/admin/components/ui/switch';
import { Label } from '@/app/admin/components/ui/label';
import { Input } from '@/app/admin/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Badge } from '@/app/admin/components/ui/badge';
import {
  IconShieldLock,
  IconKey,
  IconClockHour4,
  IconCheckbox,
  IconDatabase,
  IconAlertTriangle,
  IconCircleCheck,
  IconDeviceFloppy,
  IconCloudUpload
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';
import { toast } from 'sonner';

const Toggle = ({
  id,
  label,
  description,
  defaultChecked = false,
  danger = false
}: {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
  danger?: boolean;
}) => (
  <div className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
    <div className="space-y-0.5 min-w-0 pr-4">
      <Label htmlFor={id} className={cn('text-sm font-black tracking-tight cursor-pointer', danger && 'text-red-400')}>{label}</Label>
      <p className="text-[11px] text-muted-foreground/60 italic">{description}</p>
    </div>
    <Switch
      id={id}
      defaultChecked={defaultChecked}
      className={cn('shrink-0', danger ? 'data-[state=checked]:bg-red-500' : 'data-[state=checked]:bg-emerald-500')}
    />
  </div>
);

export function SecuritySettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Security posture deployed successfully.');
    }, 1200);
  };

  const sections = [
    {
      title: 'Authentication Fortress',
      description: 'Multi-factor credentials and session token policies',
      icon: IconKey,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      content: (
        <div className="space-y-3">
          <Toggle id="twoFactorAuth" label="2FA Enforcement" description="Require all users to complete two-factor authentication" defaultChecked />
          <Toggle id="passwordExpiry" label="Credential Rotation" description="Force periodic password expiration cycles" defaultChecked />
          <div className="space-y-2 pt-2">
            <Label htmlFor="passwordExpiryDays" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Rotation Interval</Label>
            <Select defaultValue="90">
              <SelectTrigger id="passwordExpiryDays" className="bg-white/5 border-white/10 h-11 font-bold uppercase text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                <SelectItem value="30" className="text-xs font-bold uppercase">Every 30 days</SelectItem>
                <SelectItem value="60" className="text-xs font-bold uppercase">Every 60 days</SelectItem>
                <SelectItem value="90" className="text-xs font-bold uppercase">Every 90 days</SelectItem>
                <SelectItem value="180" className="text-xs font-bold uppercase">Every 180 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: 'Password Complexity Matrix',
      description: 'Minimum character requirements and composition rules',
      icon: IconShieldLock,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
            <div>
              <Label htmlFor="minPasswordLength" className="text-sm font-black tracking-tight cursor-pointer">Minimum Character Count</Label>
              <p className="text-[11px] text-muted-foreground/60 italic">Absolute minimum password length</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input type="number" id="minPasswordLength" defaultValue={8} className="w-20 h-10 bg-white/5 border-white/10 text-center font-black text-lg" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">chars</span>
            </div>
          </div>
          <Toggle id="requireUppercase" label="Uppercase Required" description="At least one uppercase letter (A-Z)" defaultChecked />
          <Toggle id="requireLowercase" label="Lowercase Required" description="At least one lowercase letter (a-z)" defaultChecked />
          <Toggle id="requireNumber" label="Numeric Required" description="At least one digit (0-9)" defaultChecked />
          <Toggle id="requireSpecial" label="Symbol Required" description="At least one special character (!@#$%)" defaultChecked />
        </div>
      )
    },
    {
      title: 'Session Command Center',
      description: 'Token TTL and idle-state termination policies',
      icon: IconClockHour4,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      content: (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Session TTL</Label>
            <Select defaultValue="60">
              <SelectTrigger id="sessionTimeout" className="bg-white/5 border-white/10 h-11 font-bold uppercase text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                <SelectItem value="15" className="text-xs font-bold uppercase">15 minutes</SelectItem>
                <SelectItem value="30" className="text-xs font-bold uppercase">30 minutes</SelectItem>
                <SelectItem value="60" className="text-xs font-bold uppercase">1 hour</SelectItem>
                <SelectItem value="120" className="text-xs font-bold uppercase">2 hours</SelectItem>
                <SelectItem value="240" className="text-xs font-bold uppercase">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Toggle id="sessionIdleTimeout" label="Idle Termination" description="Terminate sessions after a period of inactivity" defaultChecked />
        </div>
      )
    },
    {
      title: 'Compliance Protocols',
      description: 'GDPR, CCPA, and data sovereignty governance',
      icon: IconCheckbox,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      content: (
        <div className="space-y-3">
          <Toggle id="gdprCompliance" label="GDPR Enforcement" description="Activate EU General Data Protection Regulation compliance suite" defaultChecked />
          <Toggle id="ccpaCompliance" label="CCPA Enforcement" description="Activate California Consumer Privacy Act compliance suite" defaultChecked />
          <Toggle id="dataRetention" label="Data Retention Policy" description="Enable automatic data archival and purge cycles" defaultChecked />
          <div className="space-y-2 pt-2">
            <Label htmlFor="dataRetentionDays" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Retention Window</Label>
            <Select defaultValue="365">
              <SelectTrigger id="dataRetentionDays" className="bg-white/5 border-white/10 h-11 font-bold uppercase text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                <SelectItem value="365" className="text-xs font-bold uppercase">1 year</SelectItem>
                <SelectItem value="730" className="text-xs font-bold uppercase">2 years</SelectItem>
                <SelectItem value="1095" className="text-xs font-bold uppercase">3 years</SelectItem>
                <SelectItem value="1825" className="text-xs font-bold uppercase">5 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: 'Audit Log Infrastructure',
      description: 'Immutable event trail retention and log management',
      icon: IconDatabase,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      content: (
        <div className="space-y-3">
          <Toggle id="auditLogging" label="Audit Trail Active" description="Record all system events to the immutable audit ledger" defaultChecked />
          <div className="space-y-2 pt-2">
            <Label htmlFor="logRetention" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Log Retention Period</Label>
            <Select defaultValue="90">
              <SelectTrigger id="logRetention" className="bg-white/5 border-white/10 h-11 font-bold uppercase text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                <SelectItem value="7" className="text-xs font-bold uppercase">7 days</SelectItem>
                <SelectItem value="30" className="text-xs font-bold uppercase">30 days</SelectItem>
                <SelectItem value="90" className="text-xs font-bold uppercase">90 days</SelectItem>
                <SelectItem value="365" className="text-xs font-bold uppercase">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }
  ];

  return (
    <PageContainer
      pageTitle="Security Command Center"
      pageDescription="Authentication hardening, compliance enforcement, and threat mitigation protocols"
      pageHeaderAction={
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[9px] h-5 px-2">
          ● Posture: Strong
        </Badge>
      }
    >
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full border-none bg-card/30 backdrop-blur-md shadow-xl">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b border-white/5">
                    <div className={cn('p-2.5 rounded-xl shrink-0', section.bg)}>
                      <Icon className={cn('h-5 w-5', section.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black tracking-tight">{section.title}</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest">{section.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {section.content}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-0 z-50 flex items-center justify-between rounded-2xl border border-primary/20 bg-background/80 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <IconCloudUpload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight">Security Configuration Staging</p>
              <p className="text-[10px] text-muted-foreground/50">Changes will be applied to all active user sessions immediately.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" type="button" className="font-black uppercase tracking-widest text-xs text-muted-foreground">Cancel</Button>
            <Button type="submit" disabled={isSaving} className="h-11 px-8 gap-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
              {isSaving ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deploying...</> : <><IconDeviceFloppy className="h-4 w-4" /> Deploy Posture</>}
            </Button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
