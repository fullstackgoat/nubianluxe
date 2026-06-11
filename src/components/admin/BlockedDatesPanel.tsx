"use client";

import { useState, useTransition } from "react";
import { format, isFuture, isToday } from "date-fns";
import type { BlockedDate } from "@/generated/prisma/client";
import { addBlockedDates, removeBlockedDate } from "@/app/actions/admin";

export default function BlockedDatesPanel({ blockedDates }: { blockedDates: BlockedDate[] }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const todayKey = format(new Date(), "yyyy-MM-dd");

  const upcoming = blockedDates.filter(
    (b) => isFuture(new Date(b.date)) || isToday(new Date(b.date))
  );
  const past = blockedDates.filter(
    (b) => !isFuture(new Date(b.date)) && !isToday(new Date(b.date))
  );

  function handleAdd() {
    if (!startDate) {
      setError("Please select a start date.");
      return;
    }
    if (endDate && endDate < startDate) {
      setError("End date must be on or after the start date.");
      return;
    }

    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const result = await addBlockedDates(
          startDate,
          endDate || undefined,
          reason || undefined
        );
        const skippedNote =
          result.skipped > 0 ? ` (${result.skipped} already blocked)` : "";
        setSuccess(
          result.created === 1
            ? `Blocked 1 date${skippedNote}.`
            : `Blocked ${result.created} dates${skippedNote}.`
        );
        setStartDate("");
        setEndDate("");
        setReason("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to block dates.");
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeBlockedDate(id);
    });
  }

  return (
    <div className="max-w-2xl">
      <p className="font-body text-ivory/40 text-sm mb-6">
        Blocked dates prevent clients from booking appointments. Use this to mark days off, holidays, or special closures.
      </p>

      <div className="glass-card p-6 mb-8">
        <h2 className="font-display text-xl text-ivory font-light italic mb-1">
          Block Dates
        </h2>
        <p className="font-body text-ivory/30 text-xs mb-4">
          Pick a single day or a start and end date to block a range.
        </p>
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1">
              <span className="font-body text-ivory/50 text-xs tracking-wider uppercase mb-1.5 block">
                Start date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) setEndDate("");
                }}
                min={todayKey}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40 [color-scheme:dark]"
              />
            </label>
            <label className="flex-1">
              <span className="font-body text-ivory/50 text-xs tracking-wider uppercase mb-1.5 block">
                End date <span className="text-ivory/25 normal-case">(optional)</span>
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || todayKey}
                disabled={!startDate}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40 disabled:opacity-40 [color-scheme:dark]"
              />
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 flex-1 placeholder-ivory/20 focus:outline-none focus:border-gold/40"
            />
            <button
              onClick={handleAdd}
              disabled={isPending}
              className="btn-gold text-xs px-6 py-2.5 shrink-0 disabled:opacity-50"
            >
              {isPending ? "Saving…" : endDate ? "Block Range" : "Block Date"}
            </button>
          </div>
        </div>
        {error && <p className="text-red-400 font-body text-xs">{error}</p>}
        {success && <p className="text-gold/80 font-body text-xs">{success}</p>}
      </div>

      <h2 className="font-display text-xl text-ivory font-light italic mb-4">
        Upcoming Blocked Dates
      </h2>
      {upcoming.length === 0 ? (
        <div className="glass-card p-8 text-center mb-6">
          <p className="text-ivory/30 font-body text-sm">No upcoming blocked dates</p>
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {upcoming.map((b) => (
            <BlockedDateRow key={b.id} blockedDate={b} onRemove={() => handleRemove(b.id)} isPending={isPending} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="font-display text-lg text-ivory/40 font-light italic mb-3">Past</h2>
          <div className="space-y-2 opacity-50">
            {past.slice(0, 5).map((b) => (
              <BlockedDateRow key={b.id} blockedDate={b} past />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BlockedDateRow({
  blockedDate,
  onRemove,
  isPending = false,
  past = false,
}: {
  blockedDate: BlockedDate;
  onRemove?: () => void;
  isPending?: boolean;
  past?: boolean;
}) {
  const d = new Date(blockedDate.date);
  return (
    <div className="glass-card px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="text-center w-12 shrink-0">
          <p className="font-display text-xl text-gold font-light leading-none">{format(d, "d")}</p>
          <p className="font-body text-ivory/40 text-xs tracking-wider uppercase">{format(d, "MMM")}</p>
        </div>
        <div>
          <p className="font-body text-ivory text-sm">{format(d, "EEEE, MMMM d, yyyy")}</p>
          {blockedDate.reason && (
            <p className="font-body text-ivory/40 text-xs mt-0.5">{blockedDate.reason}</p>
          )}
        </div>
      </div>
      {!past && onRemove && (
        <button
          onClick={onRemove}
          disabled={isPending}
          className="font-body text-xs tracking-widest uppercase border border-red-500/20 text-red-400 hover:bg-red-500/10 px-3 py-1.5 transition-all duration-150 shrink-0 disabled:opacity-50"
        >
          Remove
        </button>
      )}
    </div>
  );
}
