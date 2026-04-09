'use client';

import Modal from '@/components/modals/Modal';
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';
import LandlordSettingsHub from '../index';

interface LandlordSettingsModalHubProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'notifications' | 'payment' | 'security';
  mode?: 'account' | 'security' | 'all';
}

export function LandlordSettingsModalHub({
  isOpen,
  onClose,
  defaultTab = 'notifications',
  mode = 'all'
}: LandlordSettingsModalHubProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      title={mode === 'security' ? 'Security & Privacy' : 'General Settings'}
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
