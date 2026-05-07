export const SERVICES = [
  {
    category: "Braid Extension Services",
    items: [
      { name: "Boho / Goddess Braids", price: "$300+", duration: 480 },
      { name: "Box Braids",            price: "$100+", duration: 240 },
      { name: "Cornrows",              price: "$150+", duration: 180 },
      { name: "Crochet Braids",        price: "$100+", duration: 180 },
      { name: "Fulani / Tribal Braids",price: "$200+", duration: 300 },
      { name: "Knotless Braids",       price: "$150+", duration: 300 },
      { name: "Illusion Locs",         price: "$200+", duration: 360 },
      { name: "Mermaid Locs",          price: "$300+", duration: 480 },
      { name: "Twist",                 price: "$100+", duration: 240 },
    ],
  },
  {
    category: "Natural Hair Services",
    items: [
      { name: "Cornrows",        price: "$75+",  duration: 120 },
      { name: "Loc Maintenance", price: "$120+", duration: 180 },
      { name: "Coils",           price: "$125+", duration: 240 },
      { name: "Plats",           price: "$75+",  duration: 180 },
      { name: "Twist",           price: "$75+",  duration: 180 },
      { name: "Illusion Locs",   price: "$150+", duration: 300 },
    ],
  },
  {
    category: "Add-On Services",
    items: [
      { name: "Braid Prep",           price: "$75+",  duration: 60  },
      { name: "Hair Color",           price: "$50+",  duration: 90  },
      { name: "Olaplex Conditioning", price: "$45+",  duration: 60  },
      { name: "Detangling",           price: "$100+", duration: 90  },
      { name: "Braid Take Down",      price: "$100+", duration: 120 },
      { name: "Wig Braid Down",       price: "$75",   duration: 90  },
    ],
  },
  {
    category: "Children's Services",
    items: [
      { name: "Extensions", price: "$70+", duration: 180 },
      { name: "Natural",    price: "$50+", duration: 120 },
    ],
  },
] as const;

export const TIERS = [
  {
    id: "REGULAR" as const,
    name: "Regular",
    fee: 0,
    feeLabel: "Free",
    schedule: "Wed – Sat",
    hours: "8 AM – 8 PM",
    notice: "7-day advance notice",
    description: "Perfect for planners who book ahead.",
  },
  {
    id: "PREMIUM" as const,
    name: "Premium",
    fee: 2500,
    feeLabel: "$25",
    schedule: "Tue – Sat",
    hours: "6 AM – 10 PM",
    notice: "5-day advance notice",
    description: "More availability with extended hours.",
  },
  {
    id: "VIP" as const,
    name: "VIP",
    fee: 5000,
    feeLabel: "$50",
    schedule: "7 Days a Week",
    hours: "24 / 7",
    notice: "3-day advance notice",
    description: "Total access on your schedule, any time.",
  },
] as const;

export type TierId = "REGULAR" | "PREMIUM" | "VIP";

/**
 * Parse a catalog price string (e.g. "$300+", "$75") into cents.
 * The catalog uses starting prices — this returns the start (e.g. "$300+" -> 30000).
 * Final amounts owed beyond this are collected in person at the appointment.
 */
export function parseServicePriceCents(price: string): number {
  const match = price.match(/\$([\d,]+(?:\.\d{1,2})?)/);
  if (!match) return 0;
  const dollars = parseFloat(match[1].replace(/,/g, ""));
  if (Number.isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

// Available time slots per tier
export const TIER_SLOTS: Record<TierId, { days: number[]; startHour: number; endHour: number }> = {
  REGULAR: { days: [3, 4, 5, 6], startHour: 8,  endHour: 20 }, // Wed–Sat
  PREMIUM: { days: [2, 3, 4, 5, 6], startHour: 6, endHour: 22 }, // Tue–Sat
  VIP:     { days: [0, 1, 2, 3, 4, 5, 6], startHour: 0, endHour: 24 }, // Every day
};

export function getAvailableSlots(date: Date, tier: TierId): string[] {
  const config = TIER_SLOTS[tier];
  const dayOfWeek = date.getDay();

  if (!config.days.includes(dayOfWeek)) return [];

  const slots: string[] = [];
  for (let h = config.startHour; h < config.endHour; h += 2) {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    slots.push(`${hour}:00 ${ampm}`);
  }
  return slots;
}
