// Email verification page
"use client";

import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-gray-600 mb-4">
          A sign-in link has been sent to your email address. Click the link to sign in or register.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          The link will expire in 24 hours. Check your spam folder if you don&apos;t see it.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
