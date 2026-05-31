import { prisma } from "@/lib/prisma";
import { DEFAULT_PRICE_LIST_CATEGORIES, type PriceListCategoryWithServices } from "@/lib/price-list-data";
import { getServiceDuration } from "@/lib/service-durations";

export async function getPriceListCategories(): Promise<PriceListCategoryWithServices[]> {
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
              bulletPoints: service.bulletPoints,
              bookingUrl: service.bookingUrl,
              duration: getServiceDuration(category.id, service.title),
              sortOrder: index,
            })),
          },
        },
      });
    }
  }

  return prisma.serviceCategory.findMany({
    include: {
      services: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

