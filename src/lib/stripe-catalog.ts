import { getStripe } from "@/lib/stripe";
import { parseServicePriceCents } from "@/lib/booking-data";

export type StripeCatalogInput = {
  serviceId: string;
  categoryId: string;
  categoryTitle: string;
  title: string;
  price: string;
  description: string;
};

export function validateCatalogPrice(price: string): number {
  const trimmed = price.trim();
  const cents = parseServicePriceCents(trimmed);
  if (cents <= 0) {
    throw new Error('Price must include a dollar amount (e.g. "$150+" or "$75").');
  }
  return cents;
}

export async function createStripeCatalogEntry(input: StripeCatalogInput) {
  const unitAmount = validateCatalogPrice(input.price);
  const productName = `${input.categoryTitle} — ${input.title}`;

  const product = await getStripe().products.create({
    name: productName,
    description: input.description || undefined,
    metadata: {
      nubian_service_id: input.serviceId,
      category_id: input.categoryId,
      category_title: input.categoryTitle,
      service_title: input.title,
      catalog_price: input.price.trim(),
    },
  });

  const price = await getStripe().prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: "usd",
    metadata: {
      nubian_service_id: input.serviceId,
      catalog_price: input.price.trim(),
    },
  });

  return { productId: product.id, priceId: price.id };
}

export async function createStripePriceForProduct(
  productId: string,
  input: Pick<StripeCatalogInput, "serviceId" | "price">
) {
  const unitAmount = validateCatalogPrice(input.price);

  const price = await getStripe().prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: "usd",
    metadata: {
      nubian_service_id: input.serviceId,
      catalog_price: input.price.trim(),
    },
  });

  return price.id;
}

export async function archiveStripePrice(priceId: string) {
  try {
    await getStripe().prices.update(priceId, { active: false });
  } catch {
    // Price may already be inactive or removed.
  }
}

export async function updateStripeProductDetails(
  productId: string,
  input: { name: string; description: string; catalogPrice: string; title: string }
) {
  await getStripe().products.update(productId, {
    name: input.name,
    description: input.description || undefined,
    metadata: {
      service_title: input.title,
      catalog_price: input.catalogPrice,
    },
  });
}
