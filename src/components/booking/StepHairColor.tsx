"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Palette } from "lucide-react";
import WizardStepNav from "./WizardStepNav";
import {
  HAIR_COLOR_CATEGORIES,
  getHairColorCategory,
  getHairColorRequirement,
  type HairColorRequirement,
} from "@/lib/hair-colors";
import type { BookingState } from "./BookingWizard";

interface Props {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepHairColor({ state, update, onNext, onBack }: Props) {
  const requirement = getHairColorRequirement(state.serviceCategoryId);
  const [categoryId, setCategoryId] = useState(state.hairColorCategory || HAIR_COLOR_CATEGORIES[0].id);
  const [colorValue, setColorValue] = useState(state.hairColorValue);
  const [skipped, setSkipped] = useState(state.hairColorSkipped);

  const selectedCategory = getHairColorCategory(categoryId) ?? HAIR_COLOR_CATEGORIES[0];

  const canProceed =
    requirement === "optional"
      ? skipped || colorValue.trim().length > 0
      : colorValue.trim().length > 0;

  function selectCategory(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    setSkipped(false);
    update({ hairColorCategory: nextCategoryId, hairColorSkipped: false });
  }

  function handleColorChange(value: string) {
    setColorValue(value);
    setSkipped(false);
    update({
      hairColorCategory: categoryId,
      hairColorValue: value,
      hairColorSkipped: false,
    });
  }

  function handleSkipOptional() {
    setSkipped(true);
    setColorValue("");
    update({
      hairColorCategory: "",
      hairColorValue: "",
      hairColorSkipped: true,
    });
    onNext();
  }

  function handleContinue() {
    if (!canProceed) return;
    update({
      hairColorCategory: categoryId,
      hairColorValue: colorValue.trim(),
      hairColorSkipped: false,
    });
    onNext();
  }

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="wizard-step-title font-light text-white italic mb-1"
        >
          Select Your Hair Color
        </h2>
        <p className="text-white/40 text-sm">
          Choose your collection and enter the color number from the chart for{" "}
          <span className="text-white/70">{state.service}</span>.
        </p>
      </div>

      <RequirementNote requirement={requirement} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {HAIR_COLOR_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => selectCategory(category.id)}
            className={`px-3 py-2.5 rounded-lg text-xs tracking-[0.08em] uppercase font-medium border transition-all duration-300 text-left ${
              categoryId === category.id
                ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-obsidian)]"
                : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="glass-card p-4 sm:p-5 space-y-4 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)] mb-1">
              Color Chart
            </p>
            <p className="text-white/70 text-sm">{selectedCategory.description}</p>
          </div>
          <a
            href="/#colors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--color-gold-dark)] text-xs tracking-widest uppercase hover:text-[var(--color-gold)] transition-colors shrink-0"
          >
            Full chart
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-4">
          {selectedCategory.images.map((image, index) => (
            <div
              key={`${selectedCategory.id}-${index}`}
              className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-white/5"
            >
              <Image
                src={image}
                alt={`${selectedCategory.name} chart ${index + 1}`}
                width={1200}
                height={900}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-[0.65rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)] mb-2">
            Your Color Selection
          </label>
          <input
            type="text"
            value={colorValue}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder={selectedCategory.selectionHint}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-gold/40 placeholder-white/20"
          />
          <p className="text-white/30 text-xs mt-2">
            Reference the chart above and enter the exact color number or blend code you need.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {requirement === "optional" && (
          <button
            type="button"
            onClick={handleSkipOptional}
            className="btn-outline w-full py-3.5 text-xs sm:text-sm"
          >
            No Braiding Hair Needed
          </button>
        )}

        <WizardStepNav
          onBack={onBack}
          onNext={handleContinue}
          nextLabel="Continue — Choose Booking Tier"
          nextDisabled={!canProceed}
        />
      </div>
    </div>
  );
}

function RequirementNote({ requirement }: { requirement: HairColorRequirement }) {
  if (requirement === "none") return null;

  return (
    <div className="flex items-start gap-3 glass-card px-4 py-3 border-[var(--color-gold)]/20">
      <Palette className="w-4 h-4 text-[var(--color-gold)] shrink-0 mt-0.5" />
      <p className="text-white/50 text-sm">
        {requirement === "required"
          ? "A hair color selection is required for extension and children's braiding services."
          : "Optional for natural hair services — skip if you're not adding braiding hair."}
      </p>
    </div>
  );
}
