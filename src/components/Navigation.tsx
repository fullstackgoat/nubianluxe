"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

const navLinks = [
  { label: "Home",           href: "/#home" },
  { label: "Services",       href: "/#services" },
  { label: "Accommodations", href: "/#accommodations" },
  { label: "Gallery",        href: "/#gallery" },
  { label: "Hair Colors",    href: "/#colors" },
  { label: "Prices",         href: "/#prices" },
  { label: "Policy",         href: "/#policy" },
  { label: "About",          href: "/#about" },
];

export default function Navigation() {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Main navbar */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[rgba(201,168,76,0.12)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="section-container flex items-center justify-between gap-3 min-w-0">
          {/* Logo */}
          <Link
            href="/"
            className="flex flex-col leading-none group min-w-0 flex-1 mr-1"
            onClick={closeMenu}
          >
            <span
              style={{ fontFamily: "var(--font-accent)" }}
              className="text-lg sm:text-2xl tracking-[0.05em] sm:tracking-[0.08em] text-white group-hover:text-[var(--color-gold)] transition-colors duration-300 truncate"
            >
              NUBIAN
            </span>
            <span
              style={{ fontFamily: "var(--font-body)" }}
              className="text-[0.5rem] sm:text-[0.6rem] tracking-[0.18em] sm:tracking-[0.35em] uppercase text-[var(--color-gold)] font-light truncate"
            >
              LUXE BRAIDING LOUNGE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 6).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.7rem] tracking-[0.18em] uppercase font-medium text-white/70 hover:text-white transition-all duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--color-gold)] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {isSignedIn ? (
              <>
                <Link
                  href="/account"
                  className="hidden sm:inline-flex text-[0.7rem] tracking-[0.18em] uppercase font-medium text-white/70 hover:text-white transition-all duration-300"
                >
                  My Account
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                    variables: { colorPrimary: "#C9A84C" },
                  }}
                />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex text-[0.7rem] tracking-[0.18em] uppercase font-medium text-white/70 hover:text-white transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/book"
                  className="hidden sm:inline-flex btn-gold text-[0.7rem] py-2.5 px-5"
                >
                  Book Now
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="flex flex-col justify-center items-end gap-1.5 w-8 h-8 cursor-pointer"
            >
              <span
                className={`block h-px bg-white transition-all duration-400 ${
                  menuOpen ? "w-6 rotate-45 translate-y-[5px]" : "w-6"
                }`}
              />
              <span
                className={`block h-px bg-[var(--color-gold)] transition-all duration-400 ${
                  menuOpen ? "w-0 opacity-0" : "w-4"
                }`}
              />
              <span
                className={`block h-px bg-white transition-all duration-400 ${
                  menuOpen ? "w-6 -rotate-45 -translate-y-[5px]" : "w-6"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="overlay-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex"
            onClick={closeMenu}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0A0A0A]/98 backdrop-blur-2xl" />

            {/* Decorative orbs */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-gold)] opacity-[0.03] blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[var(--color-blush)] opacity-[0.04] blur-3xl pointer-events-none" />

            {/* Menu content */}
            <div
              className="relative z-10 flex flex-col justify-center items-start w-full max-w-xl mx-auto px-8 py-24"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="w-full mb-12">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -32 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.055,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="group flex items-center gap-4 py-3 border-b border-white/5 hover:border-[var(--color-gold-dark)] transition-all duration-300"
                    >
                      <span className="text-[0.6rem] tracking-[0.2em] text-[var(--color-gold-dark)] font-mono w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        style={{ fontFamily: "var(--font-display)" }}
                        className="text-4xl font-light text-white/80 group-hover:text-white group-hover:translate-x-2 transition-all duration-300 tracking-tight"
                      >
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="flex flex-col gap-4 w-full"
              >
                <Link
                  href="/book"
                  onClick={closeMenu}
                  className="btn-gold text-center w-full sm:w-auto sm:self-start"
                >
                  Book Your Appointment
                </Link>
                {isSignedIn ? (
                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className="text-[0.7rem] tracking-[0.18em] uppercase text-[var(--color-gold)] hover:text-white transition-colors"
                  >
                    My Account →
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="text-[0.7rem] tracking-[0.18em] uppercase text-[var(--color-gold)] hover:text-white transition-colors"
                  >
                    Sign In →
                  </Link>
                )}
                <p className="text-[0.7rem] tracking-[0.18em] uppercase text-[var(--color-muted)]">
                  Open 24/7 · The Woodlands, TX · Text 346-459-0146
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
