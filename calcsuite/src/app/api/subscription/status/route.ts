// Subscription status API
// GET /api/subscription/status — returns current user's subscription status
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    // In a production app with NextAuth, get user from session
    // For now, check query param or header for user identification
    const userId = req.nextUrl.searchParams.get("userId");
    const customerId = req.nextUrl.searchParams.get("customerId");

    // Check if we have database access
    if (!db) {
      return NextResponse.json({
        hasPremium: false,
        status: "unavailable",
        message: "Database not configured",
      });
    }

    let subscriptionData: {
      userId?: string;
      status?: string;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      stripeStatus?: string;
      currentPeriodEnd?: Date;
      cancelAtPeriodEnd?: boolean;
    } | null = null;

    // Look up by user ID
    if (userId) {
      try {
        const user = await (db as any).query?.users?.findFirst({
          where: (users: any, { eq }: any) => eq(users.id, userId),
        });

        if (user) {
          subscriptionData = {
            userId: user.id,
            status: user.subscriptionStatus || "free",
            stripeCustomerId: user.stripeCustomerId,
            stripeSubscriptionId: user.stripeSubscriptionId,
            stripeStatus: undefined,
            currentPeriodEnd: undefined,
            cancelAtPeriodEnd: undefined,
          };

          // If user has a Stripe subscription ID, verify with Stripe
          if (stripe && user.stripeSubscriptionId) {
            try {
              const subscription = await stripe.subscriptions.retrieve(
                user.stripeSubscriptionId
              );
              subscriptionData.stripeStatus = subscription.status;
              subscriptionData.currentPeriodEnd = new Date(
                subscription.current_period_end * 1000
              );
              subscriptionData.cancelAtPeriodEnd = subscription.cancel_at_period_end;
            } catch (stripeError) {
              console.warn("Failed to fetch subscription from Stripe:", stripeError);
            }
          }
        }
      } catch (dbError) {
        console.warn("Database query failed:", dbError);
      }
    }

    // Look up by Stripe customer ID
    if (!subscriptionData && customerId && stripe) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0];
          subscriptionData = {
            stripeCustomerId: customerId,
            stripeSubscriptionId: sub.id,
            stripeStatus: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            status: "premium",
          };
        }
      } catch (stripeError) {
        console.warn("Failed to fetch from Stripe:", stripeError);
      }
    }

    // Default response for unregistered/free users
    if (!subscriptionData) {
      return NextResponse.json({
        hasPremium: false,
        status: "free",
        message: "No subscription found",
      });
    }

    return NextResponse.json({
      hasPremium:
        subscriptionData.status === "premium" &&
        subscriptionData.stripeStatus === "active",
      status: subscriptionData.status,
      stripeStatus: subscriptionData.stripeStatus,
      currentPeriodEnd: subscriptionData.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
    });
  } catch (error: any) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status", detail: error.message },
      { status: 500 }
    );
  }
}
