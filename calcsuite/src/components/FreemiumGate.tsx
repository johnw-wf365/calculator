// Freemium gate — client component that tracks usage
"use client";

import { useState, useEffect, ReactNode } from "react";

interface UsageState {
  count: number;
  limit: number;
  remaining: number;
  isPremium: boolean;
  isRegistered: boolean;
}

export function FreemiumGate({
  calculatorSlug,
  children,
}: {
  calculatorSlug: string;
  children: ReactNode;
}) {
  const [usage, setUsage] = useState<UsageState | null>(null);

  useEffect(() => {
    async function loadUsage() {
      const res = await fetch("/api/usage");
      if (res.ok) {
        setUsage(await res.json());
      }
    }
    loadUsage();
  }, []);

  if (!usage) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded" />;
  }

  const isBlocked = usage.remaining <= 0 && !usage.isPremium;

  if (isBlocked) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-semibold mb-2">Daily limit reached</h2>
        <p className="text-gray-600 mb-4">
          You've used {usage.count} of {usage.limit} free calculations today.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <div className="p-4 bg-blue-50 rounded w-full">
            <h3 className="font-semibold">Register for 10 free/month</h3>
            <p className="text-sm text-gray-600">
              Free email registration, no credit card needed.
            </p>
            <button className="btn btn-primary mt-2">Register Free</button>
          </div>
          <div className="p-4 bg-amber-50 rounded w-full">
            <h3 className="font-semibold">Go Premium — £4.99/mo</h3>
            <p className="text-sm text-gray-600">
              Unlimited calculations, ad-free, premium features.
            </p>
            <button className="btn btn-primary mt-2 bg-amber-500 hover:bg-amber-600">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <span>
          {usage.isPremium
            ? "Unlimited (Premium)"
            : usage.isRegistered
              ? `${usage.remaining} calculations left this month`
              : `${usage.remaining} free today`}
        </span>
        {!usage.isPremium && (
          <span className="text-blue-600">
            Register for more →
          </span>
        )}
      </div>
      {children}
    </>
  );
}
