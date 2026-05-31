"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { Accommodation } from "@/generated/prisma/client";
import { getAccommodationIcon } from "@/lib/accommodation-icons";
import { updateAccommodation } from "@/app/actions/admin";

type EditableAccommodation = {
  title: string;
  bulletPoints: string[];
};

function toEditable(accommodation: Accommodation): EditableAccommodation {
  return {
    title: accommodation.title,
    bulletPoints:
      accommodation.bulletPoints.length > 0 ? [...accommodation.bulletPoints] : [""],
  };
}

export default function AccommodationsPanel({
  accommodations,
}: {
  accommodations: Accommodation[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(
    accommodations[0]?.id ?? null
  );
  const [drafts, setDrafts] = useState<Record<string, EditableAccommodation>>(() =>
    Object.fromEntries(accommodations.map((item) => [item.id, toEditable(item)]))
  );
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function updateDraft(id: string, updater: (draft: EditableAccommodation) => EditableAccommodation) {
    setDrafts((current) => ({
      ...current,
      [id]: updater(current[id] ?? { title: "", bulletPoints: [""] }),
    }));
    setSavedId(null);
    setError("");
  }

  function handleSave(id: string) {
    const draft = drafts[id];
    if (!draft?.title.trim()) {
      setError("Each card needs a title before saving.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await updateAccommodation(id, {
          title: draft.title,
          bulletPoints: draft.bulletPoints,
        });
        setSavedId(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save accommodation.");
      }
    });
  }

  return (
    <div className="max-w-4xl">
      <p className="font-body text-ivory/40 text-sm mb-6">
        Edit each Signature Accommodations card on the homepage. Add bullet points under any title,
        then save — the live site updates immediately.
      </p>

      {error && (
        <div className="glass-card px-4 py-3 mb-4 border-red-500/20">
          <p className="text-red-400 font-body text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {accommodations.map((item) => {
          const Icon = getAccommodationIcon(item.icon);
          const draft = drafts[item.id] ?? toEditable(item);
          const isExpanded = expandedId === item.id;
          const isSaved = savedId === item.id && !isPending;

          return (
            <div key={item.id} className="glass-card overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-ivory text-sm truncate">{draft.title || item.title}</p>
                    <p className="font-body text-ivory/30 text-xs mt-0.5">
                      {draft.bulletPoints.filter((point) => point.trim()).length} bullet
                      {draft.bulletPoints.filter((point) => point.trim()).length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <span className="font-body text-ivory/30 text-xs tracking-widest uppercase shrink-0">
                  {isExpanded ? "Close" : "Edit"}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-[rgba(201,168,76,0.1)]">
                  <div className="pt-5 space-y-5">
                    <div>
                      <label className="block font-body text-ivory/50 text-xs tracking-widest uppercase mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) =>
                          updateDraft(item.id, (current) => ({
                            ...current,
                            title: e.target.value,
                          }))
                        }
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-body text-ivory/50 text-xs tracking-widest uppercase">
                          Bullet Points
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft(item.id, (current) => ({
                              ...current,
                              bulletPoints: [...current.bulletPoints, ""],
                            }))
                          }
                          className="inline-flex items-center gap-1 font-body text-xs tracking-widest uppercase text-gold hover:text-[#d4b05a] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>

                      <div className="space-y-2">
                        {draft.bulletPoints.map((point, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={point}
                              placeholder="Bullet point text"
                              onChange={(e) =>
                                updateDraft(item.id, (current) => ({
                                  ...current,
                                  bulletPoints: current.bulletPoints.map((existing, i) =>
                                    i === index ? e.target.value : existing
                                  ),
                                }))
                              }
                              className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40 placeholder-ivory/20"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft(item.id, (current) => ({
                                  ...current,
                                  bulletPoints:
                                    current.bulletPoints.length === 1
                                      ? [""]
                                      : current.bulletPoints.filter((_, i) => i !== index),
                                }))
                              }
                              className="shrink-0 w-10 h-10 border border-[rgba(201,168,76,0.15)] text-ivory/50 hover:text-red-400 hover:border-red-500/20 transition-colors flex items-center justify-center"
                              aria-label="Remove bullet point"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSave(item.id)}
                        disabled={isPending}
                        className="btn-gold text-xs px-6 py-2.5 disabled:opacity-50"
                      >
                        {isPending ? "Saving…" : "Save Card"}
                      </button>
                      {isSaved && (
                        <p className="font-body text-emerald-400 text-xs tracking-wide">
                          Saved — homepage updated
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
