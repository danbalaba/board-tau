'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Badge } from '@/app/admin/components/ui/badge';
import {
  IconMail,
  IconEdit,
  IconSend,
  IconCircleCheck,
  IconUserPlus,
  IconCalendarCheck,
  IconCalendarX,
  IconLock,
  IconHome,
  IconBell,
  IconVariable,
  IconDeviceFloppy
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  enabled: boolean;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const initialTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    description: 'Sent to new users upon successful registration',
    subject: 'Welcome to BoardTAU!',
    body: `Hi {{firstName}},\n\nWelcome to BoardTAU! We're excited to help you find your perfect boarding house.\n\nHere are some things you can do:\n- Browse properties in your desired location\n- Create a profile to save your favorite listings\n- Contact hosts directly\n\nIf you need any help, please don't hesitate to reach out to our support team.\n\nBest regards,\nThe BoardTAU Team`,
    enabled: true,
    icon: IconUserPlus,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: '2',
    name: 'Booking Confirmation',
    description: 'Sent when a booking is confirmed by the host',
    subject: 'Your booking has been confirmed!',
    body: `Hi {{firstName}},\n\nGreat news! Your booking at {{propertyName}} has been confirmed.\n\nBooking details:\n- Check-in: {{checkInDate}}\n- Check-out: {{checkOutDate}}\n- Host: {{hostName}}\n\nWe hope you enjoy your stay!\n\nBest regards,\nThe BoardTAU Team`,
    enabled: true,
    icon: IconCalendarCheck,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    id: '3',
    name: 'Cancellation Notification',
    description: 'Sent when a booking is cancelled',
    subject: 'Your booking has been cancelled',
    body: `Hi {{firstName}},\n\nWe regret to inform you that your booking at {{propertyName}} has been cancelled.\n\nA full refund will be processed within 3-5 business days.\n\nBest regards,\nThe BoardTAU Team`,
    enabled: true,
    icon: IconCalendarX,
    color: 'text-red-500',
    bg: 'bg-red-500/10'
  },
  {
    id: '4',
    name: 'Password Reset',
    description: 'Sent when a user requests a password reset',
    subject: 'Reset your BoardTAU password',
    body: `Hi {{firstName}},\n\nWe received a request to reset your password.\n\nReset link: {{resetPasswordLink}}\n\nThis link expires in 24 hours. If you didn't request this, ignore this email.\n\nBest regards,\nThe BoardTAU Team`,
    enabled: true,
    icon: IconLock,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  {
    id: '5',
    name: 'Host Application Approved',
    description: 'Sent when a host application is approved',
    subject: 'Your host application has been approved!',
    body: `Hi {{firstName}},\n\nGreat news! Your application to become a host on BoardTAU has been approved.\n\nYou can now start creating property listings and managing your bookings.\n\nBest regards,\nThe BoardTAU Team`,
    enabled: true,
    icon: IconHome,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  }
];

const VARIABLES = ['{{firstName}}', '{{lastName}}', '{{email}}', '{{propertyName}}', '{{hostName}}', '{{checkInDate}}', '{{checkOutDate}}', '{{resetPasswordLink}}'];

export function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedId, setSelectedId] = useState<string>(initialTemplates[0].id);
  const [saving, setSaving] = useState(false);

  const currentTemplate = templates.find(t => t.id === selectedId)!;

  const handleToggle = (id: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`"${currentTemplate.name}" transmission protocol synchronized.`);
    }, 1200);
  };

  const handleSubjectChange = (value: string) => {
    setTemplates(templates.map(t => t.id === selectedId ? { ...t, subject: value } : t));
  };

  const handleBodyChange = (value: string) => {
    setTemplates(templates.map(t => t.id === selectedId ? { ...t, body: value } : t));
  };

  return (
    <PageContainer
      pageTitle="Transmission Templates"
      pageDescription="Configure and deploy automated email notification protocols for all platform events"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[9px] h-5 px-2">
            {templates.filter(t => t.enabled).length}/{templates.length} Active
          </Badge>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest" onClick={handleSave} disabled={saving}>
            {saving ? <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IconSend className="w-4 h-4" />}
            {saving ? 'Syncing...' : 'Deploy Changes'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Template Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          {templates.map((template, i) => {
            const Icon = template.icon;
            const isSelected = selectedId === template.id;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div
                  onClick={() => setSelectedId(template.id)}
                  className={cn(
                    'group relative w-full rounded-2xl p-4 border cursor-pointer transition-all',
                    isSelected
                      ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
                      : 'bg-card/20 border-white/5 hover:bg-card/30 hover:border-white/10 backdrop-blur-md'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('rounded-xl p-2 shrink-0 transition-transform group-hover:scale-110', template.enabled ? template.bg : 'bg-white/5')}>
                        <Icon className={cn('h-4 w-4', template.enabled ? template.color : 'text-muted-foreground/30')} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black tracking-tight truncate">{template.name}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 truncate">{template.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={template.enabled}
                      onCheckedChange={() => handleToggle(template.id)}
                      className="shrink-0 data-[state=checked]:bg-emerald-500 scale-75"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary rounded-full" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
                <CardHeader className="flex flex-row items-center gap-4 pb-6 border-b border-white/5">
                  <div className={cn('rounded-xl p-2.5 shrink-0', currentTemplate.bg)}>
                    <currentTemplate.icon className={cn('h-5 w-5', currentTemplate.color)} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black tracking-tight">{currentTemplate.name}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest">{currentTemplate.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="emailSubject" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Subject Line</Label>
                      <Input
                        id="emailSubject"
                        value={currentTemplate.subject}
                        onChange={e => handleSubjectChange(e.target.value)}
                        className="bg-white/5 border-white/10 h-11 font-bold"
                        placeholder="Email subject"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailBody" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Message Body</Label>
                      <Textarea
                        id="emailBody"
                        className="min-h-[280px] font-mono text-sm bg-white/5 border-white/10 resize-none"
                        value={currentTemplate.body}
                        onChange={e => handleBodyChange(e.target.value)}
                        placeholder="Email body"
                      />
                    </div>

                    {/* Variables */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconVariable className="w-4 h-4 text-muted-foreground/40" />
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Available Dynamic Variables</Label>
                      </div>
                      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                        {VARIABLES.map(v => (
                          <code
                            key={v}
                            className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => handleBodyChange(currentTemplate.body + v)}
                          >
                            {v}
                          </code>
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Click any variable to append it to the message body</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <Button type="submit" className="gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest" disabled={saving}>
                        {saving
                          ? <><div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Syncing</>
                          : <><IconDeviceFloppy className="w-4 h-4" /> Save Template</>
                        }
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Global Email Config */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl mt-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <IconMail className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-black tracking-tight">Global Transmission Config</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailFrom" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sender Address</Label>
                  <Input id="emailFrom" type="email" defaultValue="no-reply@boardtau.com" className="bg-white/5 border-white/10 h-10 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailFromName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sender Name</Label>
                  <Input id="emailFromName" type="text" defaultValue="BoardTAU" className="bg-white/5 border-white/10 h-10 font-bold" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 group">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Global Notifications</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">Master kill-switch for all emails</p>
                </div>
                <Switch id="emailNotifications" defaultChecked className="data-[state=checked]:bg-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  );
}
