import Stripe from 'stripe'

const cleanEnv = (val: string | undefined) => (val || "").replace(/['"]/g, '');
const stripeSecretKey = cleanEnv(process.env.STRIPE_SECRET_KEY);

// Check if Stripe secret key is provided
const hasStripeConfig = stripeSecretKey.length > 0 && !stripeSecretKey.startsWith('pk_');

export const stripe = hasStripeConfig ? new Stripe(stripeSecretKey, {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
}) : null
