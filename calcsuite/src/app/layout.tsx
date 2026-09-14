import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Free Online Calculators | CalcSuite",
  description:
    "Free online calculators for tax, mortgage, BMI, loan, salary, retirement, and more. Accurate, fast, and easy to use.",
  keywords: [
    "calculator",
    "tax calculator",
    "mortgage calculator",
    "bmi calculator",
    "loan calculator",
    "salary calculator",
    "retirement calculator",
    "percentage calculator",
    "tip calculator",
    "age calculator",
    "currency converter",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CalcSuite",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
