"use client";

import { useState } from "react";
import { calculateIncomeTax } from "@/lib/calculators";

export function IncomeTaxCalculator() {
  const [country, setCountry] = useState<"US" | "UK">("US");
  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState("");

  const result =
    income && parseFloat(income) > 0
      ? calculateIncomeTax({
          annualIncome: parseFloat(income),
          country,
          deductions: parseFloat(deductions) || 0,
        })
      : null;

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <select
            className="input"
            value={country}
            onChange={(e) => setCountry(e.target.value as "US" | "UK")}
          >
            <option value="US">United States (2024 brackets)</option>
            <option value="UK">United Kingdom (2024/25)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Annual Income {country === "US" ? "($)" : "(£)"}
          </label>
          <input
            type="number"
            className="input"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter annual income"
            min="0"
            step="1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Deductions {country === "US" ? "(standard/itemized)" : "(above Personal Allowance)"}
          </label>
          <input
            type="number"
            className="input"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            placeholder="Additional deductions"
            min="0"
          />
        </div>
      </div>

      {result && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Tax</p>
              <p className="text-2xl font-bold">
                {country === "US" ? "$" : "£"}{result.totalTax.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Take-home</p>
              <p className="text-xl font-semibold text-green-600">
                {country === "US" ? "$" : "£"}{result.netIncome.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Effective Rate</p>
              <p className="text-xl font-semibold">
                {(result.effectiveRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {result.taxByBracket.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium mb-2">Tax Breakdown</p>
              <div className="space-y-1">
                {result.taxByBracket.map((b, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">Bracket {b.bracket}</span>
                    <span className="font-medium">
                      {country === "US" ? "$" : "£"}{b.tax.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
