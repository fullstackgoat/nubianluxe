"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { PriceListCategoryWithServices } from "@/lib/price-list-data";
import { updatePriceListService } from "@/app/actions/admin";

type EditableService = {
  title: string;
  description: string;
  bulletPoints: string[];
};

function toEditable(service: PriceListCategoryWithServices["services"][number]): EditableService {
  return {
    title: service.title,
    description: service.description,
    bulletPoints:
      service.bulletPoints.length > 0 ? [...service.bulletPoints] : [""],
  };
}

export default function PriceListPanel({
  categories,
}: {
  categories: PriceListCategoryWithServices[];
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, EditableService>>(() => {
    const entries: [string, EditableService][] = [];
    for (const category of categories) {
      for (const service of category.services) {
        entries.push([service.id, toEditable(service)]);
      }
    }
    return Object.fromEntries(entries);
  });
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? categories[0];

  function updateDraft(id: string, updater: (draft: EditableService) => EditableService) {
    setDrafts((current) => ({
      ...current,
      [id]: updater(current[id] ?? { title: "", description: "", bulletPoints: [""] }),
    }));
    setSavedId(null);
    setError("");
  }

  function handleSave(id: string) {
    const draft = drafts[id];
    if (!draft?.title.trim()) {
      setError("Each service needs a title before saving.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await updatePriceListService(id, {
          title: draft.title,
          description: draft.description,
          bulletPoints: draft.bulletPoints,
        });
        setSavedId(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save service.");
      }
    });
  }

  if (!activeCategory) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-ivory/30 font-body text-sm">No price list services found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <p className="font-body text-ivory/40 text-sm mb-6">
        Edit each service on the Price List section. Update titles, descriptions, and bullet points,
        then save — the live site updates immediately.
      </p>

      {error && (
        <div className="glass-card px-4 py-3 mb-4 border-red-500/20">
          <p className="text-red-400 font-body text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              setActiveCategoryId(category.id);
              setExpandedId(null);
            }}
            className={`font-body text-xs tracking-widest uppercase px-4 py-2 border transition-colors ${
              activeCategory.id === category.id
                ? "border-gold text-gold bg-gold/10"
                : "border-[rgba(201,168,76,0.15)] text-ivory/40 hover:text-ivory/70"
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeCategory.services.map((service) => {
          const draft = drafts[service.id] ?? toEditable(service);
          const isExpanded = expandedId === service.id;
          const isSaved = savedId === service.id && !isPending;
          const bulletCount = draft.bulletPoints.filter((point) => point.trim()).length;

          return (
            <div key={service.id} className="glass-card overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : service.id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-body text-ivory text-sm truncate">{draft.title || service.title}</p>
                  <p className="font-body text-ivory/30 text-xs mt-0.5">
                    {service.price}
                    {bulletCount > 0 ? ` · ${bulletCount} bullet${bulletCount === 1 ? "" : "s"}` : ""}
                  </p>
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
                        Service Title
                      </label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) =>
                          updateDraft(service.id, (current) => ({
                            ...current,
                            title: e.target.value,
                          }))
                        }
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40"
                      />
                    </div>

                    <div>
                      <label className="block font-body text-ivory/50 text-xs tracking-widest uppercase mb-2">
                        Description
                      </label>
                      <textarea
                        value={draft.description}
                        rows={3}
                        onChange={(e) =>
                          updateDraft(service.id, (current) => ({
                            ...current,
                            description: e.target.value,
                          }))
                        }
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40 resize-y min-h-[88px]"
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
                            updateDraft(service.id, (current) => ({
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
                                updateDraft(service.id, (current) => ({
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
                                updateDraft(service.id, (current) => ({
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
                        onClick={() => handleSave(service.id)}
                        disabled={isPending}
                        className="btn-gold text-xs px-6 py-2.5 disabled:opacity-50"
                      >
                        {isPending ? "Saving…" : "Save Service"}
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
