import { prisma } from "@/lib/prisma";
import { getServiceDuration } from "@/lib/service-durations";
import { createStripeCatalogEntry } from "@/lib/stripe-catalog";
import { isStripeTestMode } from "@/lib/stripe";

export type StripeCatalogSyncResult = {
  mode: "TEST" | "LIVE";
  synced: number;
  skipped: number;
  failed: number;
  total: number;
  done: boolean;
  nextOffset: number | null;
  services: Array<{ title: string; productId: string; priceId: string }>;
  errors: Array<{ title: string; message: string }>;
};

export async function resyncAllPriceListServices(
  options: { force?: boolean; offset?: number; limit?: number } = {}
): Promise<StripeCatalogSyncResult> {
  const force = options.force ?? false;
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 999;
  const mode = isStripeTestMode() ? "TEST" : "LIVE";

  const services = await prisma.priceListService.findMany({
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });

  if (force && offset === 0) {
    await prisma.priceListService.updateMany({
      data: { stripeProductId: null, stripePriceId: null },
    });
  }

  const batch = services.slice(offset, offset + limit);
  const linked: StripeCatalogSyncResult["services"] = [];
  const errors: StripeCatalogSyncResult["errors"] = [];
  let skipped = 0;

  for (const service of batch) {
    const duration = getServiceDuration(service.categoryId, service.title);
    const bookingUrl = `/book?serviceId=${service.id}`;
    const label = `${service.category.title} — ${service.title}`;

    try {
      if (!force && service.stripeProductId && service.stripePriceId) {
        await prisma.priceListService.update({
          where: { id: service.id },
          data: { duration, bookingUrl },
        });
        skipped += 1;
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

      linked.push({
        title: label,
        productId: stripe.productId,
        priceId: stripe.priceId,
      });
    } catch (err) {
      errors.push({
        title: label,
        message: err instanceof Error ? err.message : "Stripe sync failed",
      });
    }
  }

  const nextOffset = offset + limit < services.length ? offset + limit : null;

  return {
    mode,
    synced: linked.length,
    skipped,
    failed: errors.length,
    total: services.length,
    done: nextOffset === null,
    nextOffset,
    services: linked,
    errors,
  };
}
