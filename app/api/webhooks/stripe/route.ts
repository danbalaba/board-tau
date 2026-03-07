import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { handleStripeWebhook } from '@/services/payments/stripe';

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { message: 'Stripe not configured', ok: false },
        { status: 500 }
      );
    }

    const body = await req.text();
    const _headers = await headers();
    const signature = _headers.get('stripe-signature');

    if (!signature) {
      return new Response('Invalid signature', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      if (!event.data.object.customer_details?.email) {
        throw new Error('Missing user email');
      }

      const session = event.data.object as Stripe.Checkout.Session;

      console.log('Stripe session metadata:', session.metadata);

      await handleStripeWebhook(session);
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);

    return NextResponse.json(
      { message: 'Something went wrong', ok: false },
      { status: 500 }
    );
  }
}
