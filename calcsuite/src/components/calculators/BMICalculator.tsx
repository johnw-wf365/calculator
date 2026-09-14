// BMI Calculator — client component
"use client";

import { useState } from "react";
import { calculateBMI } from "@/lib/calculators";

export function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const weightKg = unit === "imperial" ? (parseFloat(weight) || 0) * 0.453592 : parseFloat(weight) || 0;
  const heightCm = unit === "imperial" ? (parseFloat(height) || 0) * 2.54 : parseFloat(height) || 0;
  const result = calculateBMI({ weightKg, heightCm });

  const categoryColors: Record<string, string> = {
    underweight: "text-blue-600",
    normal: "text-green-600",
    overweight: "text-yellow-600",
    obese: "text-red-600",
  };

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Unit System</label>
          <select
            className="input"
            value={unit}
            onChange={(e) => setUnit(e.target.value as "metric" | "imperial")}
          >
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lbs, inches)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Weight ({unit === "metric" ? "kg" : "lbs"})
          </label>
          <input
            type="number"
            className="input"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={`Enter weight in ${unit === "metric" ? "kg" : "lbs"}`}
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">
            Height ({unit === "metric" ? "cm" : "inches"})
          </label>
          <input
            type="number"
            className="input"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={`Enter height in ${unit === "metric" ? "cm" : "inches"}`}
            min="0"
          />
        </div>
      </div>

      {weightKg > 0 && heightCm > 0 && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">BMI</p>
              <p className="text-3xl font-bold">{result.bmi.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className={`text-xl font-semibold capitalize ${categoryColors[result.category]}`}>
                {result.category}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Healthy Weight Range</p>
              <p className="text-sm font-medium">
                {result.healthyWeightRange.min.toFixed(1)} – {result.healthyWeightRange.max.toFixed(1)} {unit === "metric" ? "kg" : "lbs"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
