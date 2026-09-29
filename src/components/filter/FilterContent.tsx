"use client";

import type { ReactNode } from "react";

import type { PointFilterResult } from "@/hooks/use-point-filter";
import type { DatasetId } from "@/types/dataset";
import { DatasetToggleGroup } from "./DatasetToggleGroup";
import { FilterChipGroup } from "./FilterChipGroup";
import { SearchField } from "./SearchField";

type FilterContentProps = {
  filter: PointFilterResult;
  activeDatasets: readonly DatasetId[];
  onToggleDataset: (id: DatasetId) => void;
  loadedCount: number;
  loadingCount: number;
  errors: readonly string[];
  // map controls, shown above the filters in both layouts
  controls: ReactNode;
};

export function FilterContent({
  filter,
  activeDatasets,
  onToggleDataset,
  loadedCount,
  loadingCount,
  errors,
  controls,
}: FilterContentProps) {
  const shown = filter.filtered.length;
  const summary =
    loadingCount > 0
      ? "Memuat data..."
      : shown === loadedCount
        ? `${loadedCount} titik`
        : `${shown} dari ${loadedCount} titik`;

  return (
    <div className="flex flex-col gap-4">
      {controls}

      <DatasetToggleGroup active={activeDatasets} onToggle={onToggleDataset} />

      <SearchField value={filter.query} onChange={filter.setQuery} />

      {filter.facetGroups.map((group) => (
        <FilterChipGroup
          key={group.dataset}
          title={group.title}
          options={group.options}
          selected={filter.selectedFacets}
          onToggle={filter.toggleFacet}
        />
      ))}

      <FilterChipGroup
        title="Padukuhan"
        options={filter.padukuhanOptions}
        selected={filter.selectedPadukuhan}
        onToggle={filter.togglePadukuhan}
      />

      {errors.length > 0 ? (
        <ul
          className="text-[11px]"
          style={{ color: "var(--condition-rusak-berat)" }}
        >
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}

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
