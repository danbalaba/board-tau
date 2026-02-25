import { NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/services/payments/stripe";

export async function POST(request: Request) {
  try {
    const { inquiryId } = await request.json();

    if (!inquiryId) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    const session = await createStripeCheckoutSession(inquiryId);

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
