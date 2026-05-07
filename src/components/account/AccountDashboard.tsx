"use client";

import { UserButton } from "@clerk/nextjs";
import { motion } from "motion/react";
import { format } from "date-fns";
import type { Appointment } from "@/generated/prisma/client";

interface Props {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
  };
  appointments: Appointment[];
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  COMPLETED: "bg-gold/10 text-gold border-gold/20",
  NO_SHOW: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting Payment",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
};

export default function AccountDashboard({ user, appointments }: Props) {
  const upcoming = appointments.filter(
    (a) => new Date(a.date) >= new Date() && a.status !== "CANCELLED"
  );
  const past = appointments.filter(
    (a) => new Date(a.date) < new Date() || a.status === "CANCELLED"
  );

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Guest";

  return (
    <div className="pt-28 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-accent text-gold text-sm tracking-[0.3em] uppercase mb-2">
            My Account
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-5xl text-ivory font-light italic">
                Welcome back, {user.firstName ?? "Guest"}
              </h1>
              <p className="text-ivory/40 font-body mt-1">{user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/book"
                className="btn-gold text-sm px-6 py-3 inline-block"
              >
                Book Appointment
              </a>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard:
                      "bg-[#111] border border-[rgba(201,168,76,0.2)] shadow-xl",
                    userButtonPopoverActionButton: "text-ivory hover:bg-[rgba(201,168,76,0.08)]",
                    userButtonPopoverActionButtonText: "text-ivory font-body",
                    userButtonPopoverFooter: "hidden",
                  },
                  variables: {
                    colorPrimary: "#C9A84C",
                    colorText: "#F5F0E8",
                    fontFamily: "var(--font-body)",
                  },
                }}
              />
            </div>
          </div>
          <div className="gold-divider mt-6" />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: "Total Visits", value: appointments.filter(a => a.status === "COMPLETED").length },
            { label: "Upcoming", value: upcoming.length },
            { label: "Total Spent", value: `$${(appointments.filter(a => a.depositPaid).reduce((sum, a) => sum + a.deposit + a.tierFee, 0) / 100).toFixed(0)}` },
            { label: "Member Since", value: appointments.length > 0 ? format(new Date(appointments[appointments.length - 1].createdAt), "MMM yyyy") : "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-5 text-center"
            >
              <p className="font-display text-3xl text-gold font-light">{stat.value}</p>
              <p className="text-ivory/40 font-body text-xs tracking-widest uppercase mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl text-ivory font-light italic mb-6">
            Upcoming Appointments
          </h2>

          {upcoming.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p className="font-display text-xl text-ivory/40 italic mb-4">
                No upcoming appointments
              </p>
              <a href="/book" className="btn-gold text-sm px-6 py-3 inline-block">
                Book Now
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Past Appointments */}
        {past.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="font-display text-2xl text-ivory font-light italic mb-6">
              Past Appointments
            </h2>
            <div className="space-y-3">
              {past.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} past />
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty state — no bookings at all */}
        {appointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-16 text-center"
          >
            <p className="font-display text-3xl text-ivory/30 italic mb-2">
              Your journey begins here
            </p>
            <p className="text-ivory/30 font-body text-sm mb-8">
              You haven&apos;t made any appointments yet.
            </p>
            <a href="/book" className="btn-gold px-8 py-4 inline-block">
              Book Your First Appointment
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  past = false,
}: {
  appointment: Appointment;
  past?: boolean;
}) {
  const apptDate = new Date(appointment.date);

  return (
    <div
      className={`glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        past ? "opacity-60" : ""
      }`}
    >
      {/* Date block */}
      <div className="flex items-center gap-5 min-w-0">
        <div className="text-center w-14 shrink-0">
          <p className="font-display text-2xl text-gold font-light leading-none">
            {format(apptDate, "d")}
          </p>
          <p className="text-ivory/50 font-body text-xs tracking-widest uppercase">
            {format(apptDate, "MMM")}
          </p>
          <p className="text-ivory/30 font-body text-xs">{format(apptDate, "yyyy")}</p>
        </div>
        <div className="h-12 w-px bg-gold/20 shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-lg text-ivory font-light truncate">
            {appointment.service}
          </p>
          <p className="text-ivory/40 font-body text-sm">
            {format(apptDate, "h:mm a")} &bull; {appointment.tier} Tier &bull;{" "}
            {appointment.duration} hrs
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 shrink-0">
        <p className="font-body text-ivory/60 text-sm">
          ${((appointment.deposit + appointment.tierFee) / 100).toFixed(2)} paid
        </p>
        <span
          className={`text-xs font-body tracking-wider uppercase border px-3 py-1 ${
            STATUS_STYLES[appointment.status] ?? STATUS_STYLES.PENDING
          }`}
        >
          {STATUS_LABEL[appointment.status] ?? appointment.status}
        </span>
      </div>
    </div>
  );
}
