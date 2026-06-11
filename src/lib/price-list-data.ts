export type DefaultPriceListService = {
  title: string;
  price: string;
  description: string;
  bulletPoints: import("@/lib/price-list-bullets").PriceListBulletPoint[];
  bookingUrl: string;
};

export type DefaultPriceListCategory = {
  id: string;
  title: string;
  accent: string;
  sortOrder: number;
  services: DefaultPriceListService[];
};

export const DEFAULT_PRICE_LIST_CATEGORIES: DefaultPriceListCategory[] = [
  {
    id: "extensions",
    title: "Braid Extension Services",
    accent: "var(--color-blush)",
    sortOrder: 0,
    services: [
      {
        title: "Boho / Goddess Braids",
        price: "$300+",
        description: "Knotless braids with flowing human hair curls. Size large to small, 80–150 braids.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Boho%2FGoddess%20Braids",
      },
      {
        title: "Box Braids",
        price: "$100+",
        description: "Classic top-knot braids. Size XX-large to XX-small, 15–250 braids.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Box%20Braids",
      },
      {
        title: "Cornrows",
        price: "$150+",
        description: "Straight backs to custom designed styles. Up to 50 rows.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Cornrows",
      },
      {
        title: "Crochet Braids",
        price: "$100+",
        description: "Pre-looped hair crocheted into cornrow base.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Crochet%20Braids",
      },
      {
        title: "Fulani / Tribal Braids",
        price: "$200+",
        description: "Patterned cornrows with individual braid combo.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Fulani%2FTribal%20Braids",
      },
      {
        title: "Knotless Braids",
        price: "$150+",
        description: "Lightweight, tension-free braids with seamless feed-in technique. 15–250 braids.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Knotless%20Braids",
      },
      {
        title: "Illusion Locs",
        price: "$200+",
        description: "Palm-rolled locs base, two-strand twist extensions wrapped for a natural loc look.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Locs",
      },
      {
        title: "Mermaid Locs",
        price: "$300+",
        description: "Long, boho locs with flowing human hair curls added.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Locs",
      },
      {
        title: "Twist",
        price: "$100+",
        description: "Two-strand twist with straight, curly, or kinky hair. Size XX-large to XX-small.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Twist",
      },
    ],
  },
  {
    id: "natural",
    title: "Natural Hair Services",
    accent: "var(--color-gold)",
    sortOrder: 1,
    services: [
      {
        title: "Cornrows",
        price: "$75+",
        description: "Scalp braids with no added hair.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Cornrows",
      },
      {
        title: "Loc Maintenance",
        price: "$120+",
        description: "Retwist or retie.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Loc%20Maintenance",
      },
      {
        title: "Coils",
        price: "$125+",
        description: "Palm-roll root and defined finger coils. Size large to XX-small, 80–250 coils.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Service%20Coils",
      },
      {
        title: "Plats",
        price: "$75+",
        description: "Individual box-style braids using only your natural hair. 15–250 plats.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Service%20Plats",
      },
      {
        title: "Twist",
        price: "$75+",
        description: "Two-strand twist using only your natural hair. 15–250 twists.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Service%20Twist",
      },
      {
        title: "Illusion Locs",
        price: "$150+",
        description: "Faux loc look using only natural hair — no loc commitment.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Service%20Illusion%20Loc%20Two%20Strand",
      },
    ],
  },
  {
    id: "other",
    title: "Add-On Services",
    accent: "var(--color-blush-dark)",
    sortOrder: 2,
    services: [
      {
        title: "Braid Prep",
        price: "$75+",
        description: "Professional sectioning to save you time — perfect before braiding your own hair.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Other%20Service%20Braid%20Prep",
      },
      {
        title: "Hair Color",
        price: "$50+",
        description: "Professional color with bond treatment, conditioning, and color-safe toning. Book as add-on or standalone.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Other%20Natural%20Hair%20Services",
      },
      {
        title: "Olaplex Conditioning",
        price: "$45+",
        description: "Strengthens and repairs bonds with nano steam technology and deep moisture infusion.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Extension%20Services",
      },
      {
        title: "Detangling",
        price: "$100+",
        description: "Gentle removal of knots, mats, or shed hair with patience and care.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Extension%20Services",
      },
      {
        title: "Braid Take Down",
        price: "$100+",
        description: "Safe braid removal, thorough detangling, shampoo, deep conditioning, and blow-dry.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Extension%20Services",
      },
      {
        title: "Wig Braid Down",
        price: "$75",
        description: "Flat, comfortable braid foundation tailored for wig installs or protective styling.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Extension%20Services",
      },
    ],
  },
  {
    id: "children",
    title: "Children's Services",
    accent: "var(--color-gold-light)",
    sortOrder: 3,
    services: [
      {
        title: "Extensions",
        price: "$70+",
        description: "Boho, box, cornrows, crochet, illusion locs, knotless & twist.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Services%20Natural%20Hair",
      },
      {
        title: "Natural",
        price: "$50+",
        description: "Coils, cornrows, crochet, detangling, illusion locs, plats, retie, retwist, twist.",
        bulletPoints: [],
        bookingUrl: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Services%20Natural%20Hair",
      },
    ],
  },
];

import type { PriceListBulletPoint } from "@/lib/price-list-bullets";

export type PriceListCategoryWithServices = {
  id: string;
  title: string;
  accent: string;
  sortOrder: number;
  services: {
    id: string;
    categoryId: string;
    title: string;
    price: string;
    description: string;
    bulletPoints: PriceListBulletPoint[];
    bookingUrl: string;
    duration: number;
    stripeProductId: string | null;
    stripePriceId: string | null;
    sortOrder: number;
  }[];
};
