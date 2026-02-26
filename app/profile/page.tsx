import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";
import { getUserProfile } from "@/services/user/profile";

export const dynamic = "force-dynamic";

const ProfilePage: React.FC = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/");
  }

  const profile = await getUserProfile();

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileClient profile={profile} />
    </div>
  );
};

export default ProfilePage;
