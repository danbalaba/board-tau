'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useInquiryDetailLogic(inquiry: any) {
  const router = useRouter();
  const [isResponding, setIsResponding] = useState(false);

  const handleRespond = async (status: 'APPROVED' | 'REJECTED') => {
    setIsResponding(true);
    const toastId = toast.loading(`Marking inquiry as ${status.toLowerCase()}...`);
    try {
      const response = await fetch(`/api/landlord/inquiries?id=${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Inquiry ${status.toLowerCase()}.`, { id: toastId });
        router.refresh();
        router.push('/landlord/inquiries');
      } else {
        toast.error(`Failed to update status.`, { id: toastId });
      }
    } catch (error) {
      console.error('Error responding:', error);
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setIsResponding(false);
    }
  };

  return {
    isResponding,
    handleRespond,
    router
  };
}
