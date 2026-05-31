import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Italiana } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nubianluxebrand.com"),
  title: {
    default: "Nubian Luxe | Luxury Braiding Lounge — The Woodlands, TX",
    template: "%s | Nubian Luxe",
  },
  description:
    "Experience the pinnacle of luxury hair care at Nubian Luxe Braiding Lounge. Premium braiding, natural hair services & custom color — open 24/7 in The Woodlands, TX.",
  keywords: [
    "luxury braiding lounge",
    "hair braiding The Woodlands TX",
    "knotless braids",
    "goddess braids",
    "natural hair services",
    "box braids",
    "open 24/7 braiding",
    "Nubian Luxe",
    "Taliah Mason",
  ],
  openGraph: {
    title: "Nubian Luxe | Luxury Braiding Lounge",
    description:
      "Premium braiding, natural hair & color services. Honoring the craft, elevating the experience. Open 24/7 in The Woodlands, TX.",
    images: [
      {
        url: "/assets/preview-image1.png?v=4",
        width: 1024,
        height: 571,
        alt: "Nubian Luxe Braiding Lounge",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "Nubian Luxe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nubian Luxe | Luxury Braiding Lounge",
    description:
      "Premium braiding, natural hair & color services. Open 24/7 in The Woodlands, TX.",
    images: [{ url: "/assets/preview-image1.png?v=4", alt: "Nubian Luxe" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${cormorant.variable} ${dmSans.variable} ${italiana.variable}`}
      >
        <body
          style={{ fontFamily: "var(--font-body)" }}
          className="bg-obsidian text-ivory antialiased"
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
