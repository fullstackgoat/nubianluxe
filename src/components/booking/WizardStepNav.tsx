"use client";

import { ArrowLeft } from "lucide-react";

interface Props {
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
}

export default function WizardStepNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  backLabel = "Back",
}: Props) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
      <button
        type="button"
        onClick={onBack}
        className="btn-outline flex items-center justify-center gap-2 px-4 sm:px-5 w-full sm:w-auto shrink-0"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        {backLabel}
      </button>
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`btn-gold flex-1 py-3.5 sm:py-4 text-xs sm:text-sm w-full min-w-0 text-center leading-snug ${
            nextDisabled ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}
