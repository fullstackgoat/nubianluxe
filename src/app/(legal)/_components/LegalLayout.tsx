import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Props {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ eyebrow, title, lastUpdated, children }: Props) {
  return (
    <main className="min-h-screen bg-[var(--color-obsidian)]">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="section-container max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-[0.65rem] tracking-[0.35em] uppercase text-[var(--color-gold-dark)] mb-4">
              {eyebrow}
            </p>
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="text-5xl md:text-6xl font-light text-white italic mb-4"
            >
              {title}
            </h1>
            <div className="gold-divider mb-4" />
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <article className="legal-prose space-y-6 text-white/75 leading-relaxed">
            {children}
          </article>

          {/* Cross-links */}
          <div className="mt-16 pt-8 border-t border-[rgba(201,168,76,0.15)] flex flex-wrap gap-x-6 gap-y-3 justify-center text-xs tracking-[0.15em] uppercase">
            <Link href="/terms" className="text-white/40 hover:text-[var(--color-gold)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-white/40 hover:text-[var(--color-gold)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="text-white/40 hover:text-[var(--color-gold)] transition-colors">
              Refund &amp; Cancellation
            </Link>
            <Link href="/" className="text-white/40 hover:text-[var(--color-gold)] transition-colors">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
