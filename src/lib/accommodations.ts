import { prisma } from "@/lib/prisma";
import { DEFAULT_ACCOMMODATIONS } from "@/lib/accommodations-data";

export async function getAccommodations() {
  const count = await prisma.accommodation.count();
  if (count === 0) {
    await prisma.accommodation.createMany({
      data: DEFAULT_ACCOMMODATIONS,
    });
  }

  return prisma.accommodation.findMany({
    orderBy: { sortOrder: "asc" },
  });
}
