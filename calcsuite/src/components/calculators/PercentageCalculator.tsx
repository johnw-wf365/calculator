// Percentage Calculator — client component
"use client";

import { useState } from "react";
import { calculatePercentage } from "@/lib/calculators";

export function PercentageCalculator() {
  const [value, setValue] = useState("");
  const [percentage, setPercentage] = useState("");
  const [baseValue, setBaseValue] = useState("");

  const result = calculatePercentage(
    { value: parseFloat(value) || 0, percentage: parseFloat(percentage) || 0 },
    baseValue ? parseFloat(baseValue) : undefined
  );

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Value</label>
          <input
            type="number"
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Percentage (%)</label>
          <input
            type="number"
            className="input"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="Enter percentage"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Base Value (optional — for "is what percent of")
          </label>
          <input
            type="number"
            className="input"
            value={baseValue}
            onChange={(e) => setBaseValue(e.target.value)}
            placeholder="Enter base value"
          />
        </div>
      </div>

      {(parseFloat(value) > 0 || parseFloat(percentage) > 0) && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Result</p>
              <p className="text-2xl font-bold">
                {result.result.toFixed(2)}
              </p>
            </div>
            {baseValue && (
              <div>
                <p className="text-sm text-gray-600">Is What % Of</p>
                <p className="text-xl font-semibold">
                  {result.isWhatPercentOf.toFixed(2)}%
                </p>
              </div>
            )}
            {result.percentageChange !== null && (
              <div>
                <p className="text-sm text-gray-600">% Change</p>
                <p className="text-xl font-semibold">
                  {result.percentageChange > 0 ? "+" : ""}
                  {result.percentageChange.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
