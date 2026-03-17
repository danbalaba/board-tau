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
import { Switch } from '@/app/admin/components/ui/switch';
import { Label } from '@/app/admin/components/ui/label';
import { Input } from '@/app/admin/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Slider } from '@/app/admin/components/ui/slider';

export function SecuritySettings() {
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
          <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
          <p className="text-muted-foreground">Configure security and compliance settings</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Configure authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require users to use two-factor authentication</p>
              </div>
              <Switch id="twoFactorAuth" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="passwordExpiry">Password Expiry</Label>
                <p className="text-sm text-muted-foreground">Enable password expiration</p>
              </div>
              <Switch id="passwordExpiry" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordExpiryDays">Password Expiry Days</Label>
              <Select>
                <SelectTrigger id="passwordExpiryDays">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Policies</CardTitle>
            <CardDescription>Configure password complexity requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                <p className="text-sm text-muted-foreground">Require minimum password length</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input type="number" id="minPasswordLength" defaultValue="8" className="w-16" />
                <span className="text-sm text-muted-foreground">characters</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireUppercase">Uppercase Letter</Label>
                <p className="text-sm text-muted-foreground">Require at least one uppercase letter</p>
              </div>
              <Switch id="requireUppercase" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireLowercase">Lowercase Letter</Label>
                <p className="text-sm text-muted-foreground">Require at least one lowercase letter</p>
              </div>
              <Switch id="requireLowercase" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireNumber">Number</Label>
                <p className="text-sm text-muted-foreground">Require at least one number</p>
              </div>
              <Switch id="requireNumber" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireSpecial">Special Character</Label>
                <p className="text-sm text-muted-foreground">Require at least one special character</p>
              </div>
              <Switch id="requireSpecial" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>Configure session settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout</Label>
              <Select>
                <SelectTrigger id="sessionTimeout">
                  <SelectValue placeholder="Select timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sessionIdleTimeout">Idle Timeout</Label>
                <p className="text-sm text-muted-foreground">End sessions after period of inactivity</p>
              </div>
              <Switch id="sessionIdleTimeout" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>Configure compliance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="gdprCompliance">GDPR Compliance</Label>
                <p className="text-sm text-muted-foreground">Enable GDPR compliance features</p>
              </div>
              <Switch id="gdprCompliance" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ccpaCompliance">CCPA Compliance</Label>
                <p className="text-sm text-muted-foreground">Enable CCPA compliance features</p>
              </div>
              <Switch id="ccpaCompliance" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dataRetention">Data Retention Policy</Label>
                <p className="text-sm text-muted-foreground">Enable data retention policy</p>
              </div>
              <Switch id="dataRetention" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataRetentionDays">Data Retention Period</Label>
              <Select>
                <SelectTrigger id="dataRetentionDays">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="730">2 years</SelectItem>
                  <SelectItem value="1095">3 years</SelectItem>
                  <SelectItem value="1825">5 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log Settings</CardTitle>
            <CardDescription>Configure audit log settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auditLogging">Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Enable audit logging of system events</p>
              </div>
              <Switch id="auditLogging" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logRetention">Log Retention Period</Label>
              <Select>
                <SelectTrigger id="logRetention">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
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
