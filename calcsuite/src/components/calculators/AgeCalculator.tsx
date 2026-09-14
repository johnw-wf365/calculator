// Age Calculator — client component
"use client";

import { useState } from "react";
import { calculateAge } from "@/lib/calculators";

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [asOfDate, setAsOfDate] = useState("");

  const result = birthDate
    ? calculateAge({
        birthDate: new Date(birthDate),
        asOfDate: asOfDate ? new Date(asOfDate) : new Date(),
      })
    : null;

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Birth Date</label>
          <input
            type="date"
            className="input"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            As of Date (optional — defaults to today)
          </label>
          <input
            type="date"
            className="input"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
          />
        </div>
      </div>

      {result && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="text-3xl font-bold">
                {result.years} <span className="text-lg">years</span>
              </p>
              <p className="text-sm text-gray-500">
                {result.months} months, {result.days} days
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-bold">{result.totalDays.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Birthday</p>
              <p className="text-lg font-semibold">
                {result.nextBirthday.toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {result.daysUntilNextBirthday} days away
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
