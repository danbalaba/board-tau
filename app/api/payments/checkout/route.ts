import { NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/services/payments/stripe";
import { getPostHogClient } from "@/lib/posthog-server";
import { getCurrentUser } from "@/services/user";

export async function POST(request: Request) {
  try {
    const { inquiryId } = await request.json();

    if (!inquiryId) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    const session = await createStripeCheckoutSession(inquiryId);

    // Track checkout session creation server-side
    try {
      const user = await getCurrentUser();
      if (user) {
        const posthog = getPostHogClient();
        posthog.capture({
          distinctId: user.id,
          event: "checkout_session_created",
          properties: {
            inquiry_id: inquiryId,
            stripe_session_id: (session as any)?.id,
          },
        });
        await posthog.flush();
      }
    } catch (phErr) {
      console.error("PostHog checkout_session_created capture failed:", phErr);
    }

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
