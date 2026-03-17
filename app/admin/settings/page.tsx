'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Switch } from '@/app/admin/components/ui/switch';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Save, Globe, Mail, Shield, Bell } from 'lucide-react';

export default function GeneralSettings() {
  const [formData, setFormData] = useState({
    siteName: 'BoardTAU',
    siteDescription: 'Your Ultimate Destination Connection',
    contactEmail: 'contact@boardtau.com',
    contactPhone: '+1 234 567 8900',
    address: '123 Main St, New York, NY 10001',
    enableEmailNotifications: true,
    enablePushNotifications: false,
    enableAnalytics: true,
    enableCookies: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data:', formData);
    // Show success message
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">General Settings</h1>
          <p className="text-gray-500 mt-1">Manage your platform's general settings</p>
        </div>
        <Button onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  placeholder="Enter site name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  placeholder="Enter site description"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Enter contact email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Enter contact phone"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Send email notifications to users</p>
              </div>
              <Switch
                id="enableEmailNotifications"
                name="enableEmailNotifications"
                checked={formData.enableEmailNotifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableEmailNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enablePushNotifications">Push Notifications</Label>
                <p className="text-sm text-gray-500">Send push notifications to users</p>
              </div>
              <Switch
                id="enablePushNotifications"
                name="enablePushNotifications"
                checked={formData.enablePushNotifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enablePushNotifications: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableAnalytics">Analytics</Label>
                <p className="text-sm text-gray-500">Enable analytics tracking</p>
              </div>
              <Switch
                id="enableAnalytics"
                name="enableAnalytics"
                checked={formData.enableAnalytics}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableAnalytics: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCookies">Cookies</Label>
                <p className="text-sm text-gray-500">Enable cookie tracking</p>
              </div>
              <Switch
                id="enableCookies"
                name="enableCookies"
                checked={formData.enableCookies}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableCookies: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
