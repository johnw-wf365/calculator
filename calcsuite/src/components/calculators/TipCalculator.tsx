// Tip Calculator — client component
"use client";

import { useState } from "react";
import { calculateTip } from "@/lib/calculators";

export function TipCalculator() {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState("15");
  const [numberOfPeople, setNumberOfPeople] = useState("1");

  const result = calculateTip({
    billAmount: parseFloat(billAmount) || 0,
    tipPercentage: parseFloat(tipPercentage) || 0,
    numberOfPeople: parseInt(numberOfPeople) || 1,
  });

  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Bill Amount
          </label>
          <input
            type="number"
            className="input"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            placeholder="Enter bill amount"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Tip Percentage
          </label>
          <input
            type="number"
            className="input"
            value={tipPercentage}
            onChange={(e) => setTipPercentage(e.target.value)}
            min="0"
            max="100"
            step="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of People
          </label>
          <input
            type="number"
            className="input"
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(e.target.value)}
            min="1"
            step="1"
          />
        </div>
      </div>

      {parseFloat(billAmount) > 0 && (
        <div className="result-highlight mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tip Amount</p>
              <p className="text-2xl font-bold">
                ${result.tipAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">
                ${result.totalAmount.toFixed(2)}
              </p>
            </div>
            {parseInt(numberOfPeople) > 1 && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Per Person</p>
                  <p className="text-xl font-semibold">
                    ${result.perPerson.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tip Per Person</p>
                  <p className="text-xl font-semibold">
                    ${(result.tipAmount / (parseInt(numberOfPeople) || 1)).toFixed(2)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
