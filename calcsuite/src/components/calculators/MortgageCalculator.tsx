"use client";

import { useState } from "react";
import { calculateMortgage } from "@/lib/calculators";

export function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [termYears, setTermYears] = useState("30");
  const [propertyTax, setPropertyTax] = useState("1.2");
  const [insurance, setInsurance] = useState("100");
  const [hoaFees, setHoaFees] = useState("0");

  const result =
    homePrice && downPayment && annualRate
      ? calculateMortgage({
          homePrice: parseFloat(homePrice),
          downPayment: parseFloat(downPayment),
          annualRate: parseFloat(annualRate),
          termYears: parseInt(termYears),
          propertyTaxRate: parseFloat(propertyTax),
          homeInsurance: parseFloat(insurance),
          hoaFees: parseFloat(hoaFees),
        })
      : null;

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Home Price</label>
          <input
            type="number"
            className="input"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
            placeholder="Enter home price"
            min="0"
            step="10000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Down Payment
          </label>
          <input
            type="number"
            className="input"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="Enter down payment"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Annual Rate (%)
          </label>
          <input
            type="number"
            className="input"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="Enter annual rate"
            min="0"
            max="20"
            step="0.125"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Loan Term (years)
          </label>
          <select
            className="input"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
          >
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="30">30 years</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Property Tax (%)
            </label>
            <input
              type="number"
              className="input"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Insurance ($/mo)
            </label>
            <input
              type="number"
              className="input"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              min="0"
              step="10"
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Payment (Total)</p>
              <p className="text-3xl font-bold text-blue-600">
                ${result.monthlyTotal.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">P&I Only</p>
              <p className="text-xl font-semibold">
                ${result.monthlyPrincipalInterest.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 text-sm">
            <div>
              <p className="text-gray-600">Tax</p>
              <p className="font-medium">${result.monthlyPropertyTax.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">Insurance</p>
              <p className="font-medium">${result.monthlyInsurance.toFixed(2)}</p>
            </div>
            {result.monthlyHOA > 0 && (
              <div>
                <p className="text-gray-600">HOA</p>
                <p className="font-medium">${result.monthlyHOA.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Amount</span>
              <span className="font-medium">${result.loanAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Interest</span>
              <span className="font-medium text-red-600">
                ${result.totalInterest.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Payments</span>
              <span className="font-medium">${result.totalPayments.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
