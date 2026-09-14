import React from "react";
import { getCurrentUser } from "@/services/user";
import { redirect } from "next/navigation";
import HostOnboardingContainer from "@/components/host-application/onboarding/HostOnboardingContainer";
import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";
import { ShieldCheck, ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "Become a Host | BoardTAU",
  description: "Register your property as a verified landlord on BoardTAU and reach thousands of student tenants near TAU campus.",
};

export default async function BecomeAHostPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/?login=true&callbackUrl=/become-a-host");
  }

  // Check if user is already a Landlord or Admin
  if (currentUser.role === "LANDLORD" || currentUser.isVerifiedLandlord) {
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

  return <HostOnboardingContainer user={currentUser as any} />;
}
