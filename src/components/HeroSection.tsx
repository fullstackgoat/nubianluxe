"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

const DESKTOP_VIDEO_SRC = "/assets/nubian-luxe-vid.mp4";
const MOBILE_VIDEO_SRC = "/assets/nubian-luxe-mobile.mp4";
// Tailwind's `md` breakpoint is 768px — anything narrower is treated as mobile.
const MOBILE_QUERY = "(max-width: 767px)";

export default function HeroSection() {
  const [phase, setPhase] = useState<"splash" | "hero">("splash");
  // Decided on the client to avoid SSR-rendering the wrong video on phones.
  // Splash container shows obsidian until the src is picked (~one tick).
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setVideoSrc(mq.matches ? MOBILE_VIDEO_SRC : DESKTOP_VIDEO_SRC);
  }, []);

  // Safety net: if the video fails to load or autoplay is blocked,
  // fall through to the hero text after 12s so the page is never stuck
  // on a black splash.
  useEffect(() => {
    const fallback = setTimeout(() => setPhase("hero"), 12000);
    return () => clearTimeout(fallback);
  }, []);

  const handleVideoEnd = () => setPhase("hero");
  const handleVideoError = () => setPhase("hero");

  return (
    <section
      id="home"
      className="relative h-screen min-h-[640px] flex flex-col items-center justify-center overflow-hidden bg-[var(--color-obsidian)]"
    >
      {/* Splash video — autoplays once, then fades away to reveal the hero text */}
      <AnimatePresence>
        {phase === "splash" && (
          <motion.div
            key="splash-video"
            className="absolute inset-0 z-30 bg-[var(--color-obsidian)]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {videoSrc && (
              <video
                // Re-mount when src changes (e.g. orientation change before play)
                key={videoSrc}
                ref={videoRef}
                src={videoSrc}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero content */}
      <AnimatePresence>
        {phase === "hero" && (
          <motion.div
            key="hero-content"
            className="relative z-20 section-container flex flex-col items-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              style={{ fontFamily: "var(--font-body)" }}
              className="text-xs tracking-[0.35em] uppercase text-white/60 mb-10"
            >
              The flexibility you need · The accommodations you love
            </motion.p>

            {/* Main headline */}
            <div className="mb-6">
              <motion.span
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ fontFamily: "var(--font-accent)" }}
                className="block text-7xl md:text-9xl lg:text-[10rem] leading-none text-white tracking-[0.04em]"
              >
                NUBIAN
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ fontFamily: "var(--font-display)" }}
                className="block text-3xl md:text-5xl lg:text-6xl text-[var(--color-gold)] font-light italic tracking-[0.15em]"
              >
                Luxe Braiding Lounge
              </motion.span>
            </div>

            {/* Gold divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mb-8 origin-center"
            />

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mb-12 space-y-1"
            >
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-2xl md:text-3xl font-light text-white/90 italic"
              >
                Honoring the Craft
              </p>
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-2xl md:text-3xl font-light text-[var(--color-gold-light)] italic"
              >
                Elevating the Experience
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/#booking" className="btn-gold text-sm px-8 py-4">
                Book Your Appointment
              </Link>
              <Link href="/#services" className="btn-outline text-sm px-8 py-4">
                View Services
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll indicator */}
      <AnimatePresence>
        {phase === "hero" && (
          <motion.div
            key="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-[0.6rem] tracking-[0.3em] uppercase text-white/40">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 text-[var(--color-gold-dark)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
