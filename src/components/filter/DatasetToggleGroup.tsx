"use client";

import { DATASETS } from "@/lib/datasets";
import type { DatasetId } from "@/types/dataset";

type DatasetToggleGroupProps = {
  active: readonly DatasetId[];
  onToggle: (id: DatasetId) => void;
};

export function DatasetToggleGroup({
  active,
  onToggle,
}: DatasetToggleGroupProps) {
  return (
    <div>
      <p className="text-xs font-semibold">Kategori data</p>

      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {DATASETS.map((dataset) => {
          const isActive = active.includes(dataset.id);

          return (
            <button
              key={dataset.id}
              type="button"
              onClick={() => onToggle(dataset.id)}
              aria-pressed={isActive}
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: isActive
                  ? `var(${dataset.colorVariable})`
                  : "var(--surface-muted)",
                color: isActive ? "var(--surface)" : "var(--ink-muted)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isActive
                    ? "var(--surface)"
                    : `var(${dataset.colorVariable})`,
                }}
              />
              {dataset.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
