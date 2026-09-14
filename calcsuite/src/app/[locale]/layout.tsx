// Locale-aware layout
import { ReactNode } from "react";
import { locales } from "@/config/domains";
import { Header, Footer } from "@/components/layout";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="container py-8">{children}</main>
      <Footer />
    </>
  );
}
