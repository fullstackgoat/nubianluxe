/**
 * One-time / on-demand sync: creates a Stripe Product + Price for each PriceListService
 * that doesn't have stripeProductId yet. Uses the same Stripe account as the MCP server
 * (acct_1TU8d7BMtUlbX58I — Nubian Luxe Braiding Lounge).
 *
 * Run: npx tsx scripts/sync-stripe-catalog.ts
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

async function main() {
  const services = await prisma.priceListService.findMany({
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });

  console.log(`Found ${services.length} price list services.`);

  for (const service of services) {
    const duration = getServiceDuration(service.categoryId, service.title);
    const bookingUrl = `/book?serviceId=${service.id}`;

    if (service.stripeProductId && service.stripePriceId) {
      await prisma.priceListService.update({
        where: { id: service.id },
        data: { duration, bookingUrl },
      });
      console.log(`✓ Skip (already synced): ${service.category.title} — ${service.title}`);
      continue;
    }

    const productName = `${service.category.title} — ${service.title}`;
    const unitAmount = parseServicePriceCents(service.price);

    const product = await stripe.products.create({
      name: productName,
      description: service.description,
      metadata: {
        nubian_service_id: service.id,
        category_id: service.categoryId,
        category_title: service.category.title,
        service_title: service.title,
        catalog_price: service.price,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: "usd",
      metadata: {
        nubian_service_id: service.id,
        catalog_price: service.price,
      },
    });

    await prisma.priceListService.update({
      where: { id: service.id },
      data: {
        stripeProductId: product.id,
        stripePriceId: price.id,
        duration,
        bookingUrl,
      },
    });

    console.log(`✓ Created ${productName}`);
    console.log(`  product: ${product.id}`);
    console.log(`  price:   ${price.id} ($${(unitAmount / 100).toFixed(2)})`);
  }

  console.log("\nDone — all services linked to Stripe.");
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
