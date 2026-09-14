// Checkout session creation for premium subscriptions
// POST /api/stripe/checkout → { url } redirects user to Stripe Checkout
import { NextRequest, NextResponse } from "next/server";
import { stripe, PREMIUM_PRICE_ID, isStripeEnabled } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, userId } = body;

    // Get the base URL for redirect URLs
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";

    // Build the checkout session params
    const sessionParams: any = {
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
      metadata: {
        source: "calcsuite",
        ...(userId && { userId }),
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      // Enable automatic tax calculation if configured
      automatic_tax: { enabled: !!process.env.STRIPE_TAX_ENABLED },
    };

    // Handle customer lookup/creation
    if (email) {
      // Try to find existing Stripe customer by email
      const existingCustomers = await stripe!.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        sessionParams.customer = existingCustomers.data[0].id;
      } else {
        sessionParams.customer_email = email;
      }
    } else if (userId) {
      // Look up user's Stripe customer ID from database
      if (db) {
        try {
          const user = await (db as any).query?.users?.findFirst({
            where: (users: any, { eq }: any) => eq(users.id, userId),
          });
          if (user?.stripeCustomerId) {
            sessionParams.customer = user.stripeCustomerId;
          }
        } catch {
          // DB query failed, continue without customer lookup
        }
      }
    }

    // Use price ID from env, or fall back to inline price data
    if (PREMIUM_PRICE_ID) {
      sessionParams.line_items = [
        {
          price: PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ];
    } else {
      // Inline price data — creates a one-time price inline
      // Use this for initial testing before creating a recurring product in Stripe dashboard
      sessionParams.line_items = [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "CalcSuite Premium",
              description: "Unlimited calculations, ad-free, premium features",
            },
            unit_amount: 499,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ];
    }

    // Create the checkout session
    const session = await stripe!.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: error.message },
      { status: 500 }
    );
  }
}
