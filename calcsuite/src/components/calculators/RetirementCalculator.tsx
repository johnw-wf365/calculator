"use client";

import { useState } from "react";
import { calculateRetirement } from "@/lib/calculators";

export function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("65");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [inflation, setInflation] = useState("2.5");

  const result =
    currentAge && currentSavings && monthlyContribution
      ? calculateRetirement({
          currentAge: parseInt(currentAge),
          retirementAge: parseInt(retirementAge),
          currentSavings: parseFloat(currentSavings),
          monthlyContribution: parseFloat(monthlyContribution),
          annualReturn: parseFloat(annualReturn),
          inflationRate: parseFloat(inflation),
        })
      : null;

  return (
    <div className="card">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Age</label>
            <input
              type="number"
              className="input"
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
              min="18"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Retirement Age
            </label>
            <input
              type="number"
              className="input"
              value={retirementAge}
              onChange={(e) => setRetirementAge(e.target.value)}
              min="40"
              max="100"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Current Savings
          </label>
          <input
            type="number"
            className="input"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
            placeholder="Enter current retirement savings"
            min="0"
            step="1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Monthly Contribution
          </label>
          <input
            type="number"
            className="input"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            placeholder="Enter monthly contribution"
            min="0"
            step="50"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Annual Return (%)
            </label>
            <input
              type="number"
              className="input"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(e.target.value)}
              min="0"
              max="20"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Inflation (%)
            </label>
            <input
              type="number"
              className="input"
              value={inflation}
              onChange={(e) => setInflation(e.target.value)}
              min="0"
              max="10"
              step="0.5"
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Years to Retirement</p>
              <p className="text-3xl font-bold">
                {result.yearsToRetirement} <span className="text-lg">years</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Future Value (nominal)</p>
              <p className="text-2xl font-bold">
                ${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Income (4% rule)</p>
              <p className="text-xl font-semibold text-green-600">
                ${result.monthlyRetirementIncome.toFixed(0)}/mo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 text-sm">
            <div>
              <p className="text-gray-600">Total Contributions</p>
              <p className="font-medium">
                ${result.totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Interest Earned</p>
              <p className="font-medium text-green-600">
                ${result.totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
            <p className="text-gray-600">
              Inflation-adjusted future value (today's dollars):
            </p>
            <p className="font-medium text-lg">
              ${result.inflationAdjustedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
