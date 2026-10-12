"use client";

import React, { useState } from "react";
import HostOnboardingContainer from "@/components/host-application/onboarding/HostOnboardingContainer";
import HostApplicationStatusMonitor from "@/components/host-application/HostApplicationStatusMonitor";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

interface BecomeAHostClientWrapperProps {
  user: any;
  application: any;
}

export const BecomeAHostClientWrapper: React.FC<BecomeAHostClientWrapperProps> = ({
  user,
  application,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // If user is already an approved landlord
  if (user?.role === "LANDLORD" || user?.isVerifiedLandlord || application?.status === "approved") {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-md w-full text-center border border-gray-100 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <ShieldCheck size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              You are a Verified Host!
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">
              Your landlord account is active. Access your host dashboard to add and manage your property listings.
            </p>
          </div>
          <Link
            href="/landlord/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/30 transition-all"
          >
            <span>Go to Landlord Dashboard</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // If no application has ever been submitted by this user, show the fresh onboarding wizard
  if (!application) {
    return <HostOnboardingContainer user={user} />;
  }

  // If application exists and is in "rejected" state: allow user to view the status monitor or edit and resubmit
  if (application.status === "rejected") {
    if (isEditing) {
      return (
        <HostOnboardingContainer
          user={user}
          initialApplication={application}
          onCancelEdit={() => setIsEditing(false)}
        />
      );
    }
    return (
      <HostApplicationStatusMonitor
        application={application}
        user={user}
        onStartEdit={() => setIsEditing(true)}
      />
    );
  }

  // If application exists and is "pending": always show the Status Monitor!
  return (
    <HostApplicationStatusMonitor
      application={application}
      user={user}
    />
  );
};

export default BecomeAHostClientWrapper;
