"use client";

import { motion } from "motion/react";
import type { BookingState } from "./BookingWizard";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, Phone, Palette } from "lucide-react";
import { formatHairColorSelection } from "@/lib/hair-colors";
import { formatSelectedServiceOptions } from "@/lib/price-list-bullets";
import { formatSelectedAddOnServices } from "@/lib/booking-services";

interface Props {
  state: BookingState;
}

export default function StepConfirmation({ state }: Props) {
  const dateObj = state.date ? new Date(state.date + "T12:00:00") : null;

  return (
    <div className="text-center space-y-8">
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex justify-center"
      >
        <div className="w-24 h-24 rounded-full border-2 border-[var(--color-gold)] flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-[var(--color-gold)]" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="text-3xl sm:text-4xl font-light italic text-white mb-3 px-1"
        >
          You&apos;re Confirmed!
        </h2>
        <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed">
          Your appointment has been booked and your deposit received. Check your email
          for a confirmation with all the details.
        </p>
      </motion.div>

      {/* Details card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="glass-card p-4 sm:p-7 text-left space-y-4 max-w-md mx-auto w-full min-w-0"
      >
        <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)]">
          Appointment Details
        </p>
        <div className="space-y-3">
          {[
            { icon: CheckCircle, label: `${state.service} · ${state.servicePrice}` },
            ...(state.selectedServiceOptions.length > 0
              ? [{
                  icon: CheckCircle,
                  label: formatSelectedServiceOptions(state.selectedServiceOptions),
                }]
              : []),
            ...(state.selectedAddOnServices.length > 0
              ? [{
                  icon: CheckCircle,
                  label: formatSelectedAddOnServices(state.selectedAddOnServices),
                }]
              : []),
            ...(state.hairColorValue && state.hairColorCategory
              ? [{
                  icon: Palette,
                  label: formatHairColorSelection(state.hairColorCategory, state.hairColorValue),
                }]
              : []),
            { icon: Calendar, label: dateObj ? dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : state.date },
            { icon: Clock, label: `${state.timeSlot} · ${state.tier.charAt(0) + state.tier.slice(1).toLowerCase()} Tier` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-3 text-white/70 text-sm min-w-0">
              <Icon className="w-4 h-4 text-[var(--color-gold)] shrink-0 mt-0.5" />
              <span className="break-words min-w-0">{label}</span>
            </div>
          ))}
        </div>
        {state.appointmentId && (
          <p className="text-white/30 text-xs border-t border-white/10 pt-3">
            Ref # {state.appointmentId.slice(-8).toUpperCase()}
          </p>
        )}
      </motion.div>

      {/* Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="glass-card p-4 sm:p-6 text-left max-w-md mx-auto w-full min-w-0 border-l-2 border-[var(--color-gold)]"
      >
        <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)] mb-3">
          What&apos;s Next
        </p>
        <ul className="space-y-2 text-white/60 text-sm">
          <li>· A confirmation email is on its way to {state.clientEmail}</li>
          <li>· You&apos;ll receive a reminder 48 hours before your appointment</li>
          <li>· Arrive with clean, detangled hair (or add Braid Prep service)</li>
          <li>· Payment checkpoint at ~80% service completion</li>
          <li>· To reschedule, text at least 48 hours in advance</li>
        </ul>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md mx-auto"
      >
        <a
          href="sms:3464590146"
          className="btn-outline flex items-center gap-2 justify-center"
        >
          <Phone className="w-4 h-4" /> Text 346-459-0146
        </a>
        <Link href="/" className="btn-gold">
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
