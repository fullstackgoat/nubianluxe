/** Convert a display slot like "2:00 PM" to 24h "14:00:00" for Date construction. */
export function slotToTime(slot: string): string {
  const [time, ampm] = slot.split(" ");
  let [hours] = time.split(":").map(Number);
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:00:00`;
}

/** Convert an appointment Date to the display slot string used in the UI. */
export function dateToTimeSlot(date: Date): string {
  const h = date.getHours();
  const hour = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour}:00 ${ampm}`;
}

export const SLOT_HOLD_MINUTES = 7;

export const SLOT_HOLD_MS = SLOT_HOLD_MINUTES * 60 * 1000;
