// Stripe checkout success page
// GET /subscription/success?session_id=xxx — shown after successful payment
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4">Welcome to Premium!</h1>
      <p className="text-gray-600 mb-8">
        Your subscription is now active. Enjoy unlimited calculations and an
        ad-free experience.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/calculators" className="btn btn-primary">
          Start Calculating
        </Link>
        <Link href="/subscription/manage" className="btn btn-secondary">
          Manage Subscription
        </Link>
      </div>
    </div>
  );
}
