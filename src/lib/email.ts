import { render } from "@react-email/render";
import { Resend } from "resend";
import OwnerBookingNotificationEmail from "@/emails/OwnerBookingNotification";
import { formatHairColorSelection } from "@/lib/hair-colors";
import { formatCents } from "@/lib/stripe";

type AppointmentForEmail = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  serviceCategory: string;
  servicePrice: number;
  tier: string;
  tierFee: number;
  deposit: number;
  date: Date;
  duration: number;
  notes: string | null;
  hairColorCategory: string | null;
  hairColorValue: string | null;
};

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return [...new Set(raw.split(",").map((email) => email.trim()).filter(Boolean))];
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
}

export function getOwnerNotificationEmails(): string[] {
  const configured = parseEmailList(process.env.OWNER_NOTIFICATION_EMAILS);
  if (configured.length > 0) return configured;
  return ["taliahmason@outlook.com"];
}

function formatAppointmentDateTime(date: Date) {
  return {
    date: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date),
  };
}

function formatDuration(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60} hours`;
  }
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  return `${minutes} minutes`;
}

function getAdminUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://nubianluxebrand.com";
  return `${base}/admin`;
}

export async function sendOwnerBookingNotification(
  appointment: AppointmentForEmail,
  options: { paidServiceUpfront: boolean }
) {
  if (!isResendConfigured()) {
    console.warn("[email] Resend not configured — skipping owner booking notification");
    return { ok: false as const, error: "Resend not configured" };
  }

  const recipients = getOwnerNotificationEmails();
  if (recipients.length === 0) {
    console.warn("[email] No owner notification emails configured");
    return { ok: false as const, error: "No recipients configured" };
  }

  const { date, time } = formatAppointmentDateTime(appointment.date);
  const hairColor =
    appointment.hairColorCategory && appointment.hairColorValue
      ? formatHairColorSelection(appointment.hairColorCategory, appointment.hairColorValue)
      : null;

  const html = await render(
    OwnerBookingNotificationEmail({
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      service: appointment.service,
      serviceCategory: appointment.serviceCategory,
      servicePrice: formatCents(appointment.servicePrice),
      tier: appointment.tier.charAt(0) + appointment.tier.slice(1).toLowerCase(),
      tierFee: formatCents(appointment.tierFee),
      deposit: formatCents(appointment.deposit),
      date,
      time,
      duration: formatDuration(appointment.duration),
      notes: appointment.notes,
      hairColor,
      appointmentId: appointment.id,
      paidServiceUpfront: options.paidServiceUpfront,
      adminUrl: getAdminUrl(),
    })
  );

  const result = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: recipients,
    subject: `New booking — ${appointment.clientName} · ${appointment.service}`,
    html,
  });

  if (result.error) {
    console.error("[email] Owner booking notification failed:", result.error);
    return { ok: false as const, error: result.error.message };
  }

  console.log(`[email] Owner booking notification sent to ${recipients.join(", ")}`);
  return { ok: true as const, id: result.data?.id };
}
