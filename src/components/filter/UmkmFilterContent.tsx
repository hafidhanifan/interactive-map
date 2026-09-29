"use client";

import type { ReactNode } from "react";

import type { UmkmFilterResult } from "@/hooks/use-umkm-filter";
import { FilterChipGroup } from "./FilterChipGroup";
import { SearchField } from "./SearchField";

type UmkmFilterContentProps = {
  filter: UmkmFilterResult;
  totalCount: number;
  /** Map controls, shown above the filters in both layouts. */
  controls: ReactNode;
};

/**
 * Everything inside the filter panel, independent of where it sits.
 *
 * Shared by the sidebar and the sheet so a new filter only has to be
 * added in one place.
 */
export function UmkmFilterContent({
  filter,
  totalCount,
  controls,
}: UmkmFilterContentProps) {
  const shown = filter.filtered.length;
  const summary =
    shown === totalCount
      ? `${totalCount} UMKM`
      : `${shown} dari ${totalCount} UMKM`;

  return (
    <div className="flex flex-col gap-4">
      {controls}

      <SearchField value={filter.query} onChange={filter.setQuery} />

      <FilterChipGroup
        title="Jenis usaha"
        options={filter.categoryOptions}
        selected={filter.selectedCategories}
        onToggle={filter.toggleCategory}
      />

      <FilterChipGroup
        title="Padukuhan"
        options={filter.padukuhanOptions}
        selected={filter.selectedPadukuhan}
        onToggle={filter.togglePadukuhan}
      />

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-xs font-semibold">{summary}</span>

        {filter.hasActiveFilter ? (
          <button
            type="button"
            onClick={filter.reset}
            className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-ink-muted"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
