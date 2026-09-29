"use client";

import type { ComponentProps } from "react";

import { FilterContent } from "./FilterContent";

type FilterSheetProps = ComponentProps<typeof FilterContent> & {
  open: boolean;
  onClose: () => void;
};

/**
 * Phone layout: a sheet that rises from the bottom when opened.
 *
 * Hidden from md upwards, where the sidebar is always visible instead.
 */

export function FilterSheet({
  open,
  onClose,
  ...contentProps
}: FilterSheetProps) {
  if (!open) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-600 md:hidden">
      <section
        className="pointer-events-auto mx-3 mb-3 max-h-[75dvh] overflow-y-auto rounded-(--panel-radius) border border-border bg-surface p-4"
        style={{ boxShadow: "var(--panel-shadow)" }}
        aria-label="Filter data"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Filter</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-ink-muted"
          >
            Tutup
          </button>
        </div>

        <FilterContent {...contentProps} />
      </section>
    </div>
  );
}
