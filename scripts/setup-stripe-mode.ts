/**
 * Sets up Stripe catalog for whichever mode your STRIPE_SECRET_KEY is in (test or live).
 * Creates deposit + tier fee products/prices, then re-links all price list services.
 *
 * Run: npx tsx scripts/setup-stripe-mode.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import Stripe from "stripe";
import { parseServicePriceCents } from "../src/lib/booking-data";
import { getServiceDuration } from "../src/lib/service-durations";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

async function createProductWithPrice(
  name: string,
  description: string,
  unitAmount: number,
  metadata: Record<string, string> = {}
) {
  const product = await stripe.products.create({ name, description, metadata });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: "usd",
  });
  return { product, price };
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const mode = key.startsWith("sk_test_") ? "TEST" : key.startsWith("sk_live_") ? "LIVE" : "UNKNOWN";
  console.log(`Stripe mode: ${mode}\n`);

  if (mode === "UNKNOWN") {
    throw new Error("Set STRIPE_SECRET_KEY in .env before running this script.");
  }

  console.log("Creating deposit + tier fee products…");
  const deposit = await createProductWithPrice(
    "Booking Deposit",
    "Nubian Luxe appointment booking deposit ($100, applied toward service balance)",
    10000,
    { type: "deposit" }
  );
  const premium = await createProductWithPrice(
    "Premium Booking Tier Fee",
    "Nubian Luxe Premium tier scheduling fee ($25, non-refundable)",
    2500,
    { type: "premium_tier_fee" }
  );
  const vip = await createProductWithPrice(
    "VIP Booking Tier Fee",
    "Nubian Luxe VIP tier scheduling fee ($50, non-refundable)",
    5000,
    { type: "vip_tier_fee" }
  );

  console.log("\nClearing existing service Stripe IDs (re-syncing for current mode)…");
  await prisma.priceListService.updateMany({
    data: { stripeProductId: null, stripePriceId: null },
  });

  const services = await prisma.priceListService.findMany({
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });

  for (const service of services) {
    const productName = `${service.category.title} — ${service.title}`;
    const unitAmount = parseServicePriceCents(service.price);

    const product = await stripe.products.create({
      name: productName,
      description: service.description,
      metadata: {
        nubian_service_id: service.id,
        category_id: service.categoryId,
        service_title: service.title,
        catalog_price: service.price,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: "usd",
      metadata: { nubian_service_id: service.id, catalog_price: service.price },
    });

    await prisma.priceListService.update({
      where: { id: service.id },
      data: {
        stripeProductId: product.id,
        stripePriceId: price.id,
        duration: getServiceDuration(service.categoryId, service.title),
        bookingUrl: `/book?serviceId=${service.id}`,
      },
    });

    console.log(`✓ ${productName}`);
  }

  console.log("\n── Add/update these in .env ──");
  console.log(`STRIPE_DEPOSIT_PRICE_ID=${deposit.price.id}`);
  console.log(`STRIPE_PREMIUM_TIER_PRICE_ID=${premium.price.id}`);
  console.log(`STRIPE_VIP_TIER_PRICE_ID=${vip.price.id}`);
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
