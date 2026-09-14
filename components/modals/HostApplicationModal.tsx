"use client";

import React from "react";
import { useSession } from "next-auth/react";
import HostOnboardingContainer from "../host-application/onboarding/HostOnboardingContainer";

interface HostApplicationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCloseModal?: () => void;
}

const HostApplicationModal: React.FC<HostApplicationModalProps> = ({
  onClose,
  onCloseModal,
}) => {
  const { data: session } = useSession();

  const handleClose = () => {
    if (onClose) onClose();
    if (onCloseModal) onCloseModal();
  };

  return (
    <div className="relative w-full max-h-[90vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0b0f17] rounded-2xl md:rounded-[2.5rem]">
      <HostOnboardingContainer user={session?.user as any} onCloseModal={handleClose} />
    </div>
  );
};

export default HostApplicationModal;
