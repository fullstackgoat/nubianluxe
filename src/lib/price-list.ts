import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PRICE_LIST_CATEGORIES,
  type PriceListCategoryWithServices,
} from "@/lib/price-list-data";
import { parseBulletPoints } from "@/lib/price-list-bullets";
import { getServiceDuration } from "@/lib/service-durations";
import { markDbUnavailable, shouldSkipDb } from "@/lib/db-health";

function mapCategories(
  categories: Awaited<
    ReturnType<typeof prisma.serviceCategory.findMany<{ include: { services: true } }>>
  >
): PriceListCategoryWithServices[] {
  return categories.map((category) => ({
    ...category,
    services: category.services.map((service) => ({
      ...service,
      bulletPoints: parseBulletPoints(service.bulletPoints),
    })),
  }));
}

function fallbackPriceListCategories(): PriceListCategoryWithServices[] {
  return DEFAULT_PRICE_LIST_CATEGORIES.map((category) => ({
    id: category.id,
    title: category.title,
    accent: category.accent,
    sortOrder: category.sortOrder,
    services: category.services.map((service, index) => ({
      id: `fallback-${category.id}-${index}`,
      categoryId: category.id,
      title: service.title,
      price: service.price,
      description: service.description,
      bulletPoints: service.bulletPoints,
      bookingUrl: service.bookingUrl,
      duration: getServiceDuration(category.id, service.title),
      stripeProductId: null,
      stripePriceId: null,
      sortOrder: index,
    })),
  }));
}

export async function getPriceListCategories(): Promise<PriceListCategoryWithServices[]> {
  if (shouldSkipDb()) return fallbackPriceListCategories();

  try {
    const count = await prisma.serviceCategory.count();
    if (count === 0) {
      for (const category of DEFAULT_PRICE_LIST_CATEGORIES) {
        await prisma.serviceCategory.create({
          data: {
            id: category.id,
            title: category.title,
            accent: category.accent,
            sortOrder: category.sortOrder,
            services: {
              create: category.services.map((service, index) => ({
                title: service.title,
                price: service.price,
                description: service.description,
                bookingUrl: service.bookingUrl,
                duration: getServiceDuration(category.id, service.title),
                sortOrder: index,
              })),
            },
          },
        });
      }
    }

    return mapCategories(
      await prisma.serviceCategory.findMany({
        include: {
          services: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      })
    );
  } catch (err) {
    markDbUnavailable();
    console.error("Price list DB unavailable, using defaults:", err);
    return fallbackPriceListCategories();
  }
}
