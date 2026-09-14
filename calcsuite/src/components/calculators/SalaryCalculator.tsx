"use client";

import { useState } from "react";
import { calculateSalary } from "@/lib/calculators";

export function SalaryCalculator() {
  const [annualSalary, setAnnualSalary] = useState("");
  const [payFrequency, setPayFrequency] = useState<"weekly" | "biweekly" | "monthly" | "annual">("monthly");
  const [taxRate, setTaxRate] = useState("");

  const result =
    annualSalary && taxRate
      ? calculateSalary({
          annualSalary: parseFloat(annualSalary),
          payFrequency,
          taxRate: parseFloat(taxRate),
        })
      : null;

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Annual Salary
          </label>
          <input
            type="number"
            className="input"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(e.target.value)}
            placeholder="Enter annual salary"
            min="0"
            step="1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pay Frequency</label>
          <select
            className="input"
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value as typeof payFrequency)}
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Effective Tax Rate (%)
          </label>
          <input
            type="number"
            className="input"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            placeholder="Enter tax rate"
            min="0"
            max="70"
            step="0.5"
          />
        </div>
      </div>

      {result && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Gross Pay</p>
              <p className="text-2xl font-bold">${result.grossPay.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tax</p>
              <p className="text-xl font-semibold text-red-600">
                -${result.taxAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Take-home</p>
              <p className="text-xl font-semibold text-green-600">
                ${result.netPay.toFixed(2)}
              </p>
            </div>
            <div className="md:col-span-3 pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Annual take-home: <span className="font-semibold">${result.annualNet.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
