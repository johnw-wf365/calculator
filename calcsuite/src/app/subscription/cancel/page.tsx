// Stripe checkout cancel page
// GET /subscription/cancel — shown when user cancels the checkout
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4">Subscription Cancelled</h1>
      <p className="text-gray-600 mb-8">
        No charges were made. You can still use our free calculators anytime.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/calculators" className="btn btn-primary">
          Browse Calculators
        </Link>
      </div>
    </div>
  );
}
