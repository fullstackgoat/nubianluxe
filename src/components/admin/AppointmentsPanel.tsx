"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import type { Appointment } from "@/generated/prisma/client";
import { StatusBadge } from "./AdminDashboard";
import {
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  markNoShow,
  markServicePaid,
  unmarkServicePaid,
} from "@/app/actions/admin";

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export default function AppointmentsPanel({ appointments }: { appointments: Appointment[] }) {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = appointments.filter((a) => {
    const matchesStatus = filter === "ALL" || a.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      a.clientName.toLowerCase().includes(q) ||
      a.clientEmail.toLowerCase().includes(q) ||
      a.service.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filters: StatusFilter[] = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or service…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 flex-1 placeholder-ivory/20 focus:outline-none focus:border-gold/40"
        />
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-body text-xs tracking-wider uppercase px-3 py-2 border transition-all duration-150 ${
                filter === f
                  ? "bg-gold text-obsidian border-gold"
                  : "border-[rgba(201,168,76,0.15)] text-ivory/40 hover:text-ivory hover:border-gold/30"
              }`}
            >
              {f === "ALL" ? `All (${appointments.length})` : f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-ivory/30 font-body text-sm">No appointments match this filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((appt) => (
            <AppointmentRow
              key={appt.id}
              appointment={appt}
              expanded={expanded === appt.id}
              onToggle={() => setExpanded(expanded === appt.id ? null : appt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentRow({
  appointment: appt,
  expanded,
  onToggle,
}: {
  appointment: Appointment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const apptDate = new Date(appt.date);

  function action(fn: (id: string) => Promise<void>) {
    startTransition(async () => { await fn(appt.id); });
  }

  return (
    <div className={`glass-card overflow-hidden transition-all duration-200 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Row header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        {/* Date */}
        <div className="shrink-0 w-16 text-center">
          <p className="font-display text-lg text-gold font-light leading-none">
            {format(apptDate, "d")}
          </p>
          <p className="font-body text-ivory/40 text-xs tracking-wider uppercase">
            {format(apptDate, "MMM")}
          </p>
        </div>
        <div className="h-10 w-px bg-gold/10 shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
          <div className="min-w-0">
            <p className="font-body text-ivory text-sm font-medium truncate">{appt.clientName}</p>
            <p className="font-body text-ivory/40 text-xs truncate">{appt.clientEmail}</p>
          </div>
          <div className="min-w-0">
            <p className="font-body text-ivory/70 text-sm truncate">{appt.service}</p>
            <p className="font-body text-ivory/30 text-xs">{format(apptDate, "h:mm a")} · {appt.tier}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="font-body text-ivory/60 text-sm">
              ${((appt.deposit + appt.tierFee + (appt.servicePaid ? Math.max(0, appt.servicePrice - appt.deposit) : 0)) / 100).toFixed(2)} paid
            </p>
            <p className="font-body text-ivory/30 text-xs">
              {appt.servicePaid
                ? "Service ✓"
                : appt.servicePrice > 0
                ? `+ $${(Math.max(0, appt.servicePrice - appt.deposit) / 100).toFixed(2)} due`
                : `${appt.duration} hr${appt.duration !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <StatusBadge status={appt.status} />
        <span className="text-ivory/20 shrink-0 text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[rgba(201,168,76,0.08)] px-5 py-4 bg-[rgba(255,255,255,0.01)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 text-sm">
            <Field label="Phone" value={appt.clientPhone} />
            <Field label="Service Category" value={appt.serviceCategory} />
            <Field
              label="Service Price"
              value={appt.servicePrice > 0 ? `$${(appt.servicePrice / 100).toFixed(2)}+` : "—"}
            />
            <Field label="Service Paid" value={appt.servicePaid ? "Yes" : "No"} />
            <Field label="Deposit Paid" value={appt.depositPaid ? "Yes" : "No"} />
            <Field label="Tier Fee Paid" value={appt.tierFeePaid ? "Yes" : "No"} />
            {appt.notes && <Field label="Notes" value={appt.notes} className="col-span-2 md:col-span-4" />}
            {appt.stripePaymentIntentId && (
              <Field label="Stripe PI" value={appt.stripePaymentIntentId} className="col-span-2" mono />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {appt.status === "PENDING" && (
              <ActionBtn color="emerald" onClick={() => action(confirmAppointment)}>
                Confirm
              </ActionBtn>
            )}
            {appt.status === "CONFIRMED" && (
              <ActionBtn color="gold" onClick={() => action(completeAppointment)}>
                Mark Completed
              </ActionBtn>
            )}
            {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
              <>
                <ActionBtn color="zinc" onClick={() => action(markNoShow)}>
                  No Show
                </ActionBtn>
                <ActionBtn color="red" onClick={() => action(cancelAppointment)}>
                  Cancel
                </ActionBtn>
              </>
            )}
            {(appt.status === "CANCELLED" || appt.status === "NO_SHOW") && (
              <ActionBtn color="emerald" onClick={() => action(confirmAppointment)}>
                Restore → Confirm
              </ActionBtn>
            )}

            {/* Service-fee tracking — independent of appointment status. */}
            {appt.servicePrice > 0 && !appt.servicePaid && (
              <ActionBtn color="emerald" onClick={() => action(markServicePaid)}>
                Mark Service Paid
              </ActionBtn>
            )}
            {appt.servicePrice > 0 && appt.servicePaid && (
              <ActionBtn color="zinc" onClick={() => action(unmarkServicePaid)}>
                Unmark Service Paid
              </ActionBtn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  className = "",
  mono = false,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={className}>
      <p className="font-body text-ivory/30 text-xs tracking-wider uppercase mb-0.5">{label}</p>
      <p className={`text-ivory/70 text-sm ${mono ? "font-mono text-xs" : "font-body"}`}>{value}</p>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: "emerald" | "gold" | "red" | "zinc";
}) {
  const styles = {
    emerald: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
    gold: "border-gold/30 text-gold hover:bg-gold/10",
    red: "border-red-500/30 text-red-400 hover:bg-red-500/10",
    zinc: "border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10",
  };
  return (
    <button
      onClick={onClick}
      className={`font-body text-xs tracking-widest uppercase border px-4 py-2 transition-all duration-150 ${styles[color]}`}
    >
      {children}
    </button>
  );
}
