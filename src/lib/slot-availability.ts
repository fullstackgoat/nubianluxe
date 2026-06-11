import { slotToTime } from "@/lib/slot-utils";

export type TimeInterval = {
  startMinutes: number;
  endMinutes: number;
};

export type ClassifiedSlots = {
  available: string[];
  occupied: string[];
  blocked: string[];
};

export function slotToMinutes(slot: string): number {
  const [time, ampm] = slot.split(" ");
  let [hours] = time.split(":").map(Number);
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60;
}

export function getIntervalForSlot(
  slot: string,
  durationMinutes: number
): TimeInterval {
  const startMinutes = slotToMinutes(slot);
  return {
    startMinutes,
    endMinutes: startMinutes + durationMinutes,
  };
}

export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

export function appointmentDateToInterval(
  date: Date,
  durationMinutes: number
): TimeInterval {
  const startMinutes = date.getHours() * 60 + date.getMinutes();
  return {
    startMinutes,
    endMinutes: startMinutes + durationMinutes,
  };
}

export function classifySlots(input: {
  tierSlots: string[];
  tierEndHour: number;
  requestDurationMinutes: number;
  occupiedIntervals: TimeInterval[];
}): ClassifiedSlots {
  const tierEndMinutes = input.tierEndHour * 60;
  const occupied: string[] = [];
  const available: string[] = [];
  const blocked: string[] = [];

  for (const slot of input.tierSlots) {
    const slotStart = slotToMinutes(slot);
    const isOccupied = input.occupiedIntervals.some(
      (interval) =>
        slotStart >= interval.startMinutes && slotStart < interval.endMinutes
    );

    if (isOccupied) {
      occupied.push(slot);
      continue;
    }

    const candidate = getIntervalForSlot(slot, input.requestDurationMinutes);

    if (candidate.endMinutes > tierEndMinutes) {
      blocked.push(slot);
      continue;
    }

    const overlapsExisting = input.occupiedIntervals.some((interval) =>
      intervalsOverlap(candidate, interval)
    );

    if (overlapsExisting) {
      blocked.push(slot);
      continue;
    }

    available.push(slot);
  }

  return { available, occupied, blocked };
}

export function buildAppointmentDate(dateKey: string, timeSlot: string): Date {
  return new Date(`${dateKey}T${slotToTime(timeSlot)}`);
}
