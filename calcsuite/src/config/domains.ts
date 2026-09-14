// Domain → Locale mapping for multi-market strategy
// A single codebase serves all domains; the middleware reads the Host header
// and rewrites to the correct locale segment.

export interface DomainConfig {
  domain: string;
  locale: string;
  country: "US" | "GB" | "CA" | "AU";
  currency: "USD" | "GBP" | "CAD" | "AUD";
  timezone: string;
  /** Whether tax calculators use country-specific brackets */
  localTaxBrackets: boolean;
}

export const domains: DomainConfig[] = [
  {
    domain: "calculators.com",
    locale: "en-US",
    country: "US",
    currency: "USD",
    timezone: "America/New_York",
    localTaxBrackets: true,
  },
  {
    domain: "calculators.co.uk",
    locale: "en-GB",
    country: "GB",
    currency: "GBP",
    timezone: "Europe/London",
    localTaxBrackets: true,
  },
  {
    domain: "calculators.ca",
    locale: "en-CA",
    country: "CA",
    currency: "CAD",
    timezone: "America/Toronto",
    localTaxBrackets: true,
  },
  {
    domain: "calculators.com.au",
    locale: "en-AU",
    country: "AU",
    currency: "AUD",
    timezone: "Australia/Sydney",
    localTaxBrackets: true,
  },
];

/** Look up the domain config from a hostname, defaulting to US. */
export function resolveDomain(hostname: string): DomainConfig {
  const normalized = hostname.replace(/^www\./, "");
  return (
    domains.find((d) => d.domain === normalized) ??
    domains.find((d) => d.country === "US")!
  );
}

/** All supported locales. */
export const locales = domains.map((d) => d.locale);
export type Locale = (typeof locales)[number];

export const defaultLocale = "en-US";
