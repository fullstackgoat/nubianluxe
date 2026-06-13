import { prisma } from "@/lib/prisma";
import { markDbUnavailable, shouldSkipDb } from "@/lib/db-health";
import {
  SALON_SETTINGS_ID,
  type SalonSettingsSnapshot,
} from "@/lib/salon-settings.constants";

export {
  APPOINTMENT_BUFFER_PRESETS,
  formatBufferMinutes,
  SALON_SETTINGS_ID,
} from "@/lib/salon-settings.constants";
export type { SalonSettingsSnapshot } from "@/lib/salon-settings.constants";

const DEFAULT_SETTINGS: SalonSettingsSnapshot = {
  appointmentBufferMinutes: 0,
};

export async function getSalonSettings(): Promise<SalonSettingsSnapshot> {
  if (shouldSkipDb()) return DEFAULT_SETTINGS;

  try {
    const settings = await prisma.salonSettings.upsert({
      where: { id: SALON_SETTINGS_ID },
      create: { id: SALON_SETTINGS_ID, appointmentBufferMinutes: 0 },
      update: {},
      select: { appointmentBufferMinutes: true },
    });

    return {
      appointmentBufferMinutes: Math.max(0, settings.appointmentBufferMinutes),
    };
  } catch (err) {
    markDbUnavailable();
    console.error("Salon settings unavailable, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function getAppointmentBufferMinutes(): Promise<number> {
  const settings = await getSalonSettings();
  return settings.appointmentBufferMinutes;
}
