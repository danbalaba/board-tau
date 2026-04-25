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
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Badge } from '@/app/admin/components/ui/badge';
import {
  IconBrandStripe,
  IconBrandPaypal,
  IconReceipt,
  IconPercentage,
  IconCash,
  IconCalendarTime,
  IconKey,
  IconEye,
  IconEyeOff,
  IconDeviceFloppy,
  IconCloudUpload,
  IconShieldCheck
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';
import { toast } from 'sonner';

export function PaymentSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Commerce configuration deployed successfully.');
    }, 1200);
  };

  const sections = [
    {
      title: 'Payment Gateway Matrix',
      description: 'Configure active payment processor integrations',
      icon: IconBrandStripe,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      content: (
        <div className="space-y-5">
          {/* Stripe */}
          <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconBrandStripe className="w-5 h-5 text-[#635bff]" />
                <div>
                  <p className="text-sm font-black tracking-tight">Stripe</p>
                  <p className="text-[10px] text-muted-foreground/50 italic">Primary payment processor</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[9px] h-4 px-1.5">Connected</Badge>
                <Switch id="stripeEnabled" defaultChecked className="data-[state=checked]:bg-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stripePublicKey" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Public Key</Label>
                <Input id="stripePublicKey" defaultValue="pk_test_1234567890abcdef" className="bg-black/20 border-white/10 h-10 font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stripeSecretKey" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Secret Key
                  <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="ml-2 text-muted-foreground/40 hover:text-primary transition-colors inline-flex items-center gap-1">
                    {showSecrets ? <IconEyeOff className="w-3 h-3" /> : <IconEye className="w-3 h-3" />}
                  </button>
                </Label>
                <Input id="stripeSecretKey" type={showSecrets ? 'text' : 'password'} defaultValue="sk_test_1234567890abcdef" className="bg-black/20 border-white/10 h-10 font-mono text-xs" />
              </div>
            </div>
          </div>

          {/* PayPal */}
          <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconBrandPaypal className="w-5 h-5 text-[#00457C]" />
                <div>
                  <p className="text-sm font-black tracking-tight">PayPal</p>
                  <p className="text-[10px] text-muted-foreground/50 italic">Secondary payment processor</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-none font-black uppercase text-[9px] h-4 px-1.5">Inactive</Badge>
                <Switch id="paypalEnabled" className="data-[state=checked]:bg-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 opacity-50">
              <div className="space-y-1.5">
                <Label htmlFor="paypalClientId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Client ID</Label>
                <Input id="paypalClientId" placeholder="AeB1c2d3E4F5g6H7..." className="bg-black/20 border-white/10 h-10 font-mono text-xs" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paypalClientSecret" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Client Secret</Label>
                <Input id="paypalClientSecret" type="password" placeholder="AaBbCcDd..." className="bg-black/20 border-white/10 h-10 font-mono text-xs" disabled />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Tax & Compliance Engine',
      description: 'Automated tax calculation, rates, and regional jurisdiction rules',
      icon: IconReceipt,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <div>
              <Label htmlFor="taxCalculation" className="text-sm font-black tracking-tight cursor-pointer">Auto-Tax Calculation</Label>
              <p className="text-[11px] text-muted-foreground/60">Let the engine compute regional taxes automatically</p>
            </div>
            <Switch id="taxCalculation" defaultChecked className="data-[state=checked]:bg-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxProvider" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tax Provider</Label>
            <Select defaultValue="stripe">
              <SelectTrigger id="taxProvider" className="bg-white/5 border-white/10 h-11 font-bold uppercase text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                <SelectItem value="stripe" className="text-xs font-bold uppercase">Stripe Tax</SelectItem>
                <SelectItem value="taxjar" className="text-xs font-bold uppercase">TaxJar</SelectItem>
                <SelectItem value="avatax" className="text-xs font-bold uppercase">Avalara AvaTax</SelectItem>
                <SelectItem value="manual" className="text-xs font-bold uppercase">Manual Configuration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="defaultTaxRate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Default Rate (%)</Label>
              <Input id="defaultTaxRate" type="number" step="0.01" defaultValue="8.5" className="bg-white/5 border-white/10 h-10 font-bold" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
              <Label htmlFor="taxInclusive" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Tax-Inclusive</Label>
              <Switch id="taxInclusive" defaultChecked className="data-[state=checked]:bg-emerald-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxRegions" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Active Jurisdictions</Label>
            <Textarea
              id="taxRegions"
              className="bg-white/5 border-white/10 resize-none font-bold text-sm h-28"
              defaultValue={`Singapore\nMalaysia\nIndonesia\nThailand\nPhilippines\nVietnam`}
            />
          </div>
        </div>
      )
    },
    {
      title: 'Commission Architecture',
      description: 'Revenue share, service fees, and cancellation penalty rules',
      icon: IconPercentage,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      content: (
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'hostCommissionRate', label: 'Host Commission Rate', desc: 'Percentage of booking value charged to hosts', defaultValue: '10', suffix: '%' },
            { id: 'guestServiceFee', label: 'Guest Service Fee', desc: 'Percentage of booking value charged to guests', defaultValue: '5', suffix: '%' },
            { id: 'minimumBookingFee', label: 'Minimum Booking Fee', desc: 'Floor fee regardless of booking amount', defaultValue: '5', suffix: 'SGD' },
            { id: 'cancellationFeePercentage', label: 'Cancellation Penalty', desc: 'Percentage of booking amount forfeited on cancellation', defaultValue: '50', suffix: '%' }
          ].map(({ id, label, desc, defaultValue, suffix }) => (
            <div key={id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-black tracking-tight">{label}</p>
                <p className="text-[10px] text-muted-foreground/50 italic">{desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Input id={id} type="number" step="0.01" defaultValue={defaultValue} className="w-20 h-10 bg-black/20 border-white/10 text-center font-black" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 w-8">{suffix}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <div>
              <Label htmlFor="cancellationFee" className="text-sm font-black tracking-tight cursor-pointer">Enforce Cancellation Fee</Label>
              <p className="text-[10px] text-muted-foreground/60">Apply penalty fee to all cancellations</p>
            </div>
            <Switch id="cancellationFee" defaultChecked className="data-[state=checked]:bg-emerald-500" />
          </div>
        </div>
      )
    },
    {
      title: 'Payout Dispatch',
      description: 'Host settlement schedule, delay windows, and notification rules',
      icon: IconCash,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="payoutSchedule" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Settlement Schedule</Label>
            <Select defaultValue="weekly">
              <SelectTrigger id="payoutSchedule" className="bg-white/5 border-white/10 h-11 font-bold uppercase text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                <SelectItem value="instant" className="text-xs font-bold uppercase">Instant</SelectItem>
                <SelectItem value="daily" className="text-xs font-bold uppercase">Daily</SelectItem>
                <SelectItem value="weekly" className="text-xs font-bold uppercase">Weekly</SelectItem>
                <SelectItem value="biweekly" className="text-xs font-bold uppercase">Bi-Weekly</SelectItem>
                <SelectItem value="monthly" className="text-xs font-bold uppercase">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <div>
              <p className="text-sm font-black tracking-tight">Post-Checkin Delay</p>
              <p className="text-[10px] text-muted-foreground/50">Days after check-in to release funds</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input id="payoutDelay" type="number" defaultValue={3} className="w-16 h-10 bg-black/20 border-white/10 text-center font-black" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">days</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <div>
              <Label htmlFor="payoutNotifications" className="text-sm font-black tracking-tight cursor-pointer">Payout Alert System</Label>
              <p className="text-[10px] text-muted-foreground/60">Notify hosts via email on every payout event</p>
            </div>
            <Switch id="payoutNotifications" defaultChecked className="data-[state=checked]:bg-emerald-500" />
          </div>
        </div>
      )
    }
  ];

  return (
    <PageContainer
      pageTitle="Commerce & Revenue Engine"
      pageDescription="Payment gateways, tax compliance, commission structures, and host payout configuration"
      pageHeaderAction={
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[9px] h-5 px-2">
          <IconShieldCheck className="w-3 h-3 mr-1" />
          PCI DSS Compliant
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <IconCloudUpload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight">Commerce Configuration Staging</p>
              <p className="text-[10px] text-muted-foreground/50">Deploying will affect all active transactions in-flight.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" type="button" className="font-black uppercase tracking-widest text-xs text-muted-foreground">Cancel</Button>
            <Button type="submit" disabled={isSaving} className="h-11 px-8 gap-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
              {isSaving ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deploying...</> : <><IconDeviceFloppy className="h-4 w-4" /> Deploy Config</>}
            </Button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
