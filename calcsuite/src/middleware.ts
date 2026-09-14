import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/config/domains";

function getLocaleFromAcceptLanguage(req: NextRequest): string | null {
  const header = req.headers.get("accept-language");
  if (!header) return null;
  const languages = header.split(",").map((l) => {
    const [code, q] = l.trim().split(";q=");
    return { code: code.split("-")[0], q: parseFloat(q) || 1 };
  });
  languages.sort((a, b) => b.q - a.q);
  for (const lang of languages) {
    const match = locales.find((l) => l.startsWith(lang.code));
    if (match) return match;
  }
  return null;
}

/** Route the request to the appropriate locale based on domain or Accept-Language */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Determine locale from domain
  let locale = defaultLocale;

  if (hostname.includes("calculators.co.uk")) {
    locale = "en-GB";
  } else if (hostname.includes("calculators.ca")) {
    locale = "en-CA";
  } else if (hostname.includes("calculators.com.au")) {
    locale = "en-AU";
  } else {
    // Try Accept-Language for unknown domains
    const detected = getLocaleFromAcceptLanguage(request);
    if (detected) locale = detected;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
