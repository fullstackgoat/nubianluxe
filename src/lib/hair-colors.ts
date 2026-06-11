export type HairColorCategory = {
  id: string;
  name: string;
  description: string;
  images: string[];
  selectionHint: string;
};

export const HAIR_COLOR_CATEGORIES: HairColorCategory[] = [
  {
    id: "standard",
    name: "EZ Braid Professional | Box Professional",
    description: "Standard professional-grade braiding hair colors",
    images: ["/assets/1.png", "/assets/2.png", "/assets/3.png", "/assets/4.png"],
    selectionHint: "Enter the color number from the chart (e.g. 2, 27, 613)",
  },
  {
    id: "platinum",
    name: "EZ Braid Platinum 2 Tone Collection",
    description: "Premium two-tone ombré braiding hair",
    images: ["/assets/exbraids2platinum.png"],
    selectionHint: "Enter the two-tone color code shown on the chart",
  },
  {
    id: "rainbow",
    name: "EZ Braid Rainbow 3 Tone Collection",
    description: "Vibrant three-tone gradient braiding hair",
    images: ["/assets/exbraidrainbow.png"],
    selectionHint: "Enter the three-tone color code shown on the chart",
  },
  {
    id: "kinky",
    name: "EZ Braid Kinky Afro & Bouncy Twist",
    description: "Textured styles for natural-looking braids and twists",
    images: ["/assets/kinky.png"],
    selectionHint: "Enter the color number from the kinky/bouncy chart",
  },
];

export type HairColorRequirement = "required" | "optional" | "none";

/** Which booking service categories need a hair color selection step. */
export function getHairColorRequirement(categoryId: string): HairColorRequirement {
  if (categoryId === "extensions" || categoryId === "children") return "required";
  if (categoryId === "natural") return "optional";
  return "none";
}

export function getHairColorCategory(id: string): HairColorCategory | undefined {
  return HAIR_COLOR_CATEGORIES.find((category) => category.id === id);
}

export function formatHairColorSelection(categoryId: string, colorValue: string): string {
  const category = getHairColorCategory(categoryId);
  if (!category) return colorValue;
  return `${category.name} — ${colorValue}`;
}
