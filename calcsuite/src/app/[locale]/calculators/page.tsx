// Calculators listing page
import Link from "next/link";
import { calculators } from "@/config/calculators";

export default function CalculatorsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Calculators</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calculators.map((calc) => (
          <Link
            key={calc.slug}
            href={`/${calc.slug}`}
            className="card hover:border-blue-300 transition-colors"
          >
            <h2 className="font-semibold text-lg">{calc.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{calc.description}</p>
            <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {calc.category}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
