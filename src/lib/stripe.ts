import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const DEPOSIT_AMOUNT = 10000; // $100.00 in cents

export const TIER_FEES: Record<string, number> = {
  REGULAR: 0,
  PREMIUM: 2500, // $25.00
  VIP: 5000,     // $50.00
};

// Stripe catalog IDs (LIVE mode, account acct_1TU8d7BMtUlbX58I).
// Created via the Stripe MCP — see TODO.md for product/price provenance.
// These are referenced in PaymentIntent metadata so the dashboard can
// attribute revenue to "Booking Deposit" vs "Premium Tier" vs "VIP Tier".
export const STRIPE_PRODUCT_IDS = {
  DEPOSIT:          "prod_UT66BvdcYxutex",
  PREMIUM_TIER_FEE: "prod_UT66RnjCvazWSv",
  VIP_TIER_FEE:     "prod_UT66rm8DgaWk1K",
} as const;

export const STRIPE_PRICE_IDS = {
  DEPOSIT:          "price_1TU9uGBMtUlbX58IU2RdWvpR", // $100.00 one-time
  PREMIUM_TIER_FEE: "price_1TU9uGBMtUlbX58InGBSRdNt", // $25.00 one-time
  VIP_TIER_FEE:     "price_1TU9uHBMtUlbX58IK6Er3OOC", // $50.00 one-time
} as const;

export type Tier = "REGULAR" | "PREMIUM" | "VIP";

export function getTierPriceId(tier: Tier): string | null {
  if (tier === "PREMIUM") return STRIPE_PRICE_IDS.PREMIUM_TIER_FEE;
  if (tier === "VIP")     return STRIPE_PRICE_IDS.VIP_TIER_FEE;
  return null;
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
