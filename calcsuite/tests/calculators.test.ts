// Calculator unit tests
import { describe, it, expect } from "vitest";
import {
  calculateTip,
  calculatePercentage,
  calculateBMI,
  calculateAge,
  calculateLoan,
  calculateSalary,
  calculateMortgage,
  calculateRetirement,
  calculateIncomeTax,
} from "../src/lib/calculators";

describe("Tip Calculator", () => {
  it("calculates a 15% tip on $100 for 1 person", () => {
    const result = calculateTip({ billAmount: 100, tipPercentage: 15, numberOfPeople: 1 });
    expect(result.tipAmount).toBeCloseTo(15);
    expect(result.totalAmount).toBeCloseTo(115);
    expect(result.perPerson).toBeCloseTo(115);
  });

  it("splits a $200 bill with 20% tip among 4 people", () => {
    const result = calculateTip({ billAmount: 200, tipPercentage: 20, numberOfPeople: 4 });
    expect(result.tipAmount).toBeCloseTo(40);
    expect(result.totalAmount).toBeCloseTo(240);
    expect(result.perPerson).toBeCloseTo(60);
  });
});

describe("Percentage Calculator", () => {
  it("calculates 25% of 200", () => {
    const result = calculatePercentage({ value: 200, percentage: 25 });
    expect(result.result).toBeCloseTo(50);
  });

  it("calculates what percent 30 is of 150", () => {
    const result = calculatePercentage({ value: 30, percentage: 0 }, 150);
    expect(result.isWhatPercentOf).toBeCloseTo(20);
  });
});

describe("BMI Calculator", () => {
  it("calculates normal BMI for 70kg, 175cm", () => {
    const result = calculateBMI({ weightKg: 70, heightCm: 175 });
    expect(result.bmi).toBeCloseTo(22.86, 1);
    expect(result.category).toBe("normal");
  });

  it("categorizes underweight BMI", () => {
    const result = calculateBMI({ weightKg: 50, heightCm: 175 });
    expect(result.bmi).toBeLessThan(18.5);
    expect(result.category).toBe("underweight");
  });
});

describe("Age Calculator", () => {
  it("calculates age for birth date 1990-01-01 as of 2024-01-01", () => {
    const result = calculateAge({
      birthDate: new Date(1990, 0, 1),
      asOfDate: new Date(2024, 0, 1),
    });
    expect(result.years).toBe(34);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  });
});

describe("Loan Calculator", () => {
  it("calculates monthly payment for $300k at 6% over 30 years", () => {
    const result = calculateLoan({
      principal: 300000,
      annualRate: 6,
      termMonths: 360,
    });
    expect(result.monthlyPayment).toBeCloseTo(1798.65, 0);
    expect(result.totalInterest).toBeGreaterThan(300000);
  });
});

describe("Salary Calculator", () => {
  it("calculates monthly take-home for $120k at 25% tax", () => {
    const result = calculateSalary({
      annualSalary: 120000,
      payFrequency: "monthly",
      taxRate: 25,
    });
    expect(result.grossPay).toBeCloseTo(10000);
    expect(result.netPay).toBeCloseTo(7500);
    expect(result.annualNet).toBeCloseTo(90000);
  });
});

describe("Mortgage Calculator", () => {
  it("calculates mortgage with PITI", () => {
    const result = calculateMortgage({
      homePrice: 500000,
      downPayment: 100000,
      annualRate: 6,
      termYears: 30,
    });
    expect(result.loanAmount).toBe(400000);
    expect(result.monthlyTotal).toBeGreaterThan(result.monthlyPrincipalInterest);
    expect(result.monthlyPropertyTax).toBeGreaterThan(0);
  });
});

describe("Retirement Calculator", () => {
  it("calculates compound growth over 30 years", () => {
    const result = calculateRetirement({
      currentAge: 35,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 500,
      annualReturn: 7,
    });
    expect(result.yearsToRetirement).toBe(30);
    expect(result.futureValue).toBeGreaterThan(50000);
    expect(result.totalInterestEarned).toBeGreaterThan(0);
  });
});

describe("Income Tax Calculator", () => {
  it("calculates US tax for $100k income", () => {
    const result = calculateIncomeTax({
      annualIncome: 100000,
      country: "US",
      deductions: 0,
    });
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.netIncome).toBeCloseTo(100000 - result.totalTax);
  });

  it("calculates UK tax for £50k income", () => {
    const result = calculateIncomeTax({
      annualIncome: 50000,
      country: "UK",
      deductions: 0,
    });
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeGreaterThan(0);
  });
});
