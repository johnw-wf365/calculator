// API route for freemium usage tracking
import { NextResponse } from "next/server";
import { getUsage } from "@/lib/freemium";

export async function GET() {
  const usage = await getUsage();
  return NextResponse.json({
    count: usage.count,
    limit: usage.limit,
    remaining: usage.remaining,
    isPremium: usage.isPremium,
    isRegistered: usage.isRegistered,
  });
}
