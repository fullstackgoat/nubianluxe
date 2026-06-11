import { prisma } from "@/lib/prisma";
import { bulletPointsToDbValue } from "@/lib/price-list-bullets";

export async function persistBulletPoints(serviceId: string, input: unknown) {
  const points = bulletPointsToDbValue(input);
  await prisma.$executeRaw`
    UPDATE "PriceListService"
    SET "bulletPoints" = ${JSON.stringify(points)}::jsonb
    WHERE id = ${serviceId}
  `;
}
