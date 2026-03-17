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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';

export function GeneralSettings() {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save operation
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
          <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
            <CardDescription>Basic platform details and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input id="platformName" placeholder="BoardTAU" defaultValue="BoardTAU" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformDescription">Platform Description</Label>
              <Textarea
                id="platformDescription"
                placeholder="Short description of your platform"
                defaultValue="Find your perfect boarding house experience"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" placeholder="support@example.com" defaultValue="support@boardtau.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" type="tel" placeholder="+1 (555) 123-4567" defaultValue="+1 (555) 123-4567" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core Features</CardTitle>
            <CardDescription>Enable or disable key platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowNewSignups">Allow New Signups</Label>
                <p className="text-sm text-muted-foreground">Let new users create accounts</p>
              </div>
              <Switch id="allowNewSignups" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowHostApplications">Allow Host Applications</Label>
                <p className="text-sm text-muted-foreground">Accept applications from potential hosts</p>
              </div>
              <Switch id="allowHostApplications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableReviews">Enable Reviews</Label>
                <p className="text-sm text-muted-foreground">Allow users to leave reviews and ratings</p>
              </div>
              <Switch id="enableReviews" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enablePayments">Enable Payments</Label>
                <p className="text-sm text-muted-foreground">Process payments through the platform</p>
              </div>
              <Switch id="enablePayments" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Moderation</CardTitle>
            <CardDescription>Configure content moderation settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="autoApproveListings">Auto-Approve Listings</Label>
              <Select defaultValue="manual">
                <SelectTrigger id="autoApproveListings">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Approval</SelectItem>
                  <SelectItem value="auto">Auto-Approve</SelectItem>
                  <SelectItem value="verified">Auto-Approve Verified Hosts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose whether listings should be automatically approved or require manual review
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewThreshold">Review Threshold</Label>
              <Input id="reviewThreshold" type="number" defaultValue={3} min={1} max={10} />
              <p className="text-sm text-muted-foreground">
                Number of flagged reports before content is automatically removed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="moderationEmail">Moderation Email</Label>
              <Input id="moderationEmail" type="email" placeholder="moderation@example.com" defaultValue="moderation@boardtau.com" />
              <p className="text-sm text-muted-foreground">
                Email address to receive moderation notifications
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support Settings</CardTitle>
            <CardDescription>Configure support and communication preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input id="supportEmail" type="email" placeholder="support@example.com" defaultValue="support@boardtau.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input id="supportPhone" type="tel" placeholder="+1 (555) 123-4567" defaultValue="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportHours">Support Hours</Label>
              <Textarea
                id="supportHours"
                placeholder="e.g., Monday-Friday, 9am-5pm"
                defaultValue="Monday-Friday, 9am-5pm EST"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faqUrl">FAQ URL</Label>
              <Input id="faqUrl" type="url" placeholder="https://example.com/faq" defaultValue="https://boardtau.com/faq" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-4">
          <div>
            {saveSuccess && (
              <p className="text-sm text-green-600">Settings saved successfully!</p>
            )}
          </div>
          <Button type="submit" disabled={saveSuccess}>
            {saveSuccess ? 'Saved' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
