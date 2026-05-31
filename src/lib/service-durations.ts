// Duration in minutes — keyed by category id, then service title.
export const SERVICE_DURATIONS: Record<string, Record<string, number>> = {
  extensions: {
    "Boho / Goddess Braids": 480,
    "Box Braids": 240,
    Cornrows: 180,
    "Crochet Braids": 180,
    "Fulani / Tribal Braids": 300,
    "Knotless Braids": 300,
    "Illusion Locs": 360,
    "Mermaid Locs": 480,
    Twist: 240,
  },
  natural: {
    Cornrows: 120,
    "Loc Maintenance": 180,
    Coils: 240,
    Plats: 180,
    Twist: 180,
    "Illusion Locs": 300,
  },
  other: {
    "Braid Prep": 60,
    "Hair Color": 90,
    "Olaplex Conditioning": 60,
    Detangling: 90,
    "Braid Take Down": 120,
    "Wig Braid Down": 90,
  },
  children: {
    Extensions: 180,
    Natural: 120,
  },
};

export function getServiceDuration(categoryId: string, title: string): number {
  return SERVICE_DURATIONS[categoryId]?.[title] ?? 180;
}
