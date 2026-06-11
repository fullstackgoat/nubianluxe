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

/** Coerce server-action / form input into bullet points safe for Postgres jsonb. */
export function bulletPointsToDbValue(input: unknown): PriceListBulletPoint[] {
  if (typeof input === "string") {
    try {
      return normalizeBulletPointsForSave(parseBulletPoints(JSON.parse(input)));
    } catch {
      return [];
    }
  }

  if (Array.isArray(input)) {
    return normalizeBulletPointsForSave(parseBulletPoints(input));
  }

  return [];
}

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

      const costValue = point.cost;
      const parsedCost =
        typeof costValue === "number" && costValue > 0
          ? String(costValue)
          : typeof costValue === "string" && costValue.trim()
            ? costValue.trim()
            : null;

      return {
        label: typeof point.label === "string" ? point.label : "",
        duration: parsedDuration,
        cost: parsedCost,
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
  if (point.cost) parts.push(formatBulletCostDisplay(point.cost));
  return parts.join(" · ");
}

export function parseBulletCostCents(cost: string | null): number {
  if (!cost?.trim()) return 0;
  const match = cost.match(/([\d,]+(?:\.\d{1,2})?)/);
  if (!match) return 0;
  const dollars = parseFloat(match[1].replace(/,/g, ""));
  if (Number.isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

export function formatBulletCostDisplay(cost: string | null): string {
  const cents = parseBulletCostCents(cost);
  if (cents <= 0) return cost?.trim() ?? "";
  return `+$${(cents / 100).toFixed(0)}`;
}

export type SelectedServiceOption = {
  label: string;
  costCents: number;
  durationMinutes: number | null;
};

export function getPricedBulletIndices(points: PriceListBulletPoint[]): number[] {
  const normalized = normalizeBulletPointsForSave(points);
  return normalized
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => parseBulletCostCents(point.cost) > 0)
    .map(({ index }) => index);
}

export function computeServiceSelectionTotals(input: {
  basePriceCents: number;
  basePriceLabel: string;
  baseDuration: number;
  bulletPoints: PriceListBulletPoint[];
  selectedIndices: number[];
}): {
  servicePriceCents: number;
  servicePriceLabel: string;
  duration: number;
  selectedOptions: SelectedServiceOption[];
} {
  const normalized = normalizeBulletPointsForSave(input.bulletPoints);
  const pricedIndices = new Set(getPricedBulletIndices(input.bulletPoints));
  const validSelection = input.selectedIndices.filter((index) => pricedIndices.has(index));

  let addOnCents = 0;
  let addOnDuration = 0;
  const selectedOptions: SelectedServiceOption[] = [];

  for (const index of validSelection) {
    const point = normalized[index];
    if (!point) continue;

    const costCents = parseBulletCostCents(point.cost);
    if (costCents <= 0) continue;

    addOnCents += costCents;
    if (point.duration) addOnDuration += point.duration;
    selectedOptions.push({
      label: point.label,
      costCents,
      durationMinutes: point.duration,
    });
  }

  const servicePriceCents = input.basePriceCents + addOnCents;
  const duration = input.baseDuration + addOnDuration;
  const hasPlus = input.basePriceLabel.includes("+");

  const servicePriceLabel =
    addOnCents > 0
      ? `$${(servicePriceCents / 100).toFixed(0)}${hasPlus ? "+" : ""}`
      : input.basePriceLabel;

  return {
    servicePriceCents,
    servicePriceLabel,
    duration,
    selectedOptions,
  };
}

export function formatSelectedServiceOptions(options: SelectedServiceOption[]): string {
  if (options.length === 0) return "";
  return options
    .map((option) => `${option.label} (+$${(option.costCents / 100).toFixed(0)})`)
    .join(", ");
}
