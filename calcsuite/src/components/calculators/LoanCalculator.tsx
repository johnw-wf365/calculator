"use client";

import { useState } from "react";
import { calculateLoan } from "@/lib/calculators";

export function LoanCalculator() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [termMonths, setTermMonths] = useState("");

  const result =
    principal && annualRate && termMonths
      ? calculateLoan({
          principal: parseFloat(principal),
          annualRate: parseFloat(annualRate),
          termMonths: parseInt(termMonths),
        })
      : null;

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Loan Principal
          </label>
          <input
            type="number"
            className="input"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="Enter loan amount"
            min="0"
            step="1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            className="input"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="Enter annual rate"
            min="0"
            max="50"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Loan Term (months)
          </label>
          <input
            type="number"
            className="input"
            value={termMonths}
            onChange={(e) => setTermMonths(e.target.value)}
            placeholder="Enter term in months"
            min="1"
            max="480"
          />
        </div>
      </div>

      {result && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Payment</p>
              <p className="text-2xl font-bold">
                ${result.monthlyPayment.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Payment</p>
              <p className="text-xl font-semibold">
                ${result.totalPayment.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interest</p>
              <p className="text-xl font-semibold text-red-600">
                ${result.totalInterest.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
