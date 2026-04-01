'use client';

import React from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import LandlordSettingsHub from '../index';

interface LandlordSettingsModalHubProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'notifications' | 'payment' | 'security';
}

export function LandlordSettingsModalHub({
  isOpen,
  onClose,
  defaultTab = 'profile'
}: LandlordSettingsModalHubProps) {
  return (
    <Modal
      title="Settings Center"
      description="Manage your landlord account preferences"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="max-h-[80vh] overflow-y-auto custom-scrollbar -m-6 p-6 pb-20">
        <LandlordSettingsHub />
      </div>
    </Modal>
  );
}
