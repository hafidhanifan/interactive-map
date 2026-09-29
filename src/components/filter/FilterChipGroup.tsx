"use client";

import type { FacetOption } from "@/hooks/use-umkm-filter";

type FilterChipGroupProps = {
  title: string;
  options: readonly FacetOption[];
  selected: readonly string[];
  onToggle: (value: string) => void;
};

/**
 * A set of togglable chips for one filter dimension.
 *
 * Nothing selected means no restriction, which is why there is no "all"
 * chip: an empty selection already is "all".
 */
export function FilterChipGroup({
  title,
  options,
  selected,
  onToggle,
}: FilterChipGroupProps) {
  if (options.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold">{title}</p>

      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = selected.includes(option.value);
          const background = isActive ? "var(--brand)" : "var(--surface-muted)";
          const text = isActive ? "var(--surface)" : "var(--ink-muted)";

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              aria-pressed={isActive}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium"
              style={{ backgroundColor: background, color: text }}
            >
              {option.label} ({option.count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
