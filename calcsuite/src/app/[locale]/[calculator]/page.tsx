// Dynamic calculator page — renders the appropriate calculator based on slug
import { notFound } from "next/navigation";
import { calculators } from "@/config/calculators";
import { TipCalculator } from "@/components/calculators/TipCalculator";
import { PercentageCalculator } from "@/components/calculators/PercentageCalculator";
import { BMICalculator } from "@/components/calculators/BMICalculator";
import { AgeCalculator } from "@/components/calculators/AgeCalculator";
import { CurrencyConverter } from "@/components/calculators/CurrencyConverter";
import { LoanCalculator } from "@/components/calculators/LoanCalculator";
import { SalaryCalculator } from "@/components/calculators/SalaryCalculator";
import { IncomeTaxCalculator } from "@/components/calculators/IncomeTaxCalculator";
import { MortgageCalculator } from "@/components/calculators/MortgageCalculator";
import { RetirementCalculator } from "@/components/calculators/RetirementCalculator";
import { FreemiumGate } from "@/components/FreemiumGate";
import AdUnit from "@/components/AdUnit";
import { adSlots } from "@/config/adsense";

const calculatorComponents: Record<string, React.ComponentType> = {
  "tip-calculator": TipCalculator,
  "percentage-calculator": PercentageCalculator,
  "bmi-calculator": BMICalculator,
  "age-calculator": AgeCalculator,
  "currency-converter": CurrencyConverter,
  "loan-calculator": LoanCalculator,
  "salary-calculator": SalaryCalculator,
  "income-tax-calculator": IncomeTaxCalculator,
  "mortgage-calculator": MortgageCalculator,
  "retirement-calculator": RetirementCalculator,
};

export function generateStaticParams() {
  return calculators.map((calc) => ({ calculator: calc.slug }));
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ calculator: string }>;
}) {
  const { calculator } = await params;
  const meta = calculators.find((c) => c.slug === calculator);

  if (!meta) notFound();

  const CalculatorComponent = calculatorComponents[calculator];
  if (!CalculatorComponent) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{meta.name}</h1>
      <p className="text-gray-600 mb-6">{meta.description}</p>

      {/* AdSense top banner */}
      <AdUnit config={adSlots.calculatorTop} className="my-4" minHeight={120} />

      <FreemiumGate calculatorSlug={calculator}>
        <CalculatorComponent />
      </FreemiumGate>

      {/* AdSense bottom banner */}
      <AdUnit config={adSlots.calculatorBottom} className="my-8" minHeight={120} />
    </div>
  );
}
