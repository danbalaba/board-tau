import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/user";
import NotificationsClient from "@/components/notifications/NotificationsClient";

export const dynamic = 'force-dynamic';

const NotificationsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/");
  }

  if (user.role === "LANDLORD") {
    return redirect("/landlord");
  }

  if (user.role === "ADMIN") {
    return redirect("/admin");
  }

  return <NotificationsClient user={user} />;
};

export default NotificationsPage;
