export type PriceListBulletPoint = {
  label: string;
  duration: number | null;
  cost: string | null;
};

export const EMPTY_BULLET_POINT: PriceListBulletPoint = {
  label: "",
  duration: null,
  cost: null,
};

export function parseBulletPoints(raw: unknown): PriceListBulletPoint[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    if (typeof item === "string") {
      return {
        label: item,
        duration: null,
        cost: null,
      };
    }

    if (item && typeof item === "object") {
      const point = item as Record<string, unknown>;
      const durationValue = point.duration;
      const parsedDuration =
        typeof durationValue === "number" && durationValue > 0
          ? durationValue
          : typeof durationValue === "string" && durationValue.trim()
            ? Math.max(1, Number(durationValue) || 0) || null
            : null;

      return {
        label: typeof point.label === "string" ? point.label : "",
        duration: parsedDuration,
        cost:
          typeof point.cost === "string" && point.cost.trim()
            ? point.cost.trim()
            : null,
      };
    }

    return { ...EMPTY_BULLET_POINT };
  });
}

export function normalizeBulletPointsForSave(
  points: PriceListBulletPoint[]
): PriceListBulletPoint[] {
  return points
    .map((point) => ({
      label: point.label.trim(),
      duration:
        point.duration !== null && point.duration > 0 ? point.duration : null,
      cost: point.cost?.trim() ? point.cost.trim() : null,
    }))
    .filter(
      (point) =>
        point.label.length > 0 || point.duration !== null || point.cost !== null
    );
}

export function countFilledBulletPoints(points: PriceListBulletPoint[]): number {
  return normalizeBulletPointsForSave(points).length;
}

export function formatBulletPointMeta(point: PriceListBulletPoint): string {
  const parts: string[] = [];
  if (point.duration) parts.push(`${point.duration} min`);
  if (point.cost) parts.push(point.cost);
  return parts.join(" · ");
}
