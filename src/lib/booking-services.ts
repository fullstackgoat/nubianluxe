import type { PriceListCategoryWithServices } from "@/lib/price-list-data";

export type BookingCatalogItem = {
  id: string;
  name: string;
  price: string;
  duration: number;
  stripeProductId: string | null;
  stripePriceId: string | null;
};

export type BookingCatalogCategory = {
  id: string;
  category: string;
  items: BookingCatalogItem[];
};

export function toBookingCatalog(
  categories: PriceListCategoryWithServices[]
): BookingCatalogCategory[] {
  return categories.map((category) => ({
    id: category.id,
    category: category.title,
    items: category.services.map((service) => ({
      id: service.id,
      name: service.title,
      price: service.price,
      duration: service.duration,
      stripeProductId: service.stripeProductId,
      stripePriceId: service.stripePriceId,
    })),
  }));
}

export function findBookingService(
  categories: BookingCatalogCategory[],
  serviceId: string | null
) {
  if (!serviceId) return null;

  for (const category of categories) {
    const service = category.items.find((item) => item.id === serviceId);
    if (service) {
      return { category, service };
    }
  }

  return null;
}

export function getBookingUrlForService(serviceId: string): string {
  return `/book?serviceId=${serviceId}`;
}
