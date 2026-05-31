/**
 * One-time / on-demand sync: creates a Stripe Product + Price for each PriceListService
 * that doesn't have stripeProductId yet.
 *
 * Run: npx tsx scripts/sync-stripe-catalog.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { getServiceDuration } from "../src/lib/service-durations";
import { createStripeCatalogEntry } from "../src/lib/stripe-catalog";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

    const stripe = await createStripeCatalogEntry({
      serviceId: service.id,
      categoryId: service.categoryId,
      categoryTitle: service.category.title,
      title: service.title,
      price: service.price,
      description: service.description,
    });

    await prisma.priceListService.update({
      where: { id: service.id },
      data: {
        stripeProductId: stripe.productId,
        stripePriceId: stripe.priceId,
        duration,
        bookingUrl,
      },
    });

    console.log(`✓ Created ${service.category.title} — ${service.title}`);
    console.log(`  product: ${stripe.productId}`);
    console.log(`  price:   ${stripe.priceId}`);
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
