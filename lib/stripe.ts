import Stripe from 'stripe'

// Check if Stripe secret key is provided
const hasStripeConfig = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.length > 0 && !process.env.STRIPE_SECRET_KEY.startsWith('pk_')

export const stripe = hasStripeConfig ? new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
}) : null
