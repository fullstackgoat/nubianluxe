import { getBookingUrlForService } from "@/lib/booking-services";
import type { PriceListCategoryWithServices } from "@/lib/price-list-data";

export type FooterServiceLink = {
  label: string;
  href: string;
};

export function toFooterServices(
  categories: PriceListCategoryWithServices[]
): FooterServiceLink[] {
  return categories.flatMap((category) =>
    category.services.map((service) => ({
      label: service.title,
      href: getBookingUrlForService(service.id),
    }))
  );
}
