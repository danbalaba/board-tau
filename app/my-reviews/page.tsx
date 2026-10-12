import React, { Suspense } from "react";
import { getMyReviews } from "@/services/reviews";
import ReviewsClient from "@/components/reviews/ReviewsClient";
import { getCurrentUser } from "@/services/user/user";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "My Reviews | BoardTAU",
  description: "View and manage your property reviews and landlord responses.",
};

const MyReviewsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  // Security: If user is a LANDLORD, redirect to their landlord dashboard
  if (user.role === "LANDLORD") {
    redirect("/landlord/reviews");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const reviews = await getMyReviews();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <ReviewsClient initialReviews={reviews as any} />
    </Suspense>
  );
};

export default MyReviewsPage;
