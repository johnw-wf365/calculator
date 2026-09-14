// Freemium gate logic — cookie-based usage tracking
// - Unregistered: 3 calculations per day
// - Registered: 10 calculations per month
// - Premium: unlimited

import { cookies } from "next/headers";

export interface UsageInfo {
  count: number;
  limit: number;
  isPremium: boolean;
  isRegistered: boolean;
  remaining: number;
  resetDate: Date;
}

const DAILY_LIMIT = 3;
const MONTHLY_LIMIT = 10;

export async function getUsage(): Promise<UsageInfo> {
  const cookieStore = await cookies();
  const usageCookie = cookieStore.get("calcsuite_usage");
  const authCookie = cookieStore.get("calcsuite_auth");

  const isRegistered = authCookie?.value === "registered";
  const isPremium = authCookie?.value === "premium";

  const now = new Date();
  let count = 0;
  let resetDate = new Date(now);

  if (usageCookie) {
    try {
      const data = JSON.parse(usageCookie.value);
      const savedDate = new Date(data.date);
      const isSameDay =
        savedDate.getDate() === now.getDate() &&
        savedDate.getMonth() === now.getMonth() &&
        savedDate.getFullYear() === now.getFullYear();
      const isSameMonth =
        savedDate.getMonth() === now.getMonth() &&
        savedDate.getFullYear() === now.getFullYear();

      if (isPremium || isRegistered ? isSameMonth : isSameDay) {
        count = data.count;
      }

      if (isPremium || isRegistered) {
        resetDate.setMonth(resetDate.getMonth() + 1);
        resetDate.setDate(1);
      } else {
        resetDate.setDate(resetDate.getDate() + 1);
        resetDate.setHours(0, 0, 0, 0);
      }
    } catch {
      // Invalid cookie, reset
    }
  }

  const limit = isPremium ? Infinity : isRegistered ? MONTHLY_LIMIT : DAILY_LIMIT;
  const remaining = Math.max(0, limit - count);

  return { count, limit, isPremium, isRegistered, remaining, resetDate };
}

export async function incrementUsage(): Promise<UsageInfo> {
  const cookieStore = await cookies();
  const usageCookie = cookieStore.get("calcsuite_usage");
  const authCookie = cookieStore.get("calcsuite_auth");

  const isRegistered = authCookie?.value === "registered";
  const isPremium = authCookie?.value === "premium";

  const current = await getUsage();
  const newCount = current.count + 1;

  const now = new Date();
  cookieStore.set(
    "calcsuite_usage",
    JSON.stringify({ count: newCount, date: now.toISOString() }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    }
  );

  const limit = isPremium ? Infinity : isRegistered ? MONTHLY_LIMIT : DAILY_LIMIT;
  const remaining = Math.max(0, limit - newCount);

  return { count: newCount, limit, isPremium, isRegistered, remaining, resetDate: current.resetDate };
}
