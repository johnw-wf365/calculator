"use client";

import { useState } from "react";
import { convertCurrency } from "@/lib/calculators";

// Simplified static rates (in production, use an API like exchangerate.host)
const STATIC_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CHF: 0.88,
  INR: 83.1,
  CNY: 7.24,
};

const CURRENCIES = Object.keys(STATIC_RATES);

export function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("GBP");

  const result = convertCurrency(
    parseFloat(amount) || 0,
    fromCurrency,
    toCurrency,
    STATIC_RATES
  );

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select
              className="input"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select
              className="input"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {parseFloat(amount) > 0 && (
        <div className="result-highlight mt-6">
          <p className="text-sm text-gray-600">
            {amount} {fromCurrency} =
          </p>
          <p className="text-3xl font-bold">
            {result.amount.toFixed(2)} {toCurrency}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Rate: 1 {fromCurrency} = {result.rate.toFixed(4)} {toCurrency}
          </p>
        </div>
      )}
    </div>
  );
}
