// Shared calculator UI components
"use client";

import { useState } from "react";
import Link from "next/link";
import { calculators } from "@/config/calculators";

export function Header() {
  return (
    <header className="header">
      <div className="container flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          CalcSuite
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/calculators" className="hover:underline">
            All Calculators
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container text-center text-sm text-gray-500">
        <p>© 2025 CalcSuite. All rights reserved.</p>
        <p className="mt-2">
          Free online calculators for finance, health, math, and more.
        </p>
      </div>
    </footer>
  );
}

export function CalculatorGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {calculators.map((calc) => (
        <Link
          key={calc.slug}
          href={`/${calc.slug}`}
          className="card hover:border-blue-300 transition-colors"
        >
          <h3 className="font-semibold text-lg">{calc.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{calc.description}</p>
          <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            {calc.category}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function FreemiumBanner() {
  return null;
}
