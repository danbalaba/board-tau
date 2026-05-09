import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { handleStripeWebhook } from '@/services/payments/stripe';

export async function POST(req: Request) {
  if (!stripe) {
    console.error('❌ Stripe is not initialized. Check your STRIPE_SECRET_KEY.');
    return new Response('Stripe Configuration Error', { status: 500 });
  }

  const body = await req.text();
  const _headers = await headers();
  const signature = _headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`✅ Checkout completed: ${session.id}`);
        await handleStripeWebhook(session);
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.log(`⚠️ Checkout expired: ${expiredSession.id}`);
        // Add cleanup logic here if you lock inventory at checkout start
        break;

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`💰 Invoice paid: ${invoice.id}`);
        // Handle subscription fulfillment here
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log(`❌ Invoice payment failed: ${failedInvoice.id}`);
        // Notify user about failed subscription payment
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💵 PaymentIntent succeeded: ${paymentIntent.id}`);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`❌ Webhook handler error (${event.type}):`, err);
    return NextResponse.json(
      { message: 'Internal server error', ok: false },
      { status: 500 }
    );
  }
}
