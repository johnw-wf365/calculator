// Stripe webhook handler for subscription events
// POST /api/stripe/webhook — handles subscription lifecycle events
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Events we handle
const HANDLED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
];

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  // Verify webhook signature
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook signature failed: ${err.message}` },
      { status: 400 }
    );
  }

  // Skip unhandled events
  if (!HANDLED_EVENTS.includes(event.type)) {
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    // Return 200 to prevent Stripe from retrying — log the error for manual investigation
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    );
  }
}

// --- Event Handlers ---

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const customerEmail = session.customer_email || session.customer_details?.email;

  console.log(`Checkout completed: customer=${customerId}, subscription=${subscriptionId}`);

  if (!customerId) return;

  // Create or update user record
  // In a real app with NextAuth, you'd link this to the authenticated user
  // For now, we store the Stripe customer ID for future lookups
  if (customerEmail) {
    // Check if user exists by email and update, or create new
    // This is a simplified approach — in production, use proper user linking
    console.log(`User ${customerEmail} subscribed. Customer: ${customerId}, Subscription: ${subscriptionId}`);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  console.log(`Subscription created: ${subscription.id} for customer ${customerId}`);

  // Update user record with subscription details
  // In production, look up user by stripeCustomerId and update their subscriptionStatus
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  console.log(`Subscription updated: ${subscription.id} status=${status} cancelAtPeriod=${cancelAtPeriodEnd}`);

  // Update subscription record in database
  // Sync status changes to user's premium status
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  console.log(`Subscription deleted: ${subscription.id} for customer ${customerId}`);

  // Downgrade user to free tier
  // Update user.subscriptionStatus = 'cancelled'
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  console.log(`Payment succeeded for customer ${customerId}, invoice ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  console.log(`Payment failed for customer ${customerId}, invoice ${invoice.id}`);

  // Optionally notify user or update status to 'past_due'
}
