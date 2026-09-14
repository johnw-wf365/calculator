"use client";

import { adsensePublisherId, adsenseEnabled } from "@/config/adsense";

export default function AdSenseScript() {
  if (!adsenseEnabled) return null;

  return (
    <script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`}
      crossOrigin="anonymous"
    />
  );
}