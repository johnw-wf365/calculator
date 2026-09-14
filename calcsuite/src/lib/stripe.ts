// Stripe client library for CalcSuite premium subscriptions
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === "production") {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe features will be disabled.");
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    })
  : null;

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || "";

export const PREMIUM_PRICE_GBP = 499; // £4.99 in pence
export const PREMIUM_CURRENCY = "gbp";

export function isStripeEnabled(): boolean {
  return !!stripe && !!PREMIUM_PRICE_ID;
}
