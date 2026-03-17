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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Label } from '@/app/admin/components/ui/label';
import { Switch } from '@/app/admin/components/ui/switch';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  enabled: boolean;
}

const initialTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    description: 'Sent to new users when they sign up',
    subject: 'Welcome to BoardTAU!',
    body: 'Hi {{firstName}},\n\nWelcome to BoardTAU! We\'re excited to help you find your perfect boarding house.\n\nHere are some things you can do:\n- Browse properties in your desired location\n- Create a profile to save your favorite listings\n- Contact hosts directly\n\nIf you need any help, please don\'t hesitate to reach out to our support team.\n\nBest regards,\nThe BoardTAU Team',
    enabled: true
  },
  {
    id: '2',
    name: 'Booking Confirmation',
    description: 'Sent when a booking is confirmed',
    subject: 'Your booking has been confirmed!',
    body: 'Hi {{firstName}},\n\nGreat news! Your booking at {{propertyName}} has been confirmed.\n\nBooking details:\n- Check-in: {{checkInDate}}\n- Check-out: {{checkOutDate}}\n- Host: {{hostName}}\n\nWe hope you enjoy your stay! Please contact your host if you have any questions.\n\nBest regards,\nThe BoardTAU Team',
    enabled: true
  },
  {
    id: '3',
    name: 'Cancellation Notification',
    description: 'Sent when a booking is cancelled',
    subject: 'Your booking has been cancelled',
    body: 'Hi {{firstName}},\n\nWe regret to inform you that your booking at {{propertyName}} has been cancelled.\n\nBooking details:\n- Check-in: {{checkInDate}}\n- Check-out: {{checkOutDate}}\n- Host: {{hostName}}\n\nA full refund will be processed to your payment method within 3-5 business days.\n\nBest regards,\nThe BoardTAU Team',
    enabled: true
  },
  {
    id: '4',
    name: 'Password Reset',
    description: 'Sent when a user requests a password reset',
    subject: 'Reset your BoardTAU password',
    body: 'Hi {{firstName}},\n\nWe received a request to reset your password for your BoardTAU account.\n\nTo reset your password, please click the link below:\n{{resetPasswordLink}}\n\nThis link will expire in 24 hours.\n\nIf you didn\'t request a password reset, you can safely ignore this email.\n\nBest regards,\nThe BoardTAU Team',
    enabled: true
  },
  {
    id: '5',
    name: 'Host Application Approved',
    description: 'Sent when a host application is approved',
    subject: 'Your host application has been approved!',
    body: 'Hi {{firstName}},\n\nGreat news! Your application to become a host on BoardTAU has been approved.\n\nYou can now start:\n- Creating property listings\n- Setting your prices and availability\n- Managing your bookings\n\nPlease complete your host profile to get started.\n\nBest regards,\nThe BoardTAU Team',
    enabled: true
  }
];

export function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplates[0].id);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (id: string) => {
    setTemplates(templates.map(template =>
      template.id === id ? { ...template, enabled: !template.enabled } : template
    ));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save operation
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 500);
  };

  const handleSubjectChange = (value: string) => {
    setTemplates(templates.map(template =>
      template.id === selectedTemplate ? { ...template, subject: value } : template
    ));
  };

  const handleBodyChange = (value: string) => {
    setTemplates(templates.map(template =>
      template.id === selectedTemplate ? { ...template, body: value } : template
    ));
  };

  const currentTemplate = templates.find(template => template.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
          <p className="text-muted-foreground">Manage email templates for notifications and communications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className={selectedTemplate === template.id ? 'border-primary' : ''}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <Switch
                    id={`template-${template.id}`}
                    checked={template.enabled}
                    onCheckedChange={() => handleToggle(template.id)}
                  />
                </div>
                <CardDescription className="text-xs">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {selectedTemplate === template.id ? 'Editing' : 'Edit'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {currentTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Template: {currentTemplate.name}</CardTitle>
                <CardDescription>{currentTemplate.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailSubject">Subject</Label>
                    <input
                      id="emailSubject"
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={currentTemplate.subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      placeholder="Email subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailBody">Body</Label>
                    <Textarea
                      id="emailBody"
                      className="min-h-[300px] font-mono text-sm"
                      value={currentTemplate.body}
                      onChange={(e) => handleBodyChange(e.target.value)}
                      placeholder="Email body"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Available Variables</Label>
                    <div className="bg-gray-50 p-3 rounded-md text-sm font-mono">
                      {'{{firstName}}, {{lastName}}, {{email}}, {{propertyName}}, {{hostName}}, {{checkInDate}}, {{checkOutDate}}, {{resetPasswordLink}}'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use these variables in your email to personalize the content
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      {saveSuccess && (
                        <p className="text-sm text-green-600">Template saved successfully!</p>
                      )}
                    </div>
                    <Button type="submit" disabled={saveSuccess}>
                      {saveSuccess ? 'Saved' : 'Save Template'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Configure email delivery settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Enable or disable all email notifications</p>
            </div>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailFrom">From Email</Label>
            <input
              id="emailFrom"
              type="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="no-reply@example.com"
              defaultValue="no-reply@boardtau.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailFromName">From Name</Label>
            <input
              id="emailFromName"
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="BoardTAU"
              defaultValue="BoardTAU"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
