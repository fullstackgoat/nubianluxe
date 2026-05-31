"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { format, isToday, isFuture } from "date-fns";
import type { Appointment, BlockedDate } from "@/generated/prisma/client";
import AppointmentsPanel from "./AppointmentsPanel";
import BlockedDatesPanel from "./BlockedDatesPanel";
import AccommodationsPanel from "./AccommodationsPanel";
import PriceListPanel from "./PriceListPanel";
import type { Accommodation } from "@/generated/prisma/client";
import type { PriceListCategoryWithServices } from "@/lib/price-list-data";

interface Props {
  appointments: Appointment[];
  blockedDates: BlockedDate[];
  accommodations: Accommodation[];
  priceListCategories: PriceListCategoryWithServices[];
  dbError?: string | null;
}

const TABS = ["Overview", "Appointments", "Blocked Dates", "Accommodations", "Price List"] as const;
type Tab = (typeof TABS)[number];

export default function AdminDashboard({
  appointments,
  blockedDates,
  accommodations,
  priceListCategories,
  dbError,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const now = new Date();
  // Dashboard semantics:
  //   - Pending  = booking fee not yet paid (needs follow-up). Excludes cancellations.
  //   - Upcoming = future appointments that have been paid (and not cancelled).
  // The PENDING/CONFIRMED Appointment.status field is owned by the admin
  // confirmation flow and is independent from the paid/unpaid distinction.
  const pending = appointments.filter(
    (a) => !a.depositPaid && a.status !== "CANCELLED"
  );
  const todayAppts = appointments.filter((a) => isToday(new Date(a.date)));
  const upcoming = appointments.filter(
    (a) =>
      a.depositPaid &&
      isFuture(new Date(a.date)) &&
      a.status !== "CANCELLED"
  );
  const totalRevenue = appointments
    .filter((a) => a.depositPaid)
    .reduce((sum, a) => sum + a.deposit + a.tierFee, 0);

  if (dbError) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col">
        <div className="border-b border-[rgba(201,168,76,0.15)] bg-[rgba(10,10,10,0.95)] backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <a href="/" className="font-accent text-gold text-lg tracking-widest">NUBIAN LUXE</a>
            <span className="text-ivory/20">|</span>
            <span className="font-body text-ivory/40 text-sm tracking-widest uppercase">Admin</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="glass-card p-10 max-w-lg text-center border-amber-500/20">
            <p className="font-display text-3xl text-ivory/40 italic mb-3">Database Offline</p>
            <p className="font-body text-ivory/50 text-sm leading-relaxed mb-6">{dbError}</p>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(201,168,76,0.1)] p-4 text-left">
              <p className="font-body text-ivory/30 text-xs tracking-widest uppercase mb-2">Steps to fix</p>
              <ol className="font-body text-ivory/50 text-sm space-y-1 list-decimal list-inside">
                <li>Go to supabase.com and create a project</li>
                <li>Copy the connection string from Project Settings → Database</li>
                <li>Add it as DATABASE_URL in .env.local</li>
                <li>Run <code className="text-gold text-xs">npx prisma migrate dev</code></li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Top bar */}
      <div className="border-b border-[rgba(201,168,76,0.15)] bg-[rgba(10,10,10,0.95)] backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-accent text-gold text-lg tracking-widest">
              NUBIAN LUXE
            </a>
            <span className="text-ivory/20">|</span>
            <span className="font-body text-ivory/40 text-sm tracking-widest uppercase">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            {pending.length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-body px-3 py-1 tracking-wider uppercase">
                {pending.length} Pending
              </span>
            )}
            <a
              href="/"
              className="text-ivory/40 hover:text-ivory font-body text-xs tracking-widest uppercase transition-colors"
            >
              ← Site
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="font-accent text-gold text-xs tracking-[0.3em] uppercase mb-1">
            {format(now, "EEEE, MMMM d, yyyy")}
          </p>
          <h1 className="font-display text-4xl text-ivory font-light italic">
            Dashboard
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[rgba(201,168,76,0.15)] mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-body text-xs tracking-widest uppercase px-6 py-3 border-b-2 transition-all duration-200 ${
                activeTab === tab
                  ? "border-gold text-gold"
                  : "border-transparent text-ivory/40 hover:text-ivory/70"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "Overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Today", value: todayAppts.length, sub: "appointments" },
                { label: "Upcoming", value: upcoming.length, sub: "paid · upcoming" },
                { label: "Pending", value: pending.length, sub: "awaiting payment", alert: pending.length > 0 },
                { label: "Revenue", value: `$${(totalRevenue / 100).toLocaleString()}`, sub: "deposits collected" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`glass-card p-6 ${stat.alert ? "border-amber-500/30" : ""}`}
                >
                  <p
                    className={`font-display text-3xl font-light ${
                      stat.alert ? "text-amber-400" : "text-gold"
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-ivory font-body text-sm mt-0.5">{stat.label}</p>
                  <p className="text-ivory/30 font-body text-xs mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Today's appointments */}
            <div className="mb-8">
              <h2 className="font-display text-xl text-ivory font-light italic mb-4">
                Today&apos;s Schedule
              </h2>
              {todayAppts.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-ivory/30 font-body text-sm">No appointments today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppts
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((appt) => (
                      <MiniCard key={appt.id} appointment={appt} />
                    ))}
                </div>
              )}
            </div>

            {/* Pending — booking fee not yet paid */}
            {pending.length > 0 && (
              <div>
                <h2 className="font-display text-xl text-ivory font-light italic mb-4">
                  Awaiting Payment
                </h2>
                <div className="space-y-3">
                  {pending.map((appt) => (
                    <MiniCard key={appt.id} appointment={appt} highlight />
                  ))}
                </div>
                <p className="text-ivory/30 font-body text-xs mt-3">
                  These clients haven&apos;t completed their booking fee yet. Follow up or cancel from the Appointments tab.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Appointments tab */}
        {activeTab === "Appointments" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AppointmentsPanel appointments={appointments} />
          </motion.div>
        )}

        {/* Blocked Dates tab */}
        {activeTab === "Blocked Dates" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <BlockedDatesPanel blockedDates={blockedDates} />
          </motion.div>
        )}

        {/* Accommodations tab */}
        {activeTab === "Accommodations" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AccommodationsPanel accommodations={accommodations} />
          </motion.div>
        )}

        {/* Price List tab */}
        {activeTab === "Price List" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <PriceListPanel categories={priceListCategories} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MiniCard({
  appointment,
  highlight = false,
}: {
  appointment: Appointment;
  highlight?: boolean;
}) {
  const apptDate = new Date(appointment.date);
  return (
    <div
      className={`glass-card px-5 py-4 flex items-center justify-between gap-4 ${
        highlight ? "border-amber-500/20" : ""
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="font-body text-gold text-sm shrink-0">
          {format(apptDate, "h:mm a")}
        </span>
        <div className="min-w-0">
          <p className="font-body text-ivory text-sm truncate">{appointment.clientName}</p>
          <p className="font-body text-ivory/40 text-xs truncate">{appointment.service}</p>
        </div>
      </div>
      <StatusBadge status={appointment.status} />
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    COMPLETED: "bg-gold/10 text-gold border-gold/20",
    NO_SHOW: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  const labels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
    NO_SHOW: "No Show",
  };
  return (
    <span
      className={`text-xs font-body tracking-wider uppercase border px-2.5 py-1 shrink-0 ${
        styles[status] ?? styles.PENDING
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
