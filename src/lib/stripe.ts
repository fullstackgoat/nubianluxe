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

export const DEPOSIT_AMOUNT = 4400; // $44.00 in cents

export const TIER_FEES: Record<string, number> = {
  REGULAR: 0,
  PREMIUM: 2500, // $25.00
  VIP: 5000,     // $50.00
};

// Stripe catalog IDs (LIVE mode, account acct_1TU8d7BMtUlbX58I — Nubian Luxe Braiding Lounge).
// Deposit + tier fees are fixed products. Each price list service has its own
// Product + Price in Stripe (see PriceListService.stripeProductId / stripePriceId).
// Run `npx tsx scripts/sync-stripe-catalog.ts` to create/link service products.
export const STRIPE_PRODUCT_IDS = {
  DEPOSIT:          "prod_UT66BvdcYxutex",
  PREMIUM_TIER_FEE: "prod_UT66RnjCvazWSv",
  VIP_TIER_FEE:     "prod_UT66rm8DgaWk1K",
} as const;

// Deposit + tier fee price IDs — set in .env per mode (test vs live).
// Run `npx tsx scripts/setup-stripe-mode.ts` after switching STRIPE_SECRET_KEY.
export const STRIPE_PRICE_IDS = {
  DEPOSIT:
    process.env.STRIPE_DEPOSIT_PRICE_ID ?? "price_1TU9uGBMtUlbX58IU2RdWvpR",
  PREMIUM_TIER_FEE:
    process.env.STRIPE_PREMIUM_TIER_PRICE_ID ?? "price_1TU9uGBMtUlbX58InGBSRdNt",
  VIP_TIER_FEE:
    process.env.STRIPE_VIP_TIER_PRICE_ID ?? "price_1TU9uHBMtUlbX58IK6Er3OOC",
} as const;

export function isStripeTestMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
}

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
