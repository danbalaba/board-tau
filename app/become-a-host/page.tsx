import React from "react";
import { getCurrentUser } from "@/services/user";
import { getHostApplicationByUser } from "@/services/landlord/applications";
import { redirect } from "next/navigation";
import BecomeAHostClientWrapper from "@/components/host-application/BecomeAHostClientWrapper";

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
    <BecomeAHostClientWrapper
      user={currentUser as any}
      application={existingApplication}
    />
  );
}

