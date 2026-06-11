"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { PriceListCategoryWithServices } from "@/lib/price-list-data";
import {
  createPriceListService,
  deletePriceListService,
  resyncStripeCatalog,
  updatePriceListService,
} from "@/app/actions/admin";
import {
  countFilledBulletPoints,
  EMPTY_BULLET_POINT,
  type PriceListBulletPoint,
} from "@/lib/price-list-bullets";

type EditableService = {
  title: string;
  price: string;
  description: string;
  duration: number;
  bulletPoints: PriceListBulletPoint[];
};

const EMPTY_DRAFT: EditableService = {
  title: "",
  price: "",
  description: "",
  duration: 180,
  bulletPoints: [{ ...EMPTY_BULLET_POINT }],
};

function toEditable(service: PriceListCategoryWithServices["services"][number]): EditableService {
  return {
    title: service.title,
    price: service.price,
    description: service.description,
    duration: service.duration,
    bulletPoints:
      service.bulletPoints.length > 0
        ? service.bulletPoints.map((point) => ({ ...point }))
        : [{ ...EMPTY_BULLET_POINT }],
  };
}

function ServiceFormFields({
  draft,
  onChange,
}: {
  draft: EditableService;
  onChange: (updater: (current: EditableService) => EditableService) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-ivory/50 text-xs tracking-widest uppercase mb-2">
            Service Title
          </label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) =>
              onChange((current) => ({ ...current, title: e.target.value }))
            }
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40"
          />
        </div>
        <div>
          <label className="block font-body text-ivory/50 text-xs tracking-widest uppercase mb-2">
            Price
          </label>
          <input
            type="text"
            value={draft.price}
            placeholder="$150+"
            onChange={(e) =>
              onChange((current) => ({ ...current, price: e.target.value }))
            }
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40 placeholder-ivory/20"
          />
        </div>
      </div>

      <div>
        <label className="block font-body text-ivory/50 text-xs tracking-widest uppercase mb-2">
          Duration (minutes)
        </label>
        <input
          type="number"
          min={15}
          step={15}
          value={draft.duration}
          onChange={(e) =>
            onChange((current) => ({
              ...current,
              duration: Math.max(15, Number(e.target.value) || 180),
            }))
          }
          className="w-full sm:w-40 bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40"
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
            onChange((current) => ({ ...current, description: e.target.value }))
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
              onChange((current) => ({
                ...current,
                bulletPoints: [...current.bulletPoints, { ...EMPTY_BULLET_POINT }],
              }))
            }
            className="inline-flex items-center gap-1 font-body text-xs tracking-widest uppercase text-gold hover:text-[#d4b05a] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        <div className="space-y-3">
          {draft.bulletPoints.map((point, index) => (
            <div
              key={index}
              className="p-3 border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block font-body text-ivory/40 text-[0.65rem] tracking-widest uppercase mb-1.5">
                      Label
                    </label>
                    <input
                      type="text"
                      value={point.label}
                      placeholder="e.g. Small, Medium, Large"
                      onChange={(e) =>
                        onChange((current) => ({
                          ...current,
                          bulletPoints: current.bulletPoints.map((existing, i) =>
                            i === index ? { ...existing, label: e.target.value } : existing
                          ),
                        }))
                      }
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40 placeholder-ivory/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-body text-ivory/40 text-[0.65rem] tracking-widest uppercase mb-1.5">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min={15}
                        step={15}
                        value={point.duration ?? ""}
                        placeholder="Optional"
                        onChange={(e) =>
                          onChange((current) => ({
                            ...current,
                            bulletPoints: current.bulletPoints.map((existing, i) =>
                              i === index
                                ? {
                                    ...existing,
                                    duration: e.target.value
                                      ? Math.max(15, Number(e.target.value) || 15)
                                      : null,
                                  }
                                : existing
                            ),
                          }))
                        }
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40 placeholder-ivory/20"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-ivory/40 text-[0.65rem] tracking-widest uppercase mb-1.5">
                        Cost
                      </label>
                      <input
                        type="text"
                        value={point.cost ?? ""}
                        placeholder="$150+"
                        onChange={(e) =>
                          onChange((current) => ({
                            ...current,
                            bulletPoints: current.bulletPoints.map((existing, i) =>
                              i === index
                                ? {
                                    ...existing,
                                    cost: e.target.value.trim() ? e.target.value : null,
                                  }
                                : existing
                            ),
                          }))
                        }
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-gold/40 placeholder-ivory/20"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onChange((current) => ({
                      ...current,
                      bulletPoints:
                        current.bulletPoints.length === 1
                          ? [{ ...EMPTY_BULLET_POINT }]
                          : current.bulletPoints.filter((_, i) => i !== index),
                    }))
                  }
                  className="shrink-0 w-10 h-10 border border-[rgba(201,168,76,0.15)] text-ivory/50 hover:text-red-400 hover:border-red-500/20 transition-colors flex items-center justify-center mt-6"
                  aria-label="Remove bullet point"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PriceListPanel({
  categories,
}: {
  categories: PriceListCategoryWithServices[];
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createDraft, setCreateDraft] = useState<EditableService>(EMPTY_DRAFT);
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
  const [createdMessage, setCreatedMessage] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? categories[0];

  function updateDraft(id: string, updater: (draft: EditableService) => EditableService) {
    setDrafts((current) => ({
      ...current,
      [id]: updater(current[id] ?? EMPTY_DRAFT),
    }));
    setSavedId(null);
    setError("");
  }

  function validateDraft(draft: EditableService) {
    if (!draft.title.trim()) return "Each service needs a title before saving.";
    if (!draft.price.trim()) return "Each service needs a price (e.g. $150+).";
    if (!/\$[\d,]+/.test(draft.price.trim())) {
      return 'Price must include a dollar amount (e.g. "$150+" or "$75").';
    }
    if (draft.duration < 15) return "Duration must be at least 15 minutes.";
    return "";
  }

  function handleSave(id: string) {
    const draft = drafts[id];
    const validationError = validateDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await updatePriceListService(id, {
        title: draft.title,
        price: draft.price,
        description: draft.description,
        duration: draft.duration,
        bulletPoints: draft.bulletPoints,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.warning) {
        setSyncMessage(result.warning);
      }
      setSavedId(id);
      router.refresh();
    });
  }

  function handleResyncStripe() {
    if (
      !window.confirm(
        "Re-sync all price list services to Stripe for the current mode (live on production)? Existing Stripe product links will be replaced."
      )
    ) {
      return;
    }

    setError("");
    setSyncMessage("");
    setCreatedMessage("");
    startTransition(async () => {
      try {
        let offset = 0;
        let totalSynced = 0;
        let totalFailed = 0;
        const failureMessages: string[] = [];
        let mode = "LIVE";

        while (true) {
          const result = await resyncStripeCatalog({ offset, limit: 4 });
          mode = result.mode;
          totalSynced += result.synced;
          totalFailed += result.failed;
          failureMessages.push(...result.errors.map((e) => `${e.title}: ${e.message}`));
          if (result.done || result.nextOffset === null) break;
          offset = result.nextOffset;
        }

        if (totalFailed > 0) {
          setError(
            `${totalFailed} service${totalFailed === 1 ? "" : "s"} failed to sync. ${failureMessages.slice(0, 3).join(" · ")}`
          );
        }

        if (totalSynced > 0) {
          setSyncMessage(
            `Stripe ${mode} sync — ${totalSynced} service${totalSynced === 1 ? "" : "s"} linked${totalFailed > 0 ? `, ${totalFailed} failed` : ""}.`
          );
        } else if (totalFailed === 0) {
          setSyncMessage(`Stripe ${mode} sync complete — all services already linked.`);
        }

        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to sync Stripe catalog.");
      }
    });
  }

  function handleDelete(id: string, title: string) {
    if (
      !window.confirm(
        `Delete "${title}"? This removes it from the price list, footer, booking flow, and archives its Stripe product.`
      )
    ) {
      return;
    }

    setError("");
    setCreatedMessage("");
    setSyncMessage("");
    startTransition(async () => {
      const result = await deletePriceListService(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setExpandedId(null);
      setDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setCreatedMessage(
        result.warning
          ? `"${result.title}" deleted. ${result.warning}`
          : `"${result.title}" deleted.`
      );
      router.refresh();
    });
  }

  function handleCreate() {
    if (!activeCategory) return;

    const validationError = validateDraft(createDraft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    startTransition(async () => {
      const title = createDraft.title.trim();
      try {
        const result = await createPriceListService(activeCategory.id, {
          title: createDraft.title,
          price: createDraft.price,
          description: createDraft.description,
          duration: createDraft.duration,
          bulletPoints: createDraft.bulletPoints,
        });
        setCreateDraft(EMPTY_DRAFT);
        setShowCreateForm(false);
        setCreatedMessage(
          result.stripeLinked
            ? `"${title}" added to ${activeCategory.title} and synced to Stripe.`
            : `"${title}" added to ${activeCategory.title}. Stripe sync failed — use Re-sync Stripe Catalog.`
        );
        setExpandedId(result.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create service.");
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <p className="font-body text-ivory/40 text-sm">
          Manage services on the Price List. Add new services with automatic Stripe product creation,
          or edit titles, prices, descriptions, and bullet points — changes go live immediately.
        </p>
        <button
          type="button"
          onClick={handleResyncStripe}
          disabled={isPending}
          className="shrink-0 font-body text-xs tracking-widest uppercase text-ivory/50 border border-[rgba(201,168,76,0.2)] px-4 py-2.5 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-50"
        >
          {isPending ? "Syncing…" : "Re-sync Stripe Catalog"}
        </button>
      </div>

      {error && (
        <div className="glass-card px-4 py-3 mb-4 border-red-500/20">
          <p className="text-red-400 font-body text-sm">{error}</p>
        </div>
      )}

      {createdMessage && (
        <div className="glass-card px-4 py-3 mb-4 border-emerald-500/20">
          <p className="text-emerald-400 font-body text-sm">{createdMessage}</p>
        </div>
      )}

      {syncMessage && (
        <div className="glass-card px-4 py-3 mb-4 border-emerald-500/20">
          <p className="text-emerald-400 font-body text-sm">{syncMessage}</p>
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
              setShowCreateForm(false);
              setCreatedMessage("");
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

      <div className="mb-4">
        {!showCreateForm ? (
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(true);
              setCreateDraft(EMPTY_DRAFT);
              setExpandedId(null);
              setCreatedMessage("");
              setError("");
            }}
            className="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-gold border border-gold/30 px-4 py-2.5 hover:bg-gold/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service to {activeCategory.title}
          </button>
        ) : (
          <div className="glass-card p-5 border-gold/20">
            <div className="flex items-center justify-between mb-5">
              <p className="font-body text-ivory text-sm tracking-wide">
                New service — {activeCategory.title}
              </p>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="font-body text-ivory/40 text-xs tracking-widest uppercase hover:text-ivory/70"
              >
                Cancel
              </button>
            </div>

            <ServiceFormFields
              draft={createDraft}
              onChange={(updater) => {
                setCreateDraft((current) => updater(current));
                setError("");
              }}
            />

            <div className="flex items-center gap-4 pt-5 mt-5 border-t border-[rgba(201,168,76,0.1)]">
              <button
                type="button"
                onClick={handleCreate}
                disabled={isPending}
                className="btn-gold text-xs px-6 py-2.5 disabled:opacity-50"
              >
                {isPending ? "Creating…" : "Create & Sync to Stripe"}
              </button>
              <p className="font-body text-ivory/30 text-xs">
                Creates a Stripe product + price and adds the service to booking.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {activeCategory.services.map((service) => {
          const draft = drafts[service.id] ?? toEditable(service);
          const isExpanded = expandedId === service.id;
          const isSaved = savedId === service.id && !isPending;
          const bulletCount = countFilledBulletPoints(draft.bulletPoints);

          return (
            <div key={service.id} className="glass-card overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setExpandedId(isExpanded ? null : service.id);
                  setShowCreateForm(false);
                }}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-body text-ivory text-sm truncate">{draft.title || service.title}</p>
                  <p className="font-body text-ivory/30 text-xs mt-0.5">
                    {draft.price || service.price}
                    {draft.duration ? ` · ${draft.duration} min` : ""}
                    {bulletCount > 0 ? ` · ${bulletCount} bullet${bulletCount === 1 ? "" : "s"}` : ""}
                    {service.stripeProductId ? " · Stripe linked" : ""}
                  </p>
                </div>
                <span className="font-body text-ivory/30 text-xs tracking-widest uppercase shrink-0">
                  {isExpanded ? "Close" : "Edit"}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-[rgba(201,168,76,0.1)]">
                  <div className="pt-5">
                    <ServiceFormFields
                      draft={draft}
                      onChange={(updater) => updateDraft(service.id, updater)}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 mt-5 border-t border-[rgba(201,168,76,0.1)]">
                      <div className="flex items-center gap-4">
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
                            Saved — homepage and Stripe updated
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(service.id, draft.title || service.title)}
                        disabled={isPending}
                        className="font-body text-xs tracking-widest uppercase border border-red-500/20 text-red-400 hover:bg-red-500/10 px-4 py-2.5 transition-colors disabled:opacity-50"
                      >
                        Delete Service
                      </button>
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
