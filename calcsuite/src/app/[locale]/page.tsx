import Link from "next/link";
import { calculators } from "@/config/calculators";

export default function HomePage() {
  const featured = calculators.slice(0, 6);

  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Free Online Calculators
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Accurate, fast, and easy-to-use calculators for finance, health, math,
          and more. No sign-up required for basic use.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/calculators" className="btn btn-primary text-lg">
            Browse All Calculators
          </Link>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">Popular Calculators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((calc) => (
            <Link
              key={calc.slug}
              href={`/${calc.slug}`}
              className="card hover:border-blue-300 transition-colors"
            >
              <h3 className="font-semibold text-lg">{calc.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{calc.description}</p>
              <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {calc.category}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* AdSense placeholder */}
      <div className="my-8 p-4 bg-gray-100 rounded text-center text-gray-400 text-sm">
        {/* Google AdSense will be integrated here */}
        Ad Space
      </div>

      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">All Calculators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {calculators.map((calc) => (
            <Link
              key={calc.slug}
              href={`/${calc.slug}`}
              className="p-3 border border-gray-200 rounded hover:bg-gray-50"
            >
              <span className="font-medium">{calc.name}</span>
              <span className="text-gray-400 mx-2">·</span>
              <span className="text-sm text-gray-500">{calc.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
