// Calculator metadata and configuration
export interface CalculatorMeta {
  slug: string;
  name: string;
  description: string;
  category: "finance" | "health" | "math" | "conversion" | "other";
  keywords: string[];
  countries: ("US" | "GB" | "CA" | "AU")[];
}

export const calculators: CalculatorMeta[] = [
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    description: "Calculate tip amount and split bills easily.",
    category: "finance",
    keywords: ["tip", "restaurant", "bill", "split"],
    countries: ["US", "GB", "CA", "AU"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages, percentage change, and more.",
    category: "math",
    keywords: ["percentage", "percent", "increase", "decrease"],
    countries: ["US", "GB", "CA", "AU"],
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate your Body Mass Index (BMI).",
    category: "health",
    keywords: ["bmi", "body mass index", "weight", "height"],
    countries: ["US", "GB", "CA", "AU"],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description: "Calculate your exact age in years, months, and days.",
    category: "other",
    keywords: ["age", "birthday", "born", "years"],
    countries: ["US", "GB", "CA", "AU"],
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    description: "Convert between world currencies with live rates.",
    category: "conversion",
    keywords: ["currency", "exchange", "usd", "gbp", "convert"],
    countries: ["US", "GB", "CA", "AU"],
  },
  {
    slug: "loan-calculator",
    name: "Loan / EMI Calculator",
    description: "Calculate loan payments, interest, and amortization.",
    category: "finance",
    keywords: ["loan", "emi", "interest", "amortization", "principal"],
    countries: ["US", "GB", "CA", "AU"],
  },
  {
    slug: "salary-calculator",
    name: "Salary Calculator",
    description: "Calculate your take-home pay after tax.",
    category: "finance",
    keywords: ["salary", "pay", "income", "take-home", "after tax"],
    countries: ["US", "GB", "CA", "AU"],
  },
  {
    slug: "income-tax-calculator",
    name: "Income Tax Calculator",
    description: "Estimate your income tax for US and UK.",
    category: "finance",
    keywords: ["tax", "income tax", "irs", "hmrc", "federal"],
    countries: ["US", "GB"],
  },
  {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    description: "Calculate monthly mortgage payments and costs.",
    category: "finance",
    keywords: ["mortgage", "home loan", "property", "housing", "interest"],
    countries: ["US", "GB", "CA", "AU"],
  },
  {
    slug: "retirement-calculator",
    name: "Retirement Calculator",
    description: "Plan your retirement savings and income.",
    category: "finance",
    keywords: ["retirement", "401k", "pension", "savings", "4% rule"],
    countries: ["US", "GB", "CA", "AU"],
  },
];

export function getCalculator(slug: string): CalculatorMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}
