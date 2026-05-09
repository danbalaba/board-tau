'use client';

import Modal from '@/components/modals/Modal';
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';
import LandlordSettingsHub from '../index';

interface LandlordSettingsModalHubProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'notifications' | 'payment' | 'security';
  mode?: 'account' | 'security' | 'all';
}

export function LandlordSettingsModalHub({
  isOpen,
  onClose,
  defaultTab = 'profile',
  mode = 'all'
}: LandlordSettingsModalHubProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="xl"
      title="Landlord Settings Hub"
      closeOnOutsideClick={false}
    >
      <ScrollArea className="max-h-[85vh] -m-6">
        <div className="p-8 pb-20">
          <LandlordSettingsHub mode={mode} />
        </div>
      </ScrollArea>
    </Modal>
  );
}
