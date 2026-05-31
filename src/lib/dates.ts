import { format } from "date-fns";

/** Date key from a calendar day (local). */
export function toLocalDateKey(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

/** Date key from DB @db.Date values (UTC-safe). */
export function toDateKey(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD form value into a local Date (avoids UTC off-by-one on write). */
export function parseDateInput(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}
