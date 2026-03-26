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
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('Stripe session metadata:', session.metadata);

      await handleStripeWebhook(session);
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err);
    // Explicitly write the exact stripe error stack trace physically to the log so we can debug without guessing
    const fs = require('fs');
    fs.appendFileSync('stripe-error.log', '\n[' + new Date().toISOString() + '] ' + (err.stack || err.message || String(err)));

    return NextResponse.json(
      { message: err.message || 'Something went wrong', ok: false },
      { status: 500 }
    );
  }
}
