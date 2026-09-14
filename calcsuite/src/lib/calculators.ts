// Core calculator logic — pure, locale-aware functions

export interface TipInput {
  billAmount: number;
  tipPercentage: number;
  numberOfPeople: number;
}

export interface TipResult {
  tipAmount: number;
  totalAmount: number;
  perPerson: number;
}

export function calculateTip(input: TipInput): TipResult {
  const { billAmount, tipPercentage, numberOfPeople } = input;
  const tipAmount = billAmount * (tipPercentage / 100);
  const totalAmount = billAmount + tipAmount;
  const perPerson = totalAmount / numberOfPeople;
  return { tipAmount, totalAmount, perPerson };
}

export interface PercentageInput {
  value: number;
  percentage: number;
}

export interface PercentageResult {
  result: number;
  isWhatPercentOf: number;
  percentageChange: number | null;
}

export function calculatePercentage(
  input: PercentageInput,
  baseValue?: number
): PercentageResult {
  const { value, percentage } = input;
  const result = value * (percentage / 100);
  const isWhatPercentOf = baseValue ? (value / baseValue) * 100 : 0;
  const percentageChange =
    baseValue !== undefined ? ((value - baseValue) / baseValue) * 100 : null;
  return { result, isWhatPercentOf, percentageChange };
}

export interface BMIInput {
  weightKg: number;
  heightCm: number;
}

export interface BMIResult {
  bmi: number;
  category: "underweight" | "normal" | "overweight" | "obese";
  healthyWeightRange: { min: number; max: number };
}

export function calculateBMI(input: BMIInput): BMIResult {
  const { weightKg, heightCm } = input;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: BMIResult["category"];
  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal";
  else if (bmi < 30) category = "overweight";
  else category = "obese";

  const healthyWeightRange = {
    min: 18.5 * heightM * heightM,
    max: 24.9 * heightM * heightM,
  };

  return { bmi, category, healthyWeightRange };
}

export interface AgeInput {
  birthDate: Date;
  asOfDate?: Date;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthday: Date;
  daysUntilNextBirthday: number;
}

export function calculateAge(input: AgeInput): AgeResult {
  const { birthDate, asOfDate = new Date() } = input;

  let years = asOfDate.getFullYear() - birthDate.getFullYear();
  let months = asOfDate.getMonth() - birthDate.getMonth();
  let days = asOfDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor(
    (asOfDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const nextBirthday = new Date(
    asOfDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  if (nextBirthday < asOfDate) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  const daysUntilNextBirthday = Math.floor(
    (nextBirthday.getTime() - asOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { years, months, days, totalDays, nextBirthday, daysUntilNextBirthday };
}

export interface LoanInput {
  principal: number;
  annualRate: number;
  termMonths: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function calculateLoan(input: LoanInput): LoanResult {
  const { principal, annualRate, termMonths } = input;
  const monthlyRate = annualRate / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;

  const amortizationSchedule = [];
  let balance = principal;
  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    balance -= principalPaid;
    amortizationSchedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPaid,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return { monthlyPayment, totalPayment, totalInterest, amortizationSchedule };
}

export interface CurrencyAmount {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): CurrencyAmount {
  const fromRate = rates[fromCurrency] ?? 1;
  const toRate = rates[toCurrency] ?? 1;
  const rate = toRate / fromRate;
  return { amount: amount * rate, fromCurrency, toCurrency, rate };
}

export interface SalaryInput {
  annualSalary: number;
  payFrequency: "weekly" | "biweekly" | "monthly" | "annual";
  taxRate: number;
}

export interface SalaryResult {
  grossPay: number;
  taxAmount: number;
  netPay: number;
  annualGross: number;
  annualNet: number;
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  const { annualSalary, payFrequency, taxRate } = input;

  let grossPay: number;
  switch (payFrequency) {
    case "weekly":
      grossPay = annualSalary / 52;
      break;
    case "biweekly":
      grossPay = annualSalary / 26;
      break;
    case "monthly":
      grossPay = annualSalary / 12;
      break;
    case "annual":
      grossPay = annualSalary;
      break;
  }

  const taxAmount = grossPay * (taxRate / 100);
  const netPay = grossPay - taxAmount;
  const annualNet = annualSalary * (1 - taxRate / 100);

  return { grossPay, taxAmount, netPay, annualGross: annualSalary, annualNet };
}

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  annualRate: number;
  termYears: number;
  propertyTaxRate?: number;
  homeInsurance?: number;
  hoaFees?: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyTotal: number;
  totalPayments: number;
  totalInterest: number;
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const {
    homePrice,
    downPayment,
    annualRate,
    termYears,
    propertyTaxRate = 1.2,
    homeInsurance = 100,
    hoaFees = 0,
  } = input;

  const loanAmount = homePrice - downPayment;
  const monthlyRate = annualRate / 100 / 12;
  const termMonths = termYears * 12;

  let monthlyPrincipalInterest: number;
  if (monthlyRate === 0) {
    monthlyPrincipalInterest = loanAmount / termMonths;
  } else {
    monthlyPrincipalInterest =
      (loanAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = homeInsurance;
  const monthlyHOA = hoaFees;
  const monthlyTotal =
    monthlyPrincipalInterest +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyHOA;

  const totalPayments = monthlyPrincipalInterest * termMonths;
  const totalInterest = totalPayments - loanAmount;

  return {
    loanAmount,
    monthlyPrincipalInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyHOA,
    monthlyTotal,
    totalPayments,
    totalInterest,
  };
}

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturn: number;
  inflationRate?: number;
}

export interface RetirementResult {
  yearsToRetirement: number;
  futureValue: number;
  totalContributions: number;
  totalInterestEarned: number;
  monthlyRetirementIncome: number;
  inflationAdjustedValue: number;
}

export function calculateRetirement(input: RetirementInput): RetirementResult {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    annualReturn,
    inflationRate = 2.5,
  } = input;

  const yearsToRetirement = retirementAge - currentAge;
  const months = yearsToRetirement * 12;
  const monthlyRate = annualReturn / 100 / 12;

  // Future value of current savings
  const fvCurrentSavings =
    currentSavings * Math.pow(1 + monthlyRate, months);

  // Future value of monthly contributions
  const fvContributions =
    monthlyRate === 0
      ? monthlyContribution * months
      : (monthlyContribution *
          (Math.pow(1 + monthlyRate, months) - 1)) /
        monthlyRate;

  const futureValue = fvCurrentSavings + fvContributions;
  const totalContributions = currentSavings + monthlyContribution * months;
  const totalInterestEarned = futureValue - totalContributions;

  // 4% rule for retirement income
  const monthlyRetirementIncome = (futureValue * 0.04) / 12;

  // Inflation-adjusted value
  const inflationAdjustedValue =
    futureValue / Math.pow(1 + inflationRate / 100, yearsToRetirement);

  return {
    yearsToRetirement,
    futureValue,
    totalContributions,
    totalInterestEarned,
    monthlyRetirementIncome,
    inflationAdjustedValue,
  };
}

// Income Tax — US 2024 brackets (single filer)
const US_TAX_BRACKETS_2024 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// UK 2024/25 tax bands
const UK_TAX_BANDS_2024 = [
  { min: 0, max: 12570, rate: 0 },
  { min: 12570, max: 50270, rate: 0.20 },
  { min: 50270, max: 125140, rate: 0.40 },
  { min: 125140, max: Infinity, rate: 0.45 },
];

export interface TaxInput {
  annualIncome: number;
  country: "US" | "UK";
  deductions?: number;
}

export interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  netIncome: number;
  taxByBracket: Array<{ bracket: string; tax: number }>;
}

export function calculateIncomeTax(input: TaxInput): TaxResult {
  const { annualIncome, country, deductions = 0 } = input;
  const taxableIncome = Math.max(0, annualIncome - deductions);

  const brackets = country === "US" ? US_TAX_BRACKETS_2024 : UK_TAX_BANDS_2024;

  let totalTax = 0;
  let marginalRate = 0;
  const taxByBracket: TaxResult["taxByBracket"] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const tax = incomeInBracket * bracket.rate;
    totalTax += tax;
    marginalRate = bracket.rate;
    taxByBracket.push({
      bracket: `${bracket.min.toLocaleString()}-${bracket.max === Infinity ? "+" : bracket.max.toLocaleString()}`,
      tax,
    });
  }

  const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;
  const netIncome = annualIncome - totalTax;

  return {
    grossIncome: annualIncome,
    taxableIncome,
    totalTax,
    effectiveRate,
    marginalRate,
    netIncome,
    taxByBracket,
  };
}
