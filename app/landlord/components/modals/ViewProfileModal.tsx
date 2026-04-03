'use client';

import React from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/admin/components/ui/avatar';
import { 
  IconUser, 
  IconMail, 
  IconId,
  IconCalendarEvent,
  IconEdit,
  IconPhone,
  IconMapPin,
  IconAt
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProfileSettingsModal } from '@/app/landlord/components/modals/ProfileSettingsModal';

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    isVerifiedLandlord?: boolean;
    landlordApprovedAt?: Date | null;
    phoneNumber?: string | null;
    city?: string | null;
    region?: string | null;
    bio?: string | null;
  };
}

export function ViewProfileModal({ isOpen, onClose, user }: ViewProfileModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleClose = () => {
    onClose();
    setIsEditModalOpen(false);
  };

  const handleEditClick = () => {
    onClose();
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Modal
        title="Profile Details"
        description="Your landlord profile information"
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-2xl"
      >
        <div className="space-y-6 p-1 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
          {/* Profile Picture & Basic Info */}
          <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-primary/5 via-purple-50/50 to-transparent dark:from-primary/10 dark:via-purple-950/20 dark:to-transparent rounded-2xl border border-gray-100 dark:border-gray-800 relative">
            {/* Edit Icon Button - Top Right */}
            <button
              onClick={handleEditClick}
              className="absolute top-4 right-4 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              <IconEdit size={14} />
            </button>
            
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-primary/80 to-purple-500 p-1 shadow-xl shadow-primary/20">
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full overflow-hidden flex items-center justify-center">
                  <Avatar className="w-full h-full rounded-none">
                    {user.image && (
                      <AvatarImage src={user.image} alt={user.name || 'User'} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-transparent text-primary text-2xl font-black">
                      {user.name?.charAt(0) || 'L'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {user.isVerifiedLandlord && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white dark:border-gray-900">
                  <IconId size={16} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {user.name || 'Landlord User'}
                </h3>
                {user.isVerifiedLandlord && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {user.role}
              </p>
              {user.landlordApprovedAt && (
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <IconCalendarEvent size={12} />
                  <span>Member since {new Date(user.landlordApprovedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Profile Information</h4>
            
            <div className="grid gap-3">
              {/* Full Name */}
              <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <IconUser size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Full Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <IconAt size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.email || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <IconPhone size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.phoneNumber || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Location / Address */}
              <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                  <IconMapPin size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.city && user.region 
                      ? `${user.city}, ${user.region}` 
                      : user.city 
                        ? user.city 
                        : user.region 
                          ? user.region 
                          : 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Bio / Professional Bio */}
              <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <IconId size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Professional Bio</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                    {user.bio || 'No bio provided yet.'}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <IconId size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Account Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              {/* Verification Status */}
              <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  user.isVerifiedLandlord 
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" 
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-500"
                )}>
                  <IconUser size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Verification Status</p>
                  <p className={cn(
                    "text-sm font-medium capitalize",
                    user.isVerifiedLandlord 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-amber-600 dark:text-amber-400"
                  )}>
                    {user.isVerifiedLandlord ? 'Verified Landlord' : 'Pending Verification'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </Modal>

      {/* Edit Profile Modal */}
      <ProfileSettingsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </>
  );
}
