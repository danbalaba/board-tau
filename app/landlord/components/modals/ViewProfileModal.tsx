'use client';

import React, { useState } from 'react';
import {
  IconUser,
  IconAt,
  IconPhone,
  IconMapPin,
  IconId,
  IconCalendarEvent,
  IconEdit
} from '@tabler/icons-react';
import Modal from '@/components/modals/Modal';
import { Avatar, AvatarFallback, AvatarImage } from "@/app/admin/components/ui/avatar";
import { cn } from "@/lib/utils";
import Button from '@/components/common/Button';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function ViewProfileModal({
  isOpen,
  onClose,
  user
}: ViewProfileModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) return null;

  const handleEditClick = () => {
    onClose();
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Landlord Profile"
        closeOnOutsideClick={false}
      >
        <ScrollArea className="max-h-[85vh]">
          {/* Cover Header/Background - CENTERED as requested */}
          <div className="h-28 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 relative transition-all duration-700">

            {/* Edit Icon Button - Top Right exactly as in refactor branch */}
            <button
              onClick={handleEditClick}
              className="absolute top-4 right-4 w-9 h-9 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700 text-primary hover:bg-primary hover:text-white transition-all z-30 group"
            >
              <IconEdit size={16} className="transition-transform group-active:scale-90" />
            </button>

            {/* Avatar Floating - CENTERED as requested */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="p-1.5 rounded-full bg-white dark:bg-gray-900 shadow-xl relative z-10 border border-gray-100/50 dark:border-gray-800/50">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-950 shadow-sm transition-transform duration-500 hover:scale-105">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={user?.image || user?.profileImage} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {user.isVerifiedLandlord && (
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white dark:border-gray-900 z-20">
                    <IconId size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 px-6">
            {/* Header Text Section - CENTERED as requested */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {user.name || 'Landlord User'}
                </h3>
                {user.isVerifiedLandlord && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                {user.role} Account
              </p>
              {user.landlordApprovedAt && (
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] font-bold text-gray-400 dark:text-gray-500">
                  <IconCalendarEvent size={12} className="text-primary" />
                  <span>Member since {new Date(user.landlordApprovedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* Profile Information Section */}
            <div className="space-y-4 pb-10">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Detailed Credentials</h4>

              <div className="grid gap-3">
                {/* Details list exactly matching the design list */}
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/5">
                    <IconUser size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Full Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/5">
                    <IconAt size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/5">
                    <IconPhone size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.phoneNumber || user.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 border border-purple-500/5">
                    <IconMapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {(user.city && user.region) ? `${user.city}, ${user.region}` : (user.city || user.region || 'Not provided')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 border border-amber-500/5">
                    <IconId size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Professional Bio</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed italic">
                      {user.bio || 'Your professional bio will appear here.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                    user.isVerifiedLandlord ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-500/5" : "bg-amber-50 dark:bg-amber-500/10 text-amber-500 border-amber-500/5"
                  )}>
                    <IconUser size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Verification Status</p>
                    <p className={cn(
                      "text-sm font-medium capitalize",
                      user.isVerifiedLandlord ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {user.isVerifiedLandlord ? 'Verified Landlord' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Modal>

      {/* Edit Profile Modal Trigger */}
      <ProfileSettingsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </>
  );
}
