// Google AdSense configuration
// Set ADSENSE_PUBLISHER_ID in your environment (e.g., ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456)

export const adsensePublisherId = process.env.ADSENSE_PUBLISHER_ID || "";

export const adsenseEnabled = adsensePublisherId.length > 0;

export interface AdSlotConfig {
  slot: string;
  format: "auto" | "rectangle" | "horizontal" | "vertical";
  fullWidthResponsive: boolean;
}

// Ad slot IDs — these are placeholders; replace with real slot IDs from AdSense dashboard
export const adSlots: Record<string, AdSlotConfig> = {
  calculatorTop: {
    slot: "1234567890",
    format: "auto",
    fullWidthResponsive: true,
  },
  calculatorBottom: {
    slot: "0987654321",
    format: "auto",
    fullWidthResponsive: true,
  },
  homeSidebar: {
    slot: "1122334455",
    format: "rectangle",
    fullWidthResponsive: false,
  },
};
