export const SALON_SETTINGS_ID = "default";

export const APPOINTMENT_BUFFER_PRESETS = [0, 15, 30, 45, 60, 90, 120] as const;

export type SalonSettingsSnapshot = {
  appointmentBufferMinutes: number;
};

export function formatBufferMinutes(minutes: number): string {
  if (minutes <= 0) return "No buffer";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
}
