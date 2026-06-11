import type { PriceListCategoryWithServices } from "@/lib/price-list-data";
import type { PriceListBulletPoint, SelectedServiceOption } from "@/lib/price-list-bullets";
import { computeServiceSelectionTotals } from "@/lib/price-list-bullets";
import { parseServicePriceCents } from "@/lib/booking-data";

export type BookingCatalogItem = {
  id: string;
  name: string;
  price: string;
  duration: number;
  bulletPoints: PriceListBulletPoint[];
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
      bulletPoints: service.bulletPoints,
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

export function getBookingUrlForService(
  serviceId: string,
  selectedBulletIndices: number[] = []
): string {
  const params = new URLSearchParams({ serviceId });
  if (selectedBulletIndices.length > 0) {
    params.set("bullets", selectedBulletIndices.join(","));
  }
  return `/book?${params.toString()}`;
}

export function parseBulletIndicesFromParam(value: string | null): number[] {
  if (!value?.trim()) return [];

  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((index) => Number.isInteger(index) && index >= 0);
}

export function buildBookingServicePricing(
  item: BookingCatalogItem,
  selectedBulletIndices: number[]
) {
  const baseServicePrice = item.price;
  const baseServicePriceCents = parseServicePriceCents(item.price);
  const baseDuration = item.duration;

  const totals = computeServiceSelectionTotals({
    basePriceCents: baseServicePriceCents,
    basePriceLabel: baseServicePrice,
    baseDuration,
    bulletPoints: item.bulletPoints,
    selectedIndices: selectedBulletIndices,
  });

  return {
    baseServicePrice,
    baseServicePriceCents,
    baseDuration,
    serviceBulletPoints: item.bulletPoints,
    selectedBulletIndices,
    selectedServiceOptions: totals.selectedOptions,
    servicePrice: totals.servicePriceLabel,
    servicePriceCents: totals.servicePriceCents,
    duration: totals.duration,
  };
}
