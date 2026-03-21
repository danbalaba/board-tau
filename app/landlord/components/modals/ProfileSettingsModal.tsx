'use client';

import React from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Label } from '@/app/admin/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/admin/components/ui/avatar';
import { IconUser, IconMail, IconPhone, IconMapPin, IconGavel } from '@tabler/icons-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

export function ProfileSettingsModal({ isOpen, onClose, user }: ProfileSettingsModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      title="Profile Settings"
      description="Manage your personal information and profile preferences"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture - Responsive layout */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex-shrink-0">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
              <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl sm:text-2xl">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 w-full text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {user.name || 'Landlord'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {user.email || 'landlord@example.com'}
            </p>
            <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto">
              Change Profile Picture
            </Button>
          </div>
        </div>

        {/* Personal Information - Responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  placeholder="Your full name"
                  defaultValue={user.name || ''}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  defaultValue={user.email || ''}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <IconPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a little about yourself..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Location</Label>
              <div className="relative">
                <IconMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="address"
                  placeholder="City, State"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button - Full width on mobile */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <IconGavel className="w-4 h-4" />
              Save Changes
            </div>
          )}
        </Button>
      </form>
    </Modal>
  );
}
