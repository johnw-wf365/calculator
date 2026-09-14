// Customer portal integration
// POST /api/stripe/portal → { url } redirects user to Stripe Customer Portal
import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeEnabled } from "@/lib/stripe";
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
    const { customerId, userId } = body;

    let resolvedCustomerId = customerId;

    // If no customer ID provided, look up by user ID
    if (!resolvedCustomerId && userId) {
      if (db) {
        try {
          const user = await (db as any).query?.users?.findFirst({
            where: (users: any, { eq }: any) => eq(users.id, userId),
          });
          if (user?.stripeCustomerId) {
            resolvedCustomerId = user.stripeCustomerId;
          }
        } catch {
          // DB query failed
        }
      }
    }

    // If still no customer ID, try looking up by email
    if (!resolvedCustomerId && body.email) {
      const existingCustomers = await stripe!.customers.list({
        email: body.email,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        resolvedCustomerId = existingCustomers.data[0].id;
      }
    }

    if (!resolvedCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please subscribe first." },
        { status: 404 }
      );
    }

    // Verify the customer exists in Stripe
    try {
      await stripe!.customers.retrieve(resolvedCustomerId);
    } catch {
      return NextResponse.json(
        { error: "Invalid Stripe customer" },
        { status: 404 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";

    // Create portal session
    const session = await stripe!.billingPortal.sessions.create({
      customer: resolvedCustomerId,
      return_url: `${baseUrl}/subscription/manage`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session", detail: error.message },
      { status: 500 }
    );
  }
}
