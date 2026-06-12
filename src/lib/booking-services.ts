import type { PriceListCategoryWithServices } from "@/lib/price-list-data";
import type { PriceListBulletPoint, SelectedServiceOption } from "@/lib/price-list-bullets";
import { computeServiceSelectionTotals } from "@/lib/price-list-bullets";
import { parseServicePriceCents } from "@/lib/booking-data";

export const ADD_ON_SERVICES_CATEGORY_TITLE = "Add-On Services";

export type SelectedAddOnService = {
  id: string;
  name: string;
  price: string;
  priceCents: number;
  duration: number;
};

export type BookingServicePricing = {
  baseServicePrice: string;
  baseServicePriceCents: number;
  baseDuration: number;
  serviceBulletPoints: PriceListBulletPoint[];
  selectedBulletIndices: number[];
  selectedServiceOptions: SelectedServiceOption[];
  servicePrice: string;
  servicePriceCents: number;
  duration: number;
  selectedAddOnServiceIds: string[];
  selectedAddOnServices: SelectedAddOnService[];
};

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

export function findAddOnServicesCategory(catalog: BookingCatalogCategory[]) {
  return catalog.find((category) => category.category === ADD_ON_SERVICES_CATEGORY_TITLE) ?? null;
}

export function isAddOnServicesBooking(
  serviceCategory: string,
  serviceCategoryId: string,
  catalog: BookingCatalogCategory[]
) {
  const category = catalog.find((item) => item.id === serviceCategoryId);
  return (
    category?.category === ADD_ON_SERVICES_CATEGORY_TITLE ||
    serviceCategory === ADD_ON_SERVICES_CATEGORY_TITLE
  );
}

export function shouldShowAddOnServicesStep(
  catalog: BookingCatalogCategory[],
  serviceCategoryId: string,
  serviceCategory: string
) {
  if (isAddOnServicesBooking(serviceCategory, serviceCategoryId, catalog)) return false;
  const addOnCategory = findAddOnServicesCategory(catalog);
  return !!addOnCategory && addOnCategory.items.length > 0;
}

export function buildSelectedAddOnServices(
  catalog: BookingCatalogCategory[],
  selectedIds: string[]
): SelectedAddOnService[] {
  const addOnCategory = findAddOnServicesCategory(catalog);
  if (!addOnCategory) return [];

  return selectedIds
    .map((id) => addOnCategory.items.find((item) => item.id === id))
    .filter((item): item is BookingCatalogItem => !!item)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      priceCents: parseServicePriceCents(item.price),
      duration: item.duration,
    }));
}

export function formatSelectedAddOnServices(addOns: SelectedAddOnService[]): string {
  if (addOns.length === 0) return "";
  return addOns.map((addOn) => `${addOn.name} (${addOn.price})`).join(", ");
}

export function mergeBookingPricingWithAddOns(
  base: Omit<BookingServicePricing, "selectedAddOnServiceIds" | "selectedAddOnServices">,
  addOns: SelectedAddOnService[]
): BookingServicePricing {
  if (addOns.length === 0) {
    return {
      ...base,
      selectedAddOnServiceIds: [],
      selectedAddOnServices: [],
    };
  }

  const addOnCents = addOns.reduce((sum, addOn) => sum + addOn.priceCents, 0);
  const addOnDuration = addOns.reduce((sum, addOn) => sum + addOn.duration, 0);
  const totalCents = base.servicePriceCents + addOnCents;
  const totalDuration = base.duration + addOnDuration;
  const hasPlus =
    base.servicePrice.includes("+") ||
    base.baseServicePrice.includes("+") ||
    addOns.some((addOn) => addOn.price.includes("+"));

  return {
    ...base,
    servicePrice: `$${(totalCents / 100).toFixed(0)}${hasPlus ? "+" : ""}`,
    servicePriceCents: totalCents,
    duration: totalDuration,
    selectedAddOnServiceIds: addOns.map((addOn) => addOn.id),
    selectedAddOnServices: addOns,
  };
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
): BookingServicePricing {
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

  return mergeBookingPricingWithAddOns(
    {
      baseServicePrice,
      baseServicePriceCents,
      baseDuration,
      serviceBulletPoints: item.bulletPoints,
      selectedBulletIndices,
      selectedServiceOptions: totals.selectedOptions,
      servicePrice: totals.servicePriceLabel,
      servicePriceCents: totals.servicePriceCents,
      duration: totals.duration,
    },
    []
  );
}
