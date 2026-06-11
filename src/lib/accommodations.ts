import { prisma } from "@/lib/prisma";
import { DEFAULT_ACCOMMODATIONS } from "@/lib/accommodations-data";
import { markDbUnavailable, shouldSkipDb } from "@/lib/db-health";
import type { Accommodation } from "@/generated/prisma/client";

function fallbackAccommodations(): Accommodation[] {
  return DEFAULT_ACCOMMODATIONS.map((item, index) => ({
    id: `fallback-accommodation-${index}`,
    title: item.title,
    icon: item.icon,
    bulletPoints: item.bulletPoints,
    sortOrder: item.sortOrder,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  }));
}

export async function getAccommodations(): Promise<Accommodation[]> {
  if (shouldSkipDb()) return fallbackAccommodations();

  try {
    const count = await prisma.accommodation.count();
    if (count === 0) {
      await prisma.accommodation.createMany({
        data: DEFAULT_ACCOMMODATIONS,
      });
    }

    return prisma.accommodation.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch (err) {
    markDbUnavailable();
    console.error("Accommodations DB unavailable, using defaults:", err);
    return fallbackAccommodations();
  }
}
