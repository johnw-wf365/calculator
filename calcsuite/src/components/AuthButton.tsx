// Auth button component — shows sign in/register or user menu
"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "loading") {
    return <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600"
        >
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            {session.user.name?.[0] || session.user.email?.[0] || "U"}
          </span>
          <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium truncate">{session.user.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
            <Link
              href="/auth/signin"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Account settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/signin"
        className="text-sm font-medium hover:text-blue-600"
      >
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className="btn btn-primary text-sm"
      >
        Register
      </Link>
    </div>
  );
}
