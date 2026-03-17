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

export function AccountSettings() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save operation
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate password change
    setTimeout(() => {
      setPasswordChanged(true);
      setTimeout(() => setPasswordChanged(false), 2000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-muted-foreground">Manage your account preferences and profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button type="button" variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, GIF or PNG. Max size 800K
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  defaultValue="Administrator User"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="admin@boardtau.com"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue="+65 1234 5678"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a little about yourself"
                  className="min-h-[100px]"
                  defaultValue="I'm an administrator for BoardTAU, managing the platform and ensuring everything runs smoothly."
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  {saveSuccess && (
                    <p className="text-sm text-green-600">Profile updated successfully!</p>
                  )}
                </div>
                <Button type="submit" disabled={saveSuccess}>
                  {saveSuccess ? 'Saved' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch id="emailNotifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
              </div>
              <Switch id="pushNotifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
              </div>
              <Switch id="smsNotifications" />
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Notification Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="securityAlerts" className="text-sm font-normal">Security Alerts</Label>
                    <Switch id="securityAlerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="systemUpdates" className="text-sm font-normal">System Updates</Label>
                    <Switch id="systemUpdates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="userActivity" className="text-sm font-normal">User Activity</Label>
                    <Switch id="userActivity" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="paymentNotifications" className="text-sm font-normal">Payment Notifications</Label>
                    <Switch id="paymentNotifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingEmails" className="text-sm font-normal">Marketing Emails</Label>
                    <Switch id="marketingEmails" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  {passwordChanged && (
                    <p className="text-sm text-green-600">Password changed successfully!</p>
                  )}
                </div>
                <Button type="submit" disabled={passwordChanged}>
                  {passwordChanged ? 'Changed' : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ms">Bahasa Malaysia</option>
                <option value="id">Bahasa Indonesia</option>
                <option value="th">ภาษาไทย (Thai)</option>
                <option value="vi">Tiếng Việt (Vietnamese)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue="Asia/Singapore"
              >
                <option value="Asia/Singapore">(GMT+08:00) Singapore</option>
                <option value="Asia/Kuala_Lumpur">(GMT+08:00) Kuala Lumpur</option>
                <option value="Asia/Jakarta">(GMT+07:00) Jakarta</option>
                <option value="Asia/Bangkok">(GMT+07:00) Bangkok</option>
                <option value="Asia/Manila">(GMT+08:00) Manila</option>
                <option value="Asia/Ho_Chi_Minh">(GMT+07:00) Ho Chi Minh City</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme for the dashboard</p>
              </div>
              <Switch id="darkMode" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoRefresh">Auto-Refresh</Label>
                <p className="text-sm text-muted-foreground">Automatically refresh data</p>
              </div>
              <Switch id="autoRefresh" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
