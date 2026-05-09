'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LegacyMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Construct the new dashboard URL with the openChat trigger
    const params = new URLSearchParams(searchParams.toString());
    params.set('openChat', 'true');
    
    router.replace(`/landlord?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-xl"></div>
      <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">Transitioning to Workspace...</p>
    </div>
  );
}
