// Subscription management page — client component that redirects to Stripe portal
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ManagePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function redirectToPortal() {
      try {
        const res = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error || "Failed to open portal");
          setLoading(false);
        }
      } catch {
        setError("Failed to open customer portal. Please try again.");
        setLoading(false);
      }
    }

    redirectToPortal();
  }, []);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Manage Your Subscription</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/" className="btn btn-primary">
          ← Back to calculators
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <h1 className="text-3xl font-bold mb-4">Redirecting...</h1>
      <p className="text-gray-600">
        Please wait while we redirect you to the customer portal.
      </p>
      <div className="mt-8">
        <div className="animate-pulse h-32 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
