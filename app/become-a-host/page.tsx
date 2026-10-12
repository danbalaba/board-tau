import React, { Suspense } from "react";
import { getCurrentUser } from "@/services/user";
import { getHostApplicationByUser } from "@/services/landlord/applications";
import { redirect } from "next/navigation";
import BecomeAHostClientWrapper from "@/components/host-application/BecomeAHostClientWrapper";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Become a Host | BoardTAU",
  description: "Register your property as a verified landlord on BoardTAU and reach thousands of student tenants near TAU campus.",
};

export default async function BecomeAHostPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/?login=true&callbackUrl=/become-a-host");
  }

  // Fetch the user's existing application (1-to-1 relation)
  const existingApplication = await getHostApplicationByUser();

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <BecomeAHostClientWrapper
        user={currentUser as any}
        application={existingApplication}
      />
    </Suspense>
  );
}

