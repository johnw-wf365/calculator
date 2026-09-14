"use client";

import { useEffect, useRef } from "react";
import { adsensePublisherId, adsenseEnabled, AdSlotConfig } from "@/config/adsense";

interface AdUnitProps {
  config: AdSlotConfig;
  className?: string;
  minHeight?: number;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdUnit({ config, className = "", minHeight = 90 }: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!adsenseEnabled || !containerRef.current || pushedRef.current) return;

    try {
      // Push the ad slot to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // AdSense not loaded or blocked — fail silently
    }
  }, [config.slot]);

  if (!adsenseEnabled) {
    // Render placeholder when AdSense is not configured
    return (
      <div
        ref={containerRef}
        className={`bg-gray-100 rounded text-center text-gray-400 text-sm flex items-center justify-center ${className}`}
        style={{ minHeight }}
        aria-hidden="true"
      >
        Ad Space
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight }}
        data-ad-client={adsensePublisherId}
        data-ad-slot={config.slot}
        data-ad-format={config.format}
        data-full-width-responsive={config.fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}