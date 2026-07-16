'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from '@/app/admin/components/ui/sonner';
import { useSettings, useUpdateSettings } from '@/app/admin/hooks/use-settings';
import Skeleton from '@/components/common/Skeleton';
import { GeneralHeader } from './general-header';
import { IdentityCard } from './identity-card';
import { ContactCard } from './contact-card';
import { ReadOnlyCards } from './read-only-cards';

export function GeneralSettings() {
  const { data: queryResponse, isLoading } = useSettings();
  const settings = queryResponse?.data;
  const updateSettingsMutation = useUpdateSettings();

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

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        address: settings.address || '',
        enableEmailNotifications: settings.enableEmailNotifications ?? true,
        enablePushNotifications: settings.enablePushNotifications ?? false,
        enableAnalytics: settings.enableAnalytics ?? true,
        enableCookies: settings.enableCookies ?? true
      });
      setHasChanges(false);
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        address: settings.address || '',
        enableEmailNotifications: settings.enableEmailNotifications ?? true,
        enablePushNotifications: settings.enablePushNotifications ?? false,
        enableAnalytics: settings.enableAnalytics ?? true,
        enableCookies: settings.enableCookies ?? true
      });
      setHasChanges(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettingsMutation.mutateAsync(formData);
      toast.success('Configuration update deployed successfully.');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to deploy configuration.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 space-y-8">
        <Skeleton className="h-20 w-full rounded-[2rem]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
          <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <form onSubmit={handleSave} className="space-y-6">
        <GeneralHeader 
          onSave={handleSave} 
          onReset={handleReset} 
          isSaving={updateSettingsMutation.isPending} 
          hasChanges={hasChanges}
        />
        
        <div className="grid gap-6 lg:grid-cols-2 pb-10">
          <IdentityCard 
            siteName={formData.siteName} 
            siteDescription={formData.siteDescription} 
            onChange={handleInputChange} 
          />
          <ContactCard 
            contactEmail={formData.contactEmail} 
            contactPhone={formData.contactPhone} 
            address={formData.address} 
            onChange={handleInputChange} 
          />
          <ReadOnlyCards />
        </div>
      </form>
    </div>
  );
}
