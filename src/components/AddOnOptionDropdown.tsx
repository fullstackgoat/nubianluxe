"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import {
  formatBulletCostDisplay,
  formatBulletPointMeta,
  normalizeBulletPointsForSave,
  type PriceListBulletPoint,
} from "@/lib/price-list-bullets";

interface Props {
  bulletPoints: PriceListBulletPoint[];
  pricedIndices: number[];
  selectedIndices: number[];
  onToggle: (index: number) => void;
  onOpenChange?: (open: boolean) => void;
  idPrefix?: string;
  placeholder?: string;
}

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

export default function AddOnOptionDropdown({
  bulletPoints,
  pricedIndices,
  selectedIndices,
  onToggle,
  onOpenChange,
  idPrefix = "addon",
  placeholder = "Select option",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const normalized = normalizeBulletPointsForSave(bulletPoints);

  const selectedIndex = selectedIndices.find((index) => pricedIndices.includes(index));
  const selectedPoint =
    selectedIndex !== undefined ? normalized[selectedIndex] : undefined;

  useEffect(() => setMounted(true), []);

  const setDropdownOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();

    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleToggle = (index: number) => {
    onToggle(index);
    setDropdownOpen(false);
  };

  const menu =
    open && mounted && menuPosition ? (
      <ul
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-label="Select options"
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
        }}
        className="fixed z-[200] max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-[var(--color-obsidian-soft)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] py-1"
      >
        {pricedIndices.map((index) => {
          const point = normalized[index];
          if (!point) return null;

          const isChecked = selectedIndices.includes(index);
          const meta = formatBulletPointMeta(point);
          const addOnLabel = formatBulletCostDisplay(point.cost);

          return (
            <li key={`${idPrefix}-${index}`} role="presentation">
              <label
                className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-200 ${
                  isChecked
                    ? "bg-[rgba(201,168,76,0.12)]"
                    : "hover:bg-[rgba(255,255,255,0.04)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(index)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-gold)] cursor-pointer"
                />
                <span className="min-w-0 flex-1 text-left">
                  <span className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-white/80 text-xs capitalize">{point.label}</span>
                    {addOnLabel && (
                      <span className="text-[var(--color-gold)] text-xs font-semibold shrink-0">
                        {addOnLabel}
                      </span>
                    )}
                  </span>
                  {meta && (
                    <span className="text-white/30 text-[0.65rem] block mt-1">{meta}</span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setDropdownOpen(!open)}
        className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg border text-left transition-all duration-300 ${
          open || selectedPoint
            ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.08)]"
            : "border-white/10 hover:border-white/25 bg-[rgba(255,255,255,0.02)]"
        }`}
      >
        <span className="min-w-0 flex-1">
          {selectedPoint ? (
            <>
              <span className="text-white/80 text-xs capitalize block truncate">
                {selectedPoint.label}
              </span>
              {formatBulletCostDisplay(selectedPoint.cost) && (
                <span className="text-[var(--color-gold)] text-xs font-semibold">
                  {formatBulletCostDisplay(selectedPoint.cost)}
                </span>
              )}
            </>
          ) : (
            <span className="text-white/45 text-xs">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[var(--color-gold-dark)] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
